import LegalPageLayout from "@/components/LegalPageLayout";
import { useLanguage } from "@/lib/LanguageContext";

export default function DataAIPolicy() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const sections = isRTL ? [
    {
      title: "1. مصادر البيانات",
      text: "تجمع مدار البيانات من المصادر التالية:",
      items: [
        "بيانات الإعلانات العامة من Airbnb و Gathern و Booking.com عبر استخراج صفحات HTML العامة.",
        "بيانات السوق المجمعة من مصادر عامة مفتوحة.",
        "بيانات يقدمها المستخدم يدوياً عبر معالج إضافة العقار.",
      ],
    },
    {
      title: "2. إخلاء مسؤولية البيانات الخارجية",
      text: "لا نضمن دقة أو اكتمال أو حداثة البيانات المستخرجة من منصات خارجية. قد تتغير هذه البيانات دون إشعار. لا تدعي مدار أي شراكة أو انتماء مع Airbnb أو Gathern أو Booking.com.",
    },
    {
      title: "3. أخطاء الذكاء الاصطناعي",
      text: "تستند توصياتنا إلى نماذج ذكاء اصطناعي قد تنتج نتائج غير دقيقة أو غير مكتملة في بعض الأحيان. نحن نعمل باستمرار على تحسين دقة نماذجنا، لكن لا يمكننا ضمان خلوها من الأخطاء. يجب عليك دائماً تقييم التوصيات قبل تطبيقها.",
    },
    {
      title: "4. انقطاع الخدمات الخارجية",
      text: "قد تتوقف مدار عن استخراج البيانات من منصة معينة إذا تغيرت واجهة برمجة التطبيقات أو هيكل صفحة المنصة، أو إذا منعت المنصة الوصول. في هذه الحالات، نقدم رسالة واضحة بالعربية والإنجليزية بدلاً من إظهار أخطاء تقنية للمستخدم.",
    },
    {
      title: "5. عدم الادعاء بالشراكة",
      text: "مدار لا يدعي أي شراكة أو انتماء أو علاقة رسمية مع Airbnb أو Gathern أو Booking.com أو أي منصة أخرى. نحن منصة مستقلة تستخرج البيانات العامة المتاحة فقط.",
    },
    {
      title: "6. استخدام بياناتك",
      text: "نستخدم بيانات عقاراتك لمعالجة توصيات التسعير وتحليل السوق. لا نبيع بياناتك الشخصية لأطراف ثالثة. قد نستخدم بيانات مجمعة ومجهولة الهوية لتحسين نماذجنا.",
    },
  ] : [
    {
      title: "1. Data Sources",
      text: "Madar collects data from the following sources:",
      items: [
        "Public listing data from Airbnb, Gathern, and Booking.com via public HTML page extraction.",
        "Aggregated market data from public, open sources.",
        "User-supplied data entered manually through the Add Property wizard.",
      ],
    },
    {
      title: "2. External Data Disclaimer",
      text: "We do not guarantee the accuracy, completeness, or timeliness of data extracted from external platforms. This data may change without notice. Madar does not claim any partnership or affiliation with Airbnb, Gathern, or Booking.com.",
    },
    {
      title: "3. AI Errors",
      text: "Our recommendations are based on AI models that may occasionally produce inaccurate or incomplete results. We continuously work to improve model accuracy, but cannot guarantee error-free outputs. You should always evaluate recommendations before applying them.",
    },
    {
      title: "4. External Service Outages",
      text: "Madar may stop extracting data from a specific platform if the API or page structure changes, or if the platform blocks access. In these cases, we provide a clear bilingual (Arabic/English) message instead of showing raw technical errors to users.",
    },
    {
      title: "5. No Partnership Claims",
      text: "Madar does not claim any partnership, affiliation, or official relationship with Airbnb, Gathern, Booking.com, or any other platform. We are an independent platform that extracts publicly available data only.",
    },
    {
      title: "6. Use of Your Data",
      text: "We use your property data to process pricing recommendations and market analysis. We do not sell your personal data to third parties. We may use aggregated, anonymized data to improve our models.",
    },
  ];

  return <LegalPageLayout policyKey="data_ai_policy" sections={sections} />;
}