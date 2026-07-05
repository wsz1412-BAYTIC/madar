import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: admin access required' }, { status: 403 });

    const body = await req.json();
    const { action } = body;
    const sr = base44.asServiceRole;

    // ── Helper: deduplicate existing alerts (don't re-create same-type alerts within 24h) ──
    const hasRecentAlert = async (alertType, userId) => {
      const existing = await sr.entities.SecurityAlert.filter({
        alert_type: alertType,
        user_id: userId || { $ne: null }
      });
      if (!existing || existing.length === 0) return false;
      const now = Date.now();
      return existing.some((a) => {
        const ts = new Date(a.detected_at || a.created_date).getTime();
        return (now - ts) < 24 * 60 * 60 * 1000; // 24h
      });
    };

    const createAlert = async (alertType, severity, userId, userEmail, title, description, metadata) => {
      const recent = await hasRecentAlert(alertType, userId);
      if (recent) return null; // skip duplicate within 24h
      return await sr.entities.SecurityAlert.create({
        alert_type: alertType,
        severity,
        user_id: userId || null,
        user_email: userEmail || null,
        title,
        description,
        metadata: metadata || {},
        status: 'new',
        detected_at: new Date().toISOString(),
      });
    };

    switch (action) {
      // ── Scan for anomalies ──
      case 'scan': {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

        const created = [];
        const stats = { scanned: 0, alertsCreated: 0, checks: [] };

        // 1) Rapid AI API calls — user making >10 AI calls in 1 hour
        try {
          const aiLogs = await sr.entities.AiUsageLog.list('-created_date', 500);
          stats.scanned += aiLogs.length;
          const recentAi = aiLogs.filter((l) => new Date(l.createdAt || l.created_date) > oneHourAgo);
          const byUser = {};
          recentAi.forEach((l) => {
            const uid = l.userId;
            if (!uid) return;
            byUser[uid] = (byUser[uid] || 0) + 1;
          });

          let checkCount = 0;
          for (const [uid, count] of Object.entries(byUser)) {
            if (count > 10) {
              checkCount++;
              // fetch user email
              let email = '';
              try {
                const u = await sr.entities.User.get(uid);
                email = u?.email || '';
              } catch { /* skip */ }
              const alert = await createAlert(
                'rapid_api_calls',
                count > 25 ? 'critical' : 'warning',
                uid,
                email,
                `Rapid AI API activity: ${count} calls in 1 hour`,
                `User ${email || uid.slice(0, 8)} made ${count} AI function calls within the last hour, exceeding the normal threshold of 10.`,
                { callCount: count, window: '1h', threshold: 10 }
              );
              if (alert) created.push(alert);
            }
          }
          stats.checks.push({ check: 'rapid_api_calls', flagged: checkCount });
        } catch { stats.checks.push({ check: 'rapid_api_calls', error: true }); }

        // 2) Repeated AI failures — user with >5 failed/error AI calls in 24h
        try {
          const aiLogs24 = await sr.entities.AiUsageLog.list('-created_date', 1000);
          const recentAi24 = aiLogs24.filter((l) => new Date(l.createdAt || l.created_date) > twentyFourHoursAgo);
          const failedByUser = {};
          recentAi24.forEach((l) => {
            if (l.status === 'failed' || l.status === 'error' || l.status === 'blocked') {
              const uid = l.userId;
              if (!uid) return;
              failedByUser[uid] = (failedByUser[uid] || 0) + 1;
            }
          });

          let failCount = 0;
          for (const [uid, count] of Object.entries(failedByUser)) {
            if (count >= 5) {
              failCount++;
              let email = '';
              try {
                const u = await sr.entities.User.get(uid);
                email = u?.email || '';
              } catch { /* skip */ }
              const alert = await createAlert(
                'repeated_failures',
                count >= 15 ? 'critical' : 'warning',
                uid,
                email,
                `Repeated failed AI calls: ${count} in 24h`,
                `User ${email || uid.slice(0, 8)} had ${count} failed, errored, or blocked AI function calls in the last 24 hours, which may indicate probing or unauthorized usage attempts.`,
                { failedCount: count, window: '24h', threshold: 5 }
              );
              if (alert) created.push(alert);
            }
          }
          stats.checks.push({ check: 'repeated_failures', flagged: failCount });
        } catch { stats.checks.push({ check: 'repeated_failures', error: true }); }

        // 3) Burst property creation — user creating >5 properties in 1 hour
        try {
          const props = await sr.entities.UserProperty.list('-created_date', 500);
          stats.scanned += props.length;
          const recentProps = props.filter((p) => new Date(p.created_date) > oneHourAgo);
          const byUser = {};
          recentProps.forEach((p) => {
            const uid = p.created_by_id;
            if (!uid) return;
            byUser[uid] = (byUser[uid] || 0) + 1;
          });

          let burstCount = 0;
          for (const [uid, count] of Object.entries(byUser)) {
            if (count > 5) {
              burstCount++;
              let email = '';
              try {
                const u = await sr.entities.User.get(uid);
                email = u?.email || '';
              } catch { /* skip */ }
              const alert = await createAlert(
                'burst_property_creation',
                count > 15 ? 'critical' : 'warning',
                uid,
                email,
                `Burst property creation: ${count} in 1 hour`,
                `User ${email || uid.slice(0, 8)} created ${count} properties within the last hour, which may indicate automated or spam activity.`,
                { propertyCount: count, window: '1h', threshold: 5 }
              );
              if (alert) created.push(alert);
            }
          }
          stats.checks.push({ check: 'burst_property_creation', flagged: burstCount });
        } catch { stats.checks.push({ check: 'burst_property_creation', error: true }); }

        // 4) Suspicious admin actions — multiple admin actions by same user in 5 min
        try {
          const auditLogs = await sr.entities.AuditLog.list('-created_date', 200);
          stats.scanned += auditLogs.length;
          const recentAudit = auditLogs.filter((l) => new Date(l.created_date) > fiveMinAgo);
          const byUser = {};
          recentAudit.forEach((l) => {
            const uid = l.acting_user_id;
            if (!uid) return;
            byUser[uid] = (byUser[uid] || 0) + 1;
          });

          let suspiciousCount = 0;
          for (const [uid, count] of Object.entries(byUser)) {
            if (count >= 8) {
              suspiciousCount++;
              let email = '';
              try {
                const u = await sr.entities.User.get(uid);
                email = u?.email || '';
              } catch { /* skip */ }
              const alert = await createAlert(
                'suspicious_admin_actions',
                'critical',
                uid,
                email,
                `Suspicious admin activity: ${count} actions in 5 minutes`,
                `User ${email || uid.slice(0, 8)} performed ${count} administrative actions within 5 minutes, which may indicate compromised admin credentials.`,
                { actionCount: count, window: '5min', threshold: 8 }
              );
              if (alert) created.push(alert);
            }
          }
          stats.checks.push({ check: 'suspicious_admin_actions', flagged: suspiciousCount });
        } catch { stats.checks.push({ check: 'suspicious_admin_actions', error: true }); }

        // 5) Abnormal AI usage — single user consuming >30% of all AI calls in 24h
        try {
          const aiLogs24 = await sr.entities.AiUsageLog.list('-created_date', 1000);
          const recentAi24 = aiLogs24.filter((l) => new Date(l.createdAt || l.created_date) > twentyFourHoursAgo);
          const total = recentAi24.length;
          if (total > 20) {
            const byUser = {};
            recentAi24.forEach((l) => {
              const uid = l.userId;
              if (!uid) return;
              byUser[uid] = (byUser[uid] || 0) + 1;
            });
            let abnormalCount = 0;
            for (const [uid, count] of Object.entries(byUser)) {
              const pct = count / total;
              if (pct > 0.3) {
                abnormalCount++;
                let email = '';
                try {
                  const u = await sr.entities.User.get(uid);
                  email = u?.email || '';
                } catch { /* skip */ }
                const alert = await createAlert(
                  'abnormal_ai_usage',
                  pct > 0.5 ? 'critical' : 'warning',
                  uid,
                  email,
                  `Abnormal AI usage: ${Math.round(pct * 100)}% of all calls in 24h`,
                  `User ${email || uid.slice(0, 8)} consumed ${count} out of ${total} (${Math.round(pct * 100)}%) AI function calls in the last 24 hours, which is abnormally high.`,
                  { callCount: count, totalCalls: total, percentage: Math.round(pct * 100) }
                );
                if (alert) created.push(alert);
              }
            }
            stats.checks.push({ check: 'abnormal_ai_usage', flagged: abnormalCount });
          } else {
            stats.checks.push({ check: 'abnormal_ai_usage', flagged: 0, skipped: 'insufficient_data' });
          }
        } catch { stats.checks.push({ check: 'abnormal_ai_usage', error: true }); }

        // Audit the scan
        await sr.entities.AuditLog.create({
          acting_user_id: user.id,
          acting_user_email: user.email,
          target_entity: 'SecurityAlert',
          action: 'admin_data_access',
          notes: `Security scan completed — ${created.length} new alerts, ${stats.scanned} records scanned`
        });

        stats.alertsCreated = created.length;
        return Response.json({ created, stats });
      }

      // ── List alerts ──
      case 'list_alerts': {
        const limit = body.limit || 100;
        const statusFilter = body.status; // 'new', 'acknowledged', 'resolved', or undefined for all
        const query = statusFilter ? { status: statusFilter } : {};
        const alerts = await sr.entities.SecurityAlert.filter(query, '-detected_at', limit);
        return Response.json({ alerts });
      }

      // ── Acknowledge alert ──
      case 'acknowledge': {
        const { alert_id } = body;
        if (!alert_id) return Response.json({ error: 'alert_id required' }, { status: 400 });
        const updated = await sr.entities.SecurityAlert.update(alert_id, {
          status: 'acknowledged',
        });
        await sr.entities.AuditLog.create({
          acting_user_id: user.id,
          acting_user_email: user.email,
          target_record_id: alert_id,
          target_entity: 'SecurityAlert',
          action: 'admin_data_modification',
          notes: 'Security alert acknowledged'
        });
        return Response.json({ alert: updated });
      }

      // ── Resolve alert ──
      case 'resolve': {
        const { alert_id, resolution_notes } = body;
        if (!alert_id) return Response.json({ error: 'alert_id required' }, { status: 400 });
        const updated = await sr.entities.SecurityAlert.update(alert_id, {
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          resolution_notes: resolution_notes || null,
        });
        await sr.entities.AuditLog.create({
          acting_user_id: user.id,
          acting_user_email: user.email,
          target_record_id: alert_id,
          target_entity: 'SecurityAlert',
          action: 'admin_data_modification',
          notes: `Security alert resolved${resolution_notes ? ': ' + resolution_notes : ''}`
        });
        return Response.json({ alert: updated });
      }

      // ── Delete alert ──
      case 'delete_alert': {
        const { alert_id } = body;
        if (!alert_id) return Response.json({ error: 'alert_id required' }, { status: 400 });
        await sr.entities.SecurityAlert.delete(alert_id);
        await sr.entities.AuditLog.create({
          acting_user_id: user.id,
          acting_user_email: user.email,
          target_record_id: alert_id,
          target_entity: 'SecurityAlert',
          action: 'admin_data_modification',
          notes: 'Security alert deleted'
        });
        return Response.json({ success: true });
      }

      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});