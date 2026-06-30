/**
 * Madar i18n — Arabic + English UI strings.
 * Used by LanguageContext.t(key).
 * API response language fields (reasoning_ar / reasoning_en) are handled
 * separately via LanguageContext.pickLang(arValue, enValue).
 */
export const i18n = {
  ar: {
    // Brand
    "brand.name": "مدار",
    "brand.tagline": "ذكاء التسعير العقاري",

    // Nav
    "nav.properties": "العقارات",
    "nav.market": "السوق",
    "nav.billing": "الاشتراك",
    "nav.assistant": "المساعد",
    "nav.login": "تسجيل الدخول",
    "nav.logout": "تسجيل الخروج",
    "nav.dashboard": "الرئيسية",
    "nav.addProperty": "إضافة عقار",

    // Hero
    "hero.title1": "ذكاء التسعير",
    "hero.title2": "لإيجاراتك",
    "hero.subtitle": "توصيات أسعار مدعومة بالذكاء الاصطناعي لعقاراتك على Airbnb و Gatherin و Booking.com",
    "hero.cta": "عرض التوصيات",
    "hero.searchPlaceholder": "ابحث عن عقار...",

    // Dashboard
    "dashboard.featured": "توصيات اليوم",
    "dashboard.viewAll": "عرض الكل",
    "dashboard.recommendedPrice": "السعر الموصى به",
    "dashboard.confidence": "مستوى الثقة",
    "dashboard.reasoning": "تحليل الذكاء الاصطناعي",
    "dashboard.noBriefs": "لا توجد توصيات متاحة بعد",
    "dashboard.neighborhoods": "مدار في مدنك",
    "dashboard.neighborhoodsDesc": "بيانات السوق في أهم المدن السعودية",
    "dashboard.services": "خدماتنا",
    "dashboard.servicesDesc": "حلول ذكاء التسعير العقاري المتكاملة",
    "dashboard.stories": "قصص نجاح",
    "dashboard.properties": "عقار",

    // Property search
    "properties.title": "عقاراتي",
    "properties.searchPlaceholder": "ابحث عن عقار...",
    "properties.noResults": "لا توجد عقارات مطابقة",
    "properties.noResultsHint": "جرّب تعديل البحث أو أضف عقاراً جديداً",
    "properties.bedrooms": "غرف نوم",
    "properties.guests": "ضيوف",
    "properties.rating": "التقييم",
    "properties.price": "السعر",
    "properties.perNight": "/ ليلة",
    "properties.platforms": "المنصات",
    "properties.add": "إضافة عقار",
    "properties.addTitle": "أضف عقاراً جديداً",
    "properties.urlLabel": "رابط العقار",
    "properties.urlPlaceholder": "الصق رابط Airbnb أو Gatherin أو Booking.com",
    "properties.preview": "معاينة",
    "properties.previewing": "جاري المعاينة...",
    "properties.save": "حفظ العقار",
    "properties.addAnotherUrl": "إضافة رابط منصة أخرى",
    "properties.comparison": "مقارنة الأسعار عبر المنصات",

    // Property detail
    "property.back": "العودة للعقارات",
    "property.about": "تفاصيل العقار",
    "property.features": "المميزات",
    "property.platformComparison": "مقارنة المنصات",
    "property.platform": "المنصة",
    "property.listingPrice": "السعر الحالي",
    "property.recommendedPrice": "السعر الموصى به",
    "property.viewAnalytics": "عرض التحليلات",
    "property.location": "الموقع",
    "property.notFound": "العقار غير موجود",

    // Analytics
    "analytics.title": "التحليلات",
    "analytics.priceHistory": "سجل الأسعار (30 يوماً)",
    "analytics.competitors": "مقارنة المنافسين",
    "analytics.back": "العودة للعقار",
    "analytics.yourPrice": "سعرك",
    "analytics.avgCompetitor": "متوسط المنافسين",
    "analytics.date": "التاريخ",
    "analytics.price": "السعر",

    // Market insights
    "market.title": "رؤى السوق",
    "market.selectCity": "اختر المدينة",
    "market.avgPrice": "متوسط السعر",
    "market.occupancy": "معدل الإشغال",
    "market.demand": "الطلب",
    "market.trend": "الاتجاه",
    "market.upgrade": "رؤى السوق متاحة في الباقة الأساسية وما فوق",
    "market.upgradeDesc": "ارتقِ للاشتراك للوصول إلى بيانات السوق التفصيلية",
    "market.upgradeBtn": "ترقية الاشتراك",
    "market.loading": "جاري تحميل بيانات السوق...",
    "market.error": "تعذّر تحميل بيانات السوق",

    // Billing
    "billing.title": "الاشتراك والاستخدام",
    "billing.currentTier": "الباقة الحالية",
    "billing.usage": "الاستخدام",
    "billing.upgrade": "ترقية الاشتراك",
    "billing.upgrading": "جاري المعالجة...",
    "billing.tiers.free": "مجاني",
    "billing.tiers.basic": "أساسي",
    "billing.tiers.growth": "نمو",
    "billing.tiers.pro": "احترافي",
    "billing.propertiesUsed": "العقارات المستخدمة",
    "billing.briefsGenerated": "التوصيات المُنشأة",
    "billing.aiQueries": "استفسارات الذكاء الاصطناعي",
    "billing.manage": "إدارة الاشتراك",
    "billing.upgradeSuccess": "تمت ترقية اشتراكك بنجاح",
    "billing.loading": "جاري تحميل معلومات الاشتراك...",

    // Assistant
    "assistant.title": "المساعد الذكي",
    "assistant.placeholder": "اسأل عن أسعار الإيجارات، اتجاهات السوق، أو استراتيجيات التسعير...",
    "assistant.send": "إرسال",
    "assistant.thinking": "يفكّر...",
    "assistant.upgrade": "المساعد الذكي متاح في الباقة الاحترافية",
    "assistant.upgradeDesc": "ارتقِ إلى الباقة الاحترافية للوصول إلى المساعد الذكي",
    "assistant.welcome": "مرحباً! أنا مساعدك الذكي للتسعير العقاري. كيف يمكنني مساعدتك اليوم؟",

    // Login
    "login.title": "مرحباً بعودتك",
    "login.subtitle": "سجّل الدخول للوصول إلى لوحة تحكم مدار",
    "login.email": "البريد الإلكتروني",
    "login.password": "كلمة المرور",
    "login.submit": "تسجيل الدخول",
    "login.signingIn": "جاري تسجيل الدخول...",
    "login.error": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    "login.demoHint": "استخدم بيانات اعتماد مدار الخاصة بك",

    // Footer
    "footer.newsletter": "رؤى السوق، بين يديك",
    "footer.newsletterDesc": "تحليلات ذكية لاتجاهات سوق الإيجارات في السعودية",
    "footer.newsletterPlaceholder": "بريدك الإلكتروني",
    "footer.subscribed": "شكراً لاشتراكك",
    "footer.navigate": "تصفّح",
    "footer.categories": "الفئات",
    "footer.contact": "تواصل",
    "footer.follow": "تابعنا",
    "footer.rights": "© 2025 مدار. جميع الحقوق محفوظة.",

    // Common
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ. حاول مرة أخرى.",
    "common.retry": "إعادة المحاولة",
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.close": "إغلاق",
    "common.perNight": "/ ليلة",
    "common.sar": "ر.س",
  },

  en: {
    // Brand
    "brand.name": "Madar",
    "brand.tagline": "Rental Pricing Intelligence",

    // Nav
    "nav.properties": "Properties",
    "nav.market": "Market",
    "nav.billing": "Billing",
    "nav.assistant": "Assistant",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.dashboard": "Dashboard",
    "nav.addProperty": "Add Property",

    // Hero
    "hero.title1": "Pricing Intelligence",
    "hero.title2": "for Your Rentals",
    "hero.subtitle": "AI-powered pricing recommendations for your properties on Airbnb, Gatherin, and Booking.com",
    "hero.cta": "View Recommendations",
    "hero.searchPlaceholder": "Search properties...",

    // Dashboard
    "dashboard.featured": "Today's Recommendations",
    "dashboard.viewAll": "View All",
    "dashboard.recommendedPrice": "Recommended Price",
    "dashboard.confidence": "Confidence",
    "dashboard.reasoning": "AI Reasoning",
    "dashboard.noBriefs": "No recommendations available yet",
    "dashboard.neighborhoods": "Madar in Your Cities",
    "dashboard.neighborhoodsDesc": "Market intelligence across Saudi Arabia's top cities",
    "dashboard.services": "Our Services",
    "dashboard.servicesDesc": "Comprehensive rental pricing intelligence solutions",
    "dashboard.stories": "Success Stories",
    "dashboard.properties": "properties",

    // Property search
    "properties.title": "My Properties",
    "properties.searchPlaceholder": "Search properties...",
    "properties.noResults": "No properties match your criteria",
    "properties.noResultsHint": "Try adjusting your search or add a new property",
    "properties.bedrooms": "Bedrooms",
    "properties.guests": "Guests",
    "properties.rating": "Rating",
    "properties.price": "Price",
    "properties.perNight": "/ night",
    "properties.platforms": "Platforms",
    "properties.add": "Add Property",
    "properties.addTitle": "Add a New Property",
    "properties.urlLabel": "Property URL",
    "properties.urlPlaceholder": "Paste an Airbnb, Gatherin, or Booking.com link",
    "properties.preview": "Preview",
    "properties.previewing": "Previewing...",
    "properties.save": "Save Property",
    "properties.addAnotherUrl": "Add another platform URL",
    "properties.comparison": "Price Comparison Across Platforms",

    // Property detail
    "property.back": "Back to Properties",
    "property.about": "About This Property",
    "property.features": "Amenities",
    "property.platformComparison": "Platform Comparison",
    "property.platform": "Platform",
    "property.listingPrice": "Current Price",
    "property.recommendedPrice": "Recommended Price",
    "property.viewAnalytics": "View Analytics",
    "property.location": "Location",
    "property.notFound": "Property not found",

    // Analytics
    "analytics.title": "Analytics",
    "analytics.priceHistory": "Price History (30 Days)",
    "analytics.competitors": "Competitor Comparison",
    "analytics.back": "Back to Property",
    "analytics.yourPrice": "Your Price",
    "analytics.avgCompetitor": "Avg. Competitor",
    "analytics.date": "Date",
    "analytics.price": "Price",

    // Market insights
    "market.title": "Market Insights",
    "market.selectCity": "Select City",
    "market.avgPrice": "Average Price",
    "market.occupancy": "Occupancy Rate",
    "market.demand": "Demand",
    "market.trend": "Trend",
    "market.upgrade": "Market insights available on Basic tier and above",
    "market.upgradeDesc": "Upgrade your subscription to access detailed market data",
    "market.upgradeBtn": "Upgrade Subscription",
    "market.loading": "Loading market data...",
    "market.error": "Failed to load market data",

    // Billing
    "billing.title": "Subscription & Usage",
    "billing.currentTier": "Current Tier",
    "billing.usage": "Usage",
    "billing.upgrade": "Upgrade Subscription",
    "billing.upgrading": "Processing...",
    "billing.tiers.free": "Free",
    "billing.tiers.basic": "Basic",
    "billing.tiers.growth": "Growth",
    "billing.tiers.pro": "Pro",
    "billing.propertiesUsed": "Properties Used",
    "billing.briefsGenerated": "Briefs Generated",
    "billing.aiQueries": "AI Queries",
    "billing.manage": "Manage Subscription",
    "billing.upgradeSuccess": "Your subscription has been upgraded successfully",
    "billing.loading": "Loading subscription info...",

    // Assistant
    "assistant.title": "AI Assistant",
    "assistant.placeholder": "Ask about rental pricing, market trends, or pricing strategies...",
    "assistant.send": "Send",
    "assistant.thinking": "Thinking...",
    "assistant.upgrade": "AI Assistant is available on the Pro tier",
    "assistant.upgradeDesc": "Upgrade to the Pro tier to access the AI Assistant",
    "assistant.welcome": "Hi! I'm your rental pricing intelligence assistant. How can I help you today?",

    // Login
    "login.title": "Welcome Back",
    "login.subtitle": "Sign in to access your Madar dashboard",
    "login.email": "Email",
    "login.password": "Password",
    "login.submit": "Sign In",
    "login.signingIn": "Signing in...",
    "login.error": "Invalid email or password",
    "login.demoHint": "Use your Madar credentials",

    // Footer
    "footer.newsletter": "Market Insights, Delivered",
    "footer.newsletterDesc": "Intelligent analysis of short-term rental trends across Saudi Arabia",
    "footer.newsletterPlaceholder": "Your email address",
    "footer.subscribed": "Thank you for subscribing",
    "footer.navigate": "Navigate",
    "footer.categories": "Categories",
    "footer.contact": "Contact",
    "footer.follow": "Follow",
    "footer.rights": "© 2025 Madar. All rights reserved.",

    // Common
    "common.loading": "Loading...",
    "common.error": "Something went wrong. Please try again.",
    "common.retry": "Retry",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.close": "Close",
    "common.perNight": "/ night",
    "common.sar": "SAR",
  },
};

export default i18n;