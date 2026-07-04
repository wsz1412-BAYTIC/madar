import LegalPageLayout from "@/components/LegalPageLayout";
import { useLanguage } from "@/lib/LanguageContext";

export default function Contact() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const sections = isRTL ? [
    {
      title: "1. قنوات التواصل",
      text: "للتواصل مع مدار لأي استفسار، يمكنك استخدام القنوات التالية:",
      items: [
        "البريد الإلكتروني: [عنوان البريد — قيد الإنجاز]",
        "العنوان: [العنوان — قيد الإنجاز]، الرياض، المملكة العربية السعودية.",
      ],
    },
    {
      title: "2. تقديم شكوى",
      text: "إذا لديك شكوى حول خدماتنا أو معالجة بياناتك، يرجى التواصل معنا أولاً وسنقوم بالرد خلال 30 يوماً. نسعى لحل جميع الشكاوى بطريقة عادلة وسريعة.",
    },
    {
      title: "3. طلبات البيانات (PDPL)",
      text: "وفقاً لنظام حماية البيانات الشخصية، يمكنك تقديم طلبات البيانات التالية:",
      items: [
        "طلب الوصول: الحصول على نسخة من بياناتك الشخصية المخزنة لدينا.",
        "طلب التصحيح: تصحيح أي بيانات غير دقيقة.",
        "طلب الحذف: حذف بياناتك الشخصية (مع مراعاة الالتزامات القانونية).",
        "سحب الموافقة: سحب موافقتك على معالجة بياناتك في أي وقت.",
      ],
    },
    {
      title: "4. التصعيد إلى هيئة البيانات والذكاء الاصطناعي (SDAIA)",
      text: "إذا لم نرد على طلبك خلال 30 يوماً، أو إذا لم تكن راضياً عن ردنا، يحق لك تقديم شكوى إلى هيئة البيانات والذكاء الاصطناعي (SDAIA) عبر موقعهم الرسمي.",
    },
    {
      title: "5. المعلومات المطلوبة في الطلب",
      text: "عند تقديم طلب بيانات أو شكوى، يرجى تضمين:",
      items: [
        "اسمك الكامل وعنوان بريدك الإلكتروني المسجل لدينا.",
        "وصف واضح للطلب أو الشكوى.",
        "أي مستندات داعمة ذات صلة.",
      ],
    },
  ] : [
    {
      title: "1. Contact Channels",
      text: "To contact Madar with any inquiry, you can use the following channels:",
      items: [
        "Email: [Email address — to be finalized]",
        "Address: [Address — to be finalized], Riyadh, Kingdom of Saudi Arabia.",
      ],
    },
    {
      title: "2. Filing a Complaint",
      text: "If you have a complaint about our services or data processing, please contact us first and we will respond within 30 days. We strive to resolve all complaints fairly and promptly.",
    },
    {
      title: "3. Data Requests (PDPL)",
      text: "Under the Personal Data Protection Law, you may submit the following data requests:",
      items: [
        "Access request: obtain a copy of the personal data we hold about you.",
        "Correction request: correct any inaccurate data.",
        "Deletion request: delete your personal data (subject to legal obligations).",
        "Consent withdrawal: withdraw your consent to data processing at any time.",
      ],
    },
    {
      title: "4. Escalation to SDAIA",
      text: "If we do not respond to your request within 30 days, or if you are not satisfied with our response, you have the right to file a complaint with the Saudi Data & AI Authority (SDAIA) via their official website.",
    },
    {
      title: "5. Required Information",
      text: "When submitting a data request or complaint, please include:",
      items: [
        "Your full name and registered email address.",
        "A clear description of the request or complaint.",
        "Any relevant supporting documents.",
      ],
    },
  ];

  return <LegalPageLayout policyKey="contact" sections={sections} />;
}