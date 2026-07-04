// Subscription entitlements and feature permissions
// This is the single source of truth for what each plan includes

export const SUBSCRIPTION_ENTITLEMENTS = {
  free: {
    name: 'Free',
    nameAr: 'مجاني',
    features: {
      dashboard: {
        overview: true,
        basicStats: true,
        propertyManagement: true,
        basicAlerts: true,
        accountSettings: true,
      },
      properties: {
        maxCount: 1,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canUploadImages: true,
      },
      integrations: {
        maxConnected: 1,
        supportedPlatforms: ['airbnb'], // only Airbnb
      },
      reports: {
        basicOverview: true,
        monthlyPerformance: true,
        maxDownloads: 0, // cannot download
        dataRetention: 30, // days
      },
      pricing: {
        recommendations: false,
        historicalData: false,
        competitorAnalysis: false,
        demandForecasting: false,
      },
      analytics: {
        basicOccupancy: true,
        basicRevenue: true,
        advancedCharts: false,
        lostRevenueAnalysis: false,
        seasonalityTrends: false,
      },
      aiAssistant: {
        enabled: true,
        monthlyUsage: 10,
        prioritySupport: false,
      },
      support: {
        level: 'community', // community, standard, priority
        emailSupport: false,
      },
    },
    addOns: [],
  },

  basic: {
    name: 'Basic',
    nameAr: 'أساسي',
    features: {
      dashboard: {
        overview: true,
        basicStats: true,
        propertyManagement: true,
        basicAlerts: true,
        accountSettings: true,
        billingManagement: true,
      },
      properties: {
        maxCount: 3,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canUploadImages: true,
      },
      integrations: {
        maxConnected: 2,
        supportedPlatforms: ['airbnb', 'booking'],
      },
      reports: {
        basicOverview: true,
        monthlyPerformance: true,
        propertyComparison: true,
        maxDownloads: 5,
        dataRetention: 90,
      },
      pricing: {
        recommendations: true,
        historicalData: false,
        competitorAnalysis: false,
        demandForecasting: false,
        sevenDayCalendar: true,
      },
      analytics: {
        basicOccupancy: true,
        basicRevenue: true,
        advancedCharts: false,
        lostRevenueAnalysis: false,
        seasonalityTrends: false,
      },
      aiAssistant: {
        enabled: true,
        monthlyUsage: 50,
        prioritySupport: false,
      },
      support: {
        level: 'email',
        emailSupport: true,
      },
    },
    addOns: ['advanced_pricing', 'competitor_analysis'],
  },

  professional: {
    name: 'Professional',
    nameAr: 'احترافي',
    features: {
      dashboard: {
        overview: true,
        basicStats: true,
        propertyManagement: true,
        basicAlerts: true,
        advancedAlerts: true,
        accountSettings: true,
        billingManagement: true,
        analyticsCenter: true,
      },
      properties: {
        maxCount: 10,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canUploadImages: true,
        canManageIntegrations: true,
      },
      integrations: {
        maxConnected: 5,
        supportedPlatforms: ['airbnb', 'booking', 'gathern'],
      },
      reports: {
        basicOverview: true,
        monthlyPerformance: true,
        propertyComparison: true,
        advancedAnalytics: true,
        customReports: true,
        maxDownloads: 50,
        dataRetention: 365, // 1 year
        exportFormats: ['pdf', 'csv', 'excel'],
      },
      pricing: {
        recommendations: true,
        historicalData: true,
        competitorAnalysis: true,
        demandForecasting: true,
        monthlyCalendar: true,
        sevenDayCalendar: true,
        lostRevenueDetection: true,
      },
      analytics: {
        basicOccupancy: true,
        basicRevenue: true,
        advancedCharts: true,
        lostRevenueAnalysis: true,
        seasonalityTrends: true,
        occupancyForecast: true,
      },
      aiAssistant: {
        enabled: true,
        monthlyUsage: 200,
        prioritySupport: false,
      },
      support: {
        level: 'standard',
        emailSupport: true,
        responseTime: '24h',
      },
    },
    addOns: ['advanced_pricing', 'competitor_analysis', 'market_intelligence'],
  },

  premium: {
    name: 'Premium',
    nameAr: 'متميز',
    features: {
      dashboard: {
        overview: true,
        basicStats: true,
        propertyManagement: true,
        basicAlerts: true,
        advancedAlerts: true,
        accountSettings: true,
        billingManagement: true,
        analyticsCenter: true,
        marketIntelligence: true,
        automationCenter: true,
      },
      properties: {
        maxCount: Infinity,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canUploadImages: true,
        canManageIntegrations: true,
        canAutomate: true,
      },
      integrations: {
        maxConnected: Infinity,
        supportedPlatforms: ['airbnb', 'booking', 'gathern', 'vrbo', 'airbnb_plus'],
      },
      reports: {
        basicOverview: true,
        monthlyPerformance: true,
        propertyComparison: true,
        advancedAnalytics: true,
        customReports: true,
        automatedReports: true,
        maxDownloads: Infinity,
        dataRetention: Infinity,
        exportFormats: ['pdf', 'csv', 'excel', 'api'],
      },
      pricing: {
        recommendations: true,
        historicalData: true,
        competitorAnalysis: true,
        demandForecasting: true,
        monthlyCalendar: true,
        sevenDayCalendar: true,
        lostRevenueDetection: true,
        automaticPricing: true, // major feature
        priceOptimization: true,
      },
      analytics: {
        basicOccupancy: true,
        basicRevenue: true,
        advancedCharts: true,
        lostRevenueAnalysis: true,
        seasonalityTrends: true,
        occupancyForecast: true,
        marketIntelligence: true,
        predictiveAnalytics: true,
      },
      aiAssistant: {
        enabled: true,
        monthlyUsage: Infinity,
        prioritySupport: true,
      },
      support: {
        level: 'priority',
        emailSupport: true,
        phoneSupport: true,
        responseTime: '2h',
        dedicatedManager: true,
      },
    },
    addOns: ['white_label', 'api_access', 'custom_integrations'],
  },
};

