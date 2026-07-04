import LegalPageLayout from "@/components/LegalPageLayout";
import { useLanguage } from "@/lib/LanguageContext";

export default function Cookies() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const sections = isRTL ? [
    {
      title: "1. ما هي ملفات تعريف الارتباط؟",
      text: "ملفات تعريف الارتباط هي ملفات نصية صغيرة تُخزن على جهازك عند زيارة موقع إلكتروني. تُستخدم لتذكّر تفضيلاتك وتحسين تجربتك أثناء التصفح.",
    },
    {
      title: "2. ملفات تعريف الارتباط الأساسية",
      text: "تستخدم مدار ملفات تعريف ارتباط أساسية لا غنى عنها لعمل الموقع:",
      items: [
        "ملفات الجلسة: للحفاظ على تسجيل دخولك أثناء التصفح.",
        "ملفات التفضيلات: لتذكّر لغتك (عربي/إنجليزي) ومظهرك (فاتح/داكن) المختار.",
        "ملفات الأمان: للحماية من الهجمات الإلكترونية (رموز CSRF).",
      ],
    },
    {
      title: "3. ملفات تعريف الارتباط غير الأساسية",
      text: "نستخدم أيضاً ملفات تعريف ارتباط غير أساسية يمكن تعطيلها:",
      items: [
        "ملفات التحليلات: لفهم كيفية استخدام الزوار للموقع وتحسينه.",
        "ملفات التفضيلات الاختيارية: مثل تذكّر إعدادات الإشعارات.",
      ],
    },
    {
      title: "4. إدارة ملفات تعريف الارتباط",
      text: "يمكنك قبول أو رفض ملفات تعريف الارتباط غير الأساسية في أي وقت عبر شريط الموافقة الذي يظهر في أسفل الشاشة. يمكنك أيضاً حذف ملفات تعريف الارتباط المخزنة من خلال إعدادات متصفحك.",
    },
    {
      title: "5. ملفات الطرف الثالث",
      text: "قد تستخدم بعض الخدمات الخارجية (مثل أدوات التحليل) ملفات تعريف الارتباط الخاصة بها. تخضع هذه الملفات لسياسات الخصوصية الخاصة بتلك الأطراف.",
    },
  ] : [
    {
      title: "1. What Are Cookies?",
      text: "Cookies are small text files stored on your device when you visit a website. They are used to remember your preferences and improve your browsing experience.",
    },
    {
      title: "2. Essential Cookies",
      text: "Madar uses essential cookies that are necessary for the website to function:",
      items: [
        "Session cookies: to keep you logged in while browsing.",
        "Preference cookies: to remember your chosen language (Arabic/English) and theme (light/dark).",
        "Security cookies: to protect against cyber attacks (CSRF tokens).",
      ],
    },
    {
      title: "3. Non-Essential Cookies",
      text: "We also use non-essential cookies that can be disabled:",
      items: [
        "Analytics cookies: to understand how visitors use the site and improve it.",
        "Optional preference cookies: such as remembering notification settings.",
      ],
    },
    {
      title: "4. Managing Cookies",
      text: "You can accept or reject non-essential cookies at any time via the consent banner that appears at the bottom of the screen. You can also delete stored cookies through your browser settings.",
    },
    {
      title: "5. Third-Party Cookies",
      text: "Some external services (such as analytics tools) may use their own cookies. These cookies are subject to the privacy policies of those third parties.",
    },
  ];

  return <LegalPageLayout policyKey="cookies" sections={sections} />;
}