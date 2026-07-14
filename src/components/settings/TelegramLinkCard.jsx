import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Send, Loader2, CheckCircle2, ExternalLink, RefreshCw, Link2, ShieldCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  readLinkStatus,
  readCreateLink,
  isSafeDeepLink,
  classifyLinkError,
  secondsUntil,
  isLinkExpired,
  formatCountdown,
  formatLinkedDate,
} from '@/lib/telegramLinkingUi';

// PR 1B — Secure Telegram account-linking section for MadarSettings.
//
// Talks only to the authenticated `telegram-linking` function (create_link /
// status / unlink). It NEVER reads or renders chat_id, telegram_user_id, or the
// token hash — the backend already omits them and the UI only shows the four
// safe status fields. The one-time deep link lives in component state only
// (never localStorage) and is cleared on expiry, unlink, and unmount.
//
// Phases: loading | none | pending | expired | linked | unavailable | error.
export default function TelegramLinkCard() {
  const { lang } = useLang();
  const { toast } = useToast();
  const ar = lang === 'ar';
  const t = (a, e) => (ar ? a : e);

  const [phase, setPhase] = useState('loading');
  const [linkedAt, setLinkedAt] = useState(null);
  const [deepLink, setDeepLink] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [busy, setBusy] = useState(null); // 'create' | 'verify' | 'unlink' | null
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mounted = useRef(true);
  // Live mirrors of the one-time link so status refreshes can decide whether a
  // still-`pending` backend response should keep showing the current link.
  const deepLinkRef = useRef(null);
  const expiresAtRef = useRef(null);
  useEffect(() => { deepLinkRef.current = deepLink; }, [deepLink]);
  useEffect(() => { expiresAtRef.current = expiresAt; }, [expiresAt]);
  // Synchronous guard so overlapping status refreshes (e.g. visibilitychange AND
  // focus firing together on return from Telegram) issue only ONE request. React
  // `busy` state can be stale across two handlers in the same tick; this ref is
  // set before the first await, so the second handler sees it immediately.
  const statusInFlight = useRef(false);

  useEffect(() => {
    mounted.current = true;
    // Cleanup only flips the mounted flag — component state is discarded on
    // unmount automatically, so we never call setState here.
    return () => { mounted.current = false; };
  }, []);

  const applyStatus = useCallback((res) => {
    const s = readLinkStatus(res);
    if (s.linked) {
      // Linked: drop the one-time link and show the connected state.
      setLinkedAt(s.linkedAt);
      setDeepLink(null);
      setExpiresAt(null);
      setPhase('linked');
      return;
    }
    if (s.status === 'pending' && deepLinkRef.current && !isLinkExpired(expiresAtRef.current)) {
      // Backend still pending AND we still hold a live one-time link (the user
      // clicked "Check status" or returned from Telegram before /start was
      // processed): preserve the Open-Telegram link, countdown and controls.
      setPhase('pending');
      return;
    }
    // expired / revoked / none — or pending after a reload with no local link:
    // clear any stale local link and show the appropriate state. `expired` keeps
    // its own regenerate state; everything else falls back to `none` (which still
    // offers creating a replacement link).
    setDeepLink(null);
    setExpiresAt(null);
    setPhase(s.status === 'expired' ? 'expired' : 'none');
  }, []);

  const loadStatus = useCallback(async (mode) => {
    if (statusInFlight.current) return; // only one status request at a time
    statusInFlight.current = true;
    if (mode === 'verify') setBusy('verify');
    try {
      const res = await base44.functions.invoke('telegram-linking', { action: 'status' });
      if (!mounted.current) return;
      applyStatus(res);
    } catch (err) {
      if (!mounted.current) return;
      setPhase(classifyLinkError(err)); // 'unavailable' | 'error'
    } finally {
      statusInFlight.current = false;
      if (mounted.current && mode === 'verify') setBusy(null);
    }
  }, [applyStatus]);

  // Initial load.
  useEffect(() => {
    loadStatus('load');
  }, [loadStatus]);

  // Countdown tick while a pending deep link is live; clear it on expiry.
  useEffect(() => {
    if (phase !== 'pending' || !expiresAt) return undefined;
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [phase, expiresAt]);

  useEffect(() => {
    if (phase === 'pending' && expiresAt && isLinkExpired(expiresAt, nowTs)) {
      setDeepLink(null);
      setExpiresAt(null);
      setPhase('expired');
    }
  }, [phase, expiresAt, nowTs]);

  // Refresh status once when the user returns to the tab while pending. Both
  // `visibilitychange` and `focus` can fire together on return from Telegram; the
  // synchronous statusInFlight guard inside loadStatus collapses them to one call.
  useEffect(() => {
    if (phase !== 'pending') return undefined;
    const onFocus = () => {
      if (document.visibilityState === 'hidden') return;
      loadStatus('verify');
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [phase, loadStatus]);

  const createLink = useCallback(async () => {
    if (busy) return; // no duplicate actions while busy
    setBusy('create');
    try {
      const res = await base44.functions.invoke('telegram-linking', { action: 'create_link' });
      if (!mounted.current) return;
      const { deepLink: dl, expiresAt: exp } = readCreateLink(res);
      if (dl && isSafeDeepLink(dl)) {
        setDeepLink(dl);
        setExpiresAt(exp);
        setNowTs(Date.now());
        setPhase('pending');
      } else {
        setPhase('error');
      }
    } catch (err) {
      if (!mounted.current) return;
      const kind = classifyLinkError(err);
      if (kind === 'unavailable') setPhase('unavailable');
      else {
        setPhase('none');
        toast({ variant: 'destructive', description: t('تعذّر إنشاء رابط الربط، حاول مجددًا.', 'Could not create the link, please try again.') });
      }
    } finally {
      if (mounted.current) setBusy(null);
    }
  }, [busy, toast, ar]); // eslint-disable-line react-hooks/exhaustive-deps

  const doUnlink = useCallback(async () => {
    setConfirmOpen(false);
    if (busy) return;
    setBusy('unlink');
    try {
      await base44.functions.invoke('telegram-linking', { action: 'unlink' });
      if (!mounted.current) return;
      setLinkedAt(null);
      setDeepLink(null);
      setExpiresAt(null);
      setPhase('none');
      toast({ description: t('تم إلغاء ربط تيليجرام.', 'Telegram has been unlinked.') });
    } catch {
      if (!mounted.current) return;
      toast({ variant: 'destructive', description: t('تعذّر إلغاء الربط، حاول مجددًا.', 'Could not unlink, please try again.') });
    } finally {
      if (mounted.current) setBusy(null);
    }
  }, [busy, toast, ar]); // eslint-disable-line react-hooks/exhaustive-deps

  const secondsLeft = secondsUntil(expiresAt, nowTs);
  const linkedDate = formatLinkedDate(linkedAt, lang);

  const btnPrimary = 'group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00548C] to-[#003152] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#1B84C4]/30 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed';
  const btnGhost = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-foreground/[0.04] border border-foreground/[0.08] text-foreground/70 hover:border-foreground/20 hover:text-foreground transition-all disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#229ED9]/15 to-[#1B84C4]/10 flex items-center justify-center border border-[#229ED9]/15">
          <Send className="w-4 h-4 text-[#229ED9]" />
        </div>
        <h2 className="font-heading font-semibold text-foreground">{t('ربط تيليجرام الآمن', 'Secure Telegram linking')}</h2>
      </div>
      <p className="text-xs leading-relaxed text-foreground/45 mb-5">
        {t(
          'يربط حسابك بمحادثة خاصة مع بوت مدار. هذا مختلف عن حقل «اسم المستخدم في تيليجرام» الاختياري بالأسفل. إرسال التنبيهات عبر تيليجرام قيد التجهيز وسيُفعّل لاحقًا.',
          'Links your account to a private chat with the Madar bot. This is different from the optional “Telegram username” field below. Telegram alert delivery is still being set up and will be enabled later.'
        )}
      </p>

      {/* loading */}
      {phase === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-foreground/50">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t('جارٍ تحميل حالة الربط…', 'Loading link status…')}
        </div>
      )}

      {/* none */}
      {phase === 'none' && (
        <button onClick={createLink} disabled={busy === 'create'} className={btnPrimary}>
          {busy === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          {t('ربط تيليجرام', 'Link Telegram')}
        </button>
      )}

      {/* pending */}
      {phase === 'pending' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#229ED9]/20 bg-[#229ED9]/[0.05] p-4">
            <p className="text-sm text-foreground/70 mb-3">
              {t('افتح الرابط في تيليجرام واضغط ابدأ لإكمال الربط:', 'Open the link in Telegram and tap Start to finish linking:')}
            </p>
            {isSafeDeepLink(deepLink) && (
              <a
                href={deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className={btnPrimary}
              >
                <ExternalLink className="w-4 h-4" />
                {t('افتح تيليجرام', 'Open Telegram')}
              </a>
            )}
            <p className="text-xs text-foreground/50 mt-3" role="timer" aria-live="polite">
              {t('ينتهي الرابط خلال', 'Link expires in')} <span dir="ltr" className="font-mono">{formatCountdown(secondsLeft)}</span>
              {' — '}
              {t('صالح لمدة 15 دقيقة.', 'valid for 15 minutes.')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => loadStatus('verify')} disabled={!!busy} className={btnGhost}>
              {busy === 'verify' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {t('التحقق من حالة الربط', 'Check link status')}
            </button>
            <button onClick={createLink} disabled={!!busy} className={btnGhost}>
              {t('إنشاء رابط جديد', 'Create a new link')}
            </button>
          </div>
        </div>
      )}

      {/* expired */}
      {phase === 'expired' && (
        <div className="space-y-3">
          <p className="text-sm text-foreground/60">{t('انتهت صلاحية رابط الربط. أنشئ رابطًا جديدًا للمتابعة.', 'The link has expired. Create a new one to continue.')}</p>
          <button onClick={createLink} disabled={!!busy} className={btnPrimary}>
            {busy === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {t('إنشاء رابط جديد', 'Create a new link')}
          </button>
        </div>
      )}

      {/* linked */}
      {phase === 'linked' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              {t('متصل', 'Connected')}
            </span>
            {linkedDate && (
              <span className="text-xs text-foreground/50">
                {t('تاريخ الربط:', 'Linked on:')} <span dir="ltr">{linkedDate}</span>
              </span>
            )}
          </div>
          <button onClick={() => setConfirmOpen(true)} disabled={!!busy} className={btnGhost}>
            {busy === 'unlink' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t('إلغاء الربط', 'Unlink')}
          </button>
        </div>
      )}

      {/* unavailable (503 / integration not configured) */}
      {phase === 'unavailable' && (
        <div className="flex items-start gap-2 rounded-xl border border-foreground/[0.08] bg-foreground/[0.03] p-4 text-sm text-foreground/60">
          <ShieldCheck className="w-4 h-4 mt-0.5 text-foreground/40" />
          <span>{t('ربط تيليجرام غير متاح حاليًا. سيتم تفعيله قريبًا.', 'Telegram linking is not available yet. It will be enabled soon.')}</span>
        </div>
      )}

      {/* generic error */}
      {phase === 'error' && (
        <div className="space-y-3">
          <p className="text-sm text-danger">{t('تعذّر تحميل حالة الربط.', 'Could not load link status.')}</p>
          <button onClick={() => { setPhase('loading'); loadStatus('load'); }} className={btnGhost}>
            <RefreshCw className="w-4 h-4" />
            {t('إعادة المحاولة', 'Retry')}
          </button>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent dir={ar ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('إلغاء ربط تيليجرام؟', 'Unlink Telegram?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('سيتوقف استقبال التنبيهات عبر تيليجرام حتى تعيد الربط.', 'You will stop receiving Telegram alerts until you link again.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('تراجع', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={doUnlink} className="bg-danger hover:bg-danger/90">
              {t('إلغاء الربط', 'Unlink')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