// Add-ons that can be purchased with any plan
export const AVAILABLE_ADDONS = {
  advanced_pricing: {
    name: 'Advanced Pricing',
    nameAr: 'التسعير المتقدم',
    price: 99,
    monthlyUsage: 1000,
    features: ['ml_pricing', 'bulk_updates', 'price_strategies'],
  },
  competitor_analysis: {
    name: 'Competitor Analysis',
    nameAr: 'تحليل المنافسين',
    price: 149,
    updates: 'daily',
    features: ['real_time_tracking', 'market_trends', 'benchmarking'],
  },
  market_intelligence: {
    name: 'Market Intelligence',
    nameAr: 'ذكاء السوق',
    price: 199,
    features: ['city_insights', 'event_tracking', 'demand_forecast'],
  },
  white_label: {
    name: 'White Label',
    nameAr: 'علامة بيضاء',
    price: 299,
    features: ['custom_branding', 'custom_domain', 'api_access'],
  },
  api_access: {
    name: 'API Access',
    nameAr: 'وصول API',
    price: 199,
    rateLimit: 10000,
    features: ['full_api', 'webhooks', 'custom_integration'],
  },
  custom_integrations: {
    name: 'Custom Integrations',
    nameAr: 'تكاملات مخصصة',
    price: 399,
    features: ['dedicated_dev', 'custom_api', 'priority_support'],
  },
};

// Subscription status affects feature access
export const SUBSCRIPTION_STATUS = {
  active: { canAccess: true, message: null },
  trial: { canAccess: true, message: 'trial' },
  past_due: { canAccess: false, message: 'payment_required' },
  cancelled: { canAccess: false, message: 'subscription_cancelled' },
  expired: { canAccess: false, message: 'subscription_expired' },
  suspended: { canAccess: false, message: 'account_suspended' },
};

/**
 * Get entitlements for a subscription plan
 */
