// Permission system for user subscriptions and admin roles

const PLAN_LIMITS = {
  free: {
    maxProperties: 1,
    maxReports: 5,
    maxApiCalls: 100,
    features: ['basic_overview', 'property_management', 'basic_alerts'],
  },
  basic: {
    maxProperties: 3,
    maxReports: 20,
    maxApiCalls: 500,
    features: ['overview', 'property_management', 'basic_pricing', 'basic_reports', 'alerts'],
  },
  professional: {
    maxProperties: 10,
    maxReports: 100,
    maxApiCalls: 2000,
    features: ['overview', 'property_management', 'smart_pricing', 'advanced_analytics', 'competitor_analysis', 'reports', 'alerts', 'integrations'],
  },
  premium: {
    maxProperties: Infinity,
    maxReports: Infinity,
    maxApiCalls: Infinity,
    features: ['overview', 'property_management', 'smart_pricing', 'advanced_analytics', 'competitor_analysis', 'reports', 'alerts', 'integrations', 'automatic_pricing', 'priority_support'],
  },
};

const ADMIN_ROLES = {
  super_admin: {
    permissions: ['*'], // all permissions
  },
  admin: {
    permissions: ['view_users', 'view_properties', 'view_subscriptions', 'manage_content', 'view_audit_logs'],
  },
  support_manager: {
    permissions: ['view_users', 'manage_support_tickets', 'view_subscriptions'],
  },
  finance_manager: {
    permissions: ['view_subscriptions', 'view_payments', 'manage_refunds', 'view_revenue_reports'],
  },
  data_analyst: {
    permissions: ['view_market_data', 'view_analytics', 'export_data'],
  },
  content_manager: {
    permissions: ['manage_content', 'manage_website', 'view_analytics'],
  },
};

export function canAccessFeature(planName, featureName) {
  const plan = PLAN_LIMITS[planName] || PLAN_LIMITS.free;
  return plan.features.includes(featureName);
}

export function getPlanLimit(planName, limitName) {
  const plan = PLAN_LIMITS[planName] || PLAN_LIMITS.free;
  return plan[limitName] || 0;
}

export function hasAdminPermission(role, permission) {
  if (!ADMIN_ROLES[role]) return false;
  const perms = ADMIN_ROLES[role].permissions;
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

export function isAdmin(role) {
  return ADMIN_ROLES[role] !== undefined;
}

export function canAccessAdminDashboard(adminUser) {
  return adminUser && adminUser.role && ADMIN_ROLES[adminUser.role] && adminUser.isActive;
}

export const PLAN_NAMES = {
  free: 'Free',
  basic: 'Basic',
  professional: 'Professional',
  premium: 'Premium',
};