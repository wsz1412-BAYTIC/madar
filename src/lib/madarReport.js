/**
 * Madar Quick Report — short, actionable findings for a new trial customer.
 *
 * Pure heuristics over the user's UserProperty rows: detect weaknesses, rank
 * by impact, and return ONLY the top 3 fixes for trial/free customers.
 */

export const QUICK_REPORT_LIMIT = 3;

const DETECTORS = [
  {
    id: 'no_photos',
    weight: 90,
    test: (p) => !p.images || p.images.length === 0,
    issue: (names) => ({
      title: { en: 'Listings without photos', ar: 'إعلانات بدون صور' },
      fix: {
        en: `Add at least 5 bright photos to: ${names}. Listings with photos get dramatically more bookings.`,
        ar: `أضف 5 صور واضحة على الأقل إلى: ${names}. الإعلانات المصوّرة تحصل على حجوزات أكثر بكثير.`,
      },
      benefit: { en: 'Up to +40% more views and bookings.', ar: 'زيادة تصل إلى 40٪ في المشاهدات والحجوزات.' },
    }),
  },
  {
    id: 'low_occupancy',
    weight: 80,
    test: (p) => Number.isFinite(p.currentOccupancy) && p.currentOccupancy > 0 && p.currentOccupancy < 40,
    issue: (names) => ({
      title: { en: 'Low occupancy', ar: 'إشغال منخفض' },
      fix: {
        en: `Occupancy is under 40% for: ${names}. Review the nightly price against similar units nearby — small weekday discounts usually fill the gap.`,
        ar: `الإشغال أقل من 40٪ في: ${names}. راجع سعر الليلة مقارنةً بالوحدات المشابهة — خصومات بسيطة في أيام الأسبوع عادةً تسد الفجوة.`,
      },
      benefit: { en: 'Typically +10–20 booked nights per month.', ar: 'عادةً 10–20 ليلة محجوزة إضافية شهريًا.' },
    }),
  },
  {
    id: 'not_linked',
    weight: 60,
    test: (p) => !p.property_url,
    issue: (names) => ({
      title: { en: 'Listings not linked to a platform', ar: 'إعلانات غير مرتبطة بمنصة' },
      fix: {
        en: `Add the live listing link for: ${names}, so Madar can track performance and prices.`,
        ar: `أضف رابط الإعلان المباشر لـ: ${names} حتى يتمكن مدار من متابعة الأداء والأسعار.`,
      },
      benefit: { en: 'Accurate tracking and better price recommendations.', ar: 'متابعة دقيقة وتوصيات أسعار أفضل.' },
    }),
  },
  {
    id: 'no_price',
    weight: 70,
    test: (p) => !(Number(p.price) > 0),
    issue: (names) => ({
      title: { en: 'Missing nightly price', ar: 'سعر الليلة غير محدد' },
      fix: {
        en: `Set a nightly price for: ${names}. Without it Madar cannot compare you to the market.`,
        ar: `حدد سعر الليلة لـ: ${names}. بدونه لا يمكن لمدار مقارنتك بالسوق.`,
      },
      benefit: { en: 'Enables market comparison and revenue tracking.', ar: 'يتيح مقارنة السوق وتتبع الإيرادات.' },
    }),
  },
  {
    id: 'paused',
    weight: 50,
    test: (p) => p.is_active === false,
    issue: (names) => ({
      title: { en: 'Paused listings', ar: 'إعلانات متوقفة' },
      fix: {
        en: `${names} is paused. Every paused week is lost revenue — reactivate or archive it.`,
        ar: `${names} متوقف. كل أسبوع توقف يعني إيرادًا ضائعًا — فعّله أو أرشفه.`,
      },
      benefit: { en: 'Recover revenue you are currently losing.', ar: 'استرداد إيراد تخسره حاليًا.' },
    }),
  },
  {
    id: 'no_amenities',
    weight: 40,
    test: (p) => !p.amenities || p.amenities.length === 0,
    issue: (names) => ({
      title: { en: 'No amenities listed', ar: 'لا توجد مرافق مذكورة' },
      fix: {
        en: `List amenities (Wi-Fi, parking, A/C…) for: ${names}. Guests filter by them.`,
        ar: `أضف المرافق (واي فاي، موقف، تكييف…) لـ: ${names}. الضيوف يبحثون بها.`,
      },
      benefit: { en: 'Appear in more guest searches.', ar: 'الظهور في نتائج بحث أكثر.' },
    }),
  },
  {
    id: 'no_properties',
    weight: 100,
    global: true,
    test: (all) => all.length === 0,
    issue: () => ({
      title: { en: 'No properties added yet', ar: 'لم تتم إضافة عقارات بعد' },
      fix: {
        en: 'Add your first property (2 minutes with the wizard) so Madar can start analyzing it.',
        ar: 'أضف عقارك الأول (دقيقتان عبر المعالج) ليبدأ مدار في تحليله.',
      },
      benefit: { en: 'Everything else starts here.', ar: 'كل شيء يبدأ من هنا.' },
    }),
  },
];

const displayName = (p) => p.property_name || 'property';

export function buildQuickReport(properties, { fullAccess = false } = {}) {
  const list = Array.isArray(properties) ? properties : [];
  const found = [];

  for (const det of DETECTORS) {
    if (det.global) {
      if (det.test(list)) found.push({ id: det.id, weight: det.weight, ...det.issue() });
      continue;
    }
    const hits = list.filter((p) => det.test(p));
    if (hits.length > 0) {
      const names = hits.slice(0, 3).map(displayName).join(', ') + (hits.length > 3 ? '…' : '');
      found.push({ id: det.id, weight: det.weight, count: hits.length, ...det.issue(names) });
    }
  }

  found.sort((a, b) => b.weight - a.weight);
  const issues = fullAccess ? found : found.slice(0, QUICK_REPORT_LIMIT);
  const lockedCount = fullAccess ? 0 : Math.max(0, found.length - QUICK_REPORT_LIMIT);

  const summary = fullAccess
    ? {
        en: `Full report: ${found.length} finding${found.length === 1 ? '' : 's'} across ${list.length} propert${list.length === 1 ? 'y' : 'ies'}.`,
        ar: `التقرير الكامل: ${found.length} ملاحظة عبر ${list.length} عقار.`,
      }
    : {
        en: `Your top ${issues.length} fixes right now${lockedCount ? ` (+${lockedCount} more with a paid plan)` : ''}.`,
        ar: `أهم ${issues.length} إصلاحات لديك الآن${lockedCount ? ` (+${lockedCount} إضافية مع الخطة المدفوعة)` : ''}.`,
      };

  return { issues, totalIssues: found.length, lockedCount, fullAccess, summary };
}