// The entitlement tiers were authored as professional/premium, but the rest
// of the app (Billing, subscription records, PLAN_LIMITS) uses growth/pro.
// Without this alias every growth/pro lookup silently fell back to FREE
// entitlements — paid customers would have been locked out of their features.
const PLAN_ALIASES = { growth: 'professional', pro: 'premium' };

export function getPlanEntitlements(planName) {
  const key = String(planName || '').toLowerCase();
  return (
    SUBSCRIPTION_ENTITLEMENTS[key] ||
    SUBSCRIPTION_ENTITLEMENTS[PLAN_ALIASES[key]] ||
    SUBSCRIPTION_ENTITLEMENTS.free
  );
}

/**
 * Check if a user has access to a specific feature
 */
export function hasFeatureAccess(planName, featurePath) {
  const entitlements = getPlanEntitlements(planName);
  const keys = featurePath.split('.');
  
  let current = entitlements.features;
  for (const key of keys) {
    if (!current[key]) return false;
    current = current[key];
  }
  
  return current === true;
}

/**
 * Get a numeric limit for a feature (maxCount, monthlyUsage, etc)
 */
export function getFeatureLimit(planName, limitPath) {
  const entitlements = getPlanEntitlements(planName);
  const keys = limitPath.split('.');
  
  let current = entitlements.features;
  for (const key of keys) {
    if (!current[key]) return 0;
    current = current[key];
  }
  
  return typeof current === 'number' ? current : 0;
}

/**
 * Get all available dashboard pages for a plan
 */
export function getDashboardPages(planName, addOns = []) {
  const entitlements = getPlanEntitlements(planName);
  const pages = [];

  // Always available
  pages.push('dashboard');
  pages.push('properties');

  // Based on plan
  if (entitlements.features.analyticsCenter) pages.push('analytics');
  if (entitlements.features.pricing.recommendations) pages.push('pricing');
  if (entitlements.features.analyticsCenter) pages.push('revenue');
  if (entitlements.features.analyticsCenter) pages.push('market');
  if (entitlements.features.dashboard.automationCenter) pages.push('automation');

  // Add-ons
  if (addOns.includes('api_access')) pages.push('api');
  if (addOns.includes('market_intelligence')) pages.push('market');

  // Always available
  pages.push('settings');
  pages.push('billing');

  return pages;
}

/**
 * Generate navigation items based on entitlements
 */
export function getNavigationItems(planName, addOns = [], lang = 'en') {
  const entitlements = getPlanEntitlements(planName);
  const isAr = lang === 'ar';
  
  const items = [
    {
      label: isAr ? 'لوحة التحكم' : 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      visible: true,
    },
    {
      label: isAr ? 'العقارات' : 'Properties',
      href: '/properties',
      icon: 'Home',
      visible: true,
    },
  ];

  // Conditional items based on features
  if (entitlements.features.analyticsCenter) {
    items.push({
      label: isAr ? 'التحليلات' : 'Analytics',
      href: '/analytics',
      icon: 'BarChart3',
      visible: true,
    });
  }

  if (entitlements.features.pricing.recommendations) {
    items.push({
      label: isAr ? 'التسعير الذكي' : 'Smart Pricing',
      href: '/pricing-recommendations',
      icon: 'TrendingUp',
      visible: true,
    });
  }

  if (entitlements.features.analyticsCenter) {
    items.push({
      label: isAr ? 'الإيرادات' : 'Revenue',
      href: '/revenue',
      icon: 'DollarSign',
      visible: true,
    });
  }

  if (addOns.includes('market_intelligence') || entitlements.features.analyticsCenter) {
    items.push({
      label: isAr ? 'السوق' : 'Market',
      href: '/market',
      icon: 'TrendingUp',
      visible: true,
    });
  }

  // Settings and Billing always available
  items.push({
    label: isAr ? 'الإعدادات' : 'Settings',
    href: '/settings',
    icon: 'Settings',
    visible: true,
  });

  items.push({
    label: isAr ? 'الفواتير' : 'Billing',
    href: '/billing',
    icon: 'CreditCard',
    visible: true,
  });

  return items;
}