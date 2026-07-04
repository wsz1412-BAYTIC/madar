import LegalPageLayout from "@/components/LegalPageLayout";
import { useLanguage } from "@/lib/LanguageContext";

export default function Privacy() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const sections = isRTL ? [
    {
      title: "1. مقدمة",
      text: "تصف سياسة الخصوصية هذه كيف يقوم [اسم الكيان القانوني] (\"مدار\" أو \"نحن\") بجمع البيانات الشخصية واستخدامها والإفصاح عنها ونقلها وحمايتها بما يتوافق مع نظام حماية البيانات الشخصية الصادر في المملكة العربية السعودية (\"PDPL\"). باستخدامك لخدمات مدار، فإنك توافق على الممارسات الموضحة في هذه السياسة.",
    },
    {
      title: "2. البيانات التي نجمعها",
      text: "نجمع الأنواع التالية من البيانات الشخصية:",
      items: [
        "بيانات الحساب: الاسم، البريد الإلكتروني، اسم مستخدم تيليجرام (اختياري).",
        "بيانات العقارات: عنوان URL للإعلان، الموقع، الأسعار، التفاصيل العامة المنشورة على المنصات.",
        "سجلات الاستخدام: تفاعلاتك مع المساعد الذكي، التوصيات المقبولة أو المرفوضة، إعدادات الإشعارات.",
        "سجلات الموافقة: موافقتك على السياسات مع الإصدار والتاريخ والمصدر.",
        "البيانات التقنية: نوع المتصفح، عنوان IP (يُجمع على الخادم فقط، وليس من العميل).",
      ],
    },
    {
      title: "3. الأساس القانوني",
      text: "نعالج بياناتك الشخصية وفقاً لنظام حماية البيانات الشخصية على الأسس التالية:",
      items: [
        "أداء العقد: تقديم خدمات التسعير الذكي وإدارة اشتراكك.",
        "الالتزام القانوني: الاحتفاظ بالسجلات كما يتطلب القانون السعودي.",
        "الموافقة: إرسال الإشعارات ورسائل تيليجرام (يمكنك سحبها في أي وقت).",
        "المصلحة المشروعة: تحسين جودة التوصيات والخدمات.",
      ],
    },
    {
      title: "4. الأغراض",
      text: "نستخدم بياناتك لـ:",
      items: [
        "تقديم توصيات تسعير مدعومة بالذكاء الاصطناعي لعقاراتك.",
        "تحليل اتجاهات السوق وتقديم رؤى تنافسية.",
        "إدارة حسابك واشتراكك وفوترة الاستخدام.",
        "إرسال تنبيهات السوق وتوصيات الذكاء الاصطناعي عبر البريد أو تيليجرام.",
        "الامتثال للالتزامات القانونية والتنظيمية.",
      ],
    },
    {
      title: "5. حقوقك وفقاً لنظام PDPL",
      text: "لديك الحقوق التالية:",
      items: [
        "الحق في الوصول إلى بياناتك الشخصية.",
        "الحق في تصحيح البيانات غير الدقيقة.",
        "الحق في طلب حذف بياناتك (مع مراعاة الالتزامات القانونية للاحتفاظ).",
        "الحق في سحب الموافقة في أي وقت.",
        "الحق في تقديم شكوى إلى هيئة البيانات والذكاء الاصطناعي (SDAIA).",
      ],
      text2: "لممارسة هذه الحقوق، يرجى التواصل عبر صفحة الاتصال.",
    },
    {
      title: "6. الاحتفاظ بالبيانات",
      text: "نحتفظ ببياناتك الشخصية طوال مدة حسابك النشط، وبعدها للفترة التي يتطلبها القانون. يتم حذف بيانات العقارات وسجلات الاستخدام بعد إغلاق الحساب وفقاً لسياسة الاحتفاظ المعتمدة. سجلات الموافقة غير قابلة للحذف أو التعديل لضمان الامتثال.",
    },
    {
      title: "7. الأمن",
      text: "نطبق إجراءات أمنية تقنية وتنظيمية مناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح. يشمل ذلك التشفير في النقل، وضوابط الوصول المستندة إلى الأدوار، والتدقيق.",
    },
    {
      title: "8. معالجات البيانات الخارجية",
      text: "نعتمد على معالجين خارجيين لتقديم خدماتنا:",
      items: [
        "مزودو البنية التحتية السحابية لاستضافة التطبيق وقاعدة البيانات.",
        "مزودو نماذج الذكاء الاصطناعي لمعالجة توصيات التسعير.",
        "واجهات برمجة تطبيقات المنصات (Airbnb، Gathern، Booking.com) لاستخراج بيانات الإعلانات العامة.",
      ],
      text2: "جميع المعالجين ملزمون باتفاقيات حماية البيانات.",
    },
    {
      title: "9. النقل عبر الحدود",
      text: "قد تُعالج بياناتك الشخصية خارج المملكة العربية السعودية. في هذه الحالات، نضمن أن النقل يتم وفقاً لمتطلبات نظام حماية البيانات الشخصية، بما في ذلك ضمان مستوى كافٍ من الحماية في وجهة البيانات.",
    },
  ] : [
    {
      title: "1. Introduction",
      text: "This Privacy Policy describes how [Legal Entity Name] (\"Madar\" or \"we\") collects, uses, discloses, transfers, and protects personal data in compliance with the Personal Data Protection Law (\"PDPL\") of the Kingdom of Saudi Arabia. By using Madar's services, you agree to the practices described in this policy.",
    },
    {
      title: "2. Data We Collect",
      text: "We collect the following types of personal data:",
      items: [
        "Account data: name, email, Telegram username (optional).",
        "Property data: listing URL, location, prices, public details from platforms.",
        "Usage logs: your interactions with the AI assistant, accepted/rejected recommendations, notification settings.",
        "Consent records: your acceptance of policies with version, date, and source.",
        "Technical data: browser type, IP address (collected server-side only, never from the client).",
      ],
    },
    {
      title: "3. Legal Basis",
      text: "We process your personal data under the PDPL on the following bases:",
      items: [
        "Contract performance: providing pricing intelligence services and managing your subscription.",
        "Legal obligation: retaining records as required by Saudi law.",
        "Consent: sending notifications and Telegram messages (you may withdraw at any time).",
        "Legitimate interest: improving recommendation quality and service quality.",
      ],
    },
    {
      title: "4. Purposes",
      text: "We use your data to:",
      items: [
        "Provide AI-powered pricing recommendations for your properties.",
        "Analyze market trends and deliver competitive insights.",
        "Manage your account, subscription, and usage billing.",
        "Send market alerts and AI recommendations via email or Telegram.",
        "Comply with legal and regulatory obligations.",
      ],
    },
    {
      title: "5. Your Rights Under PDPL",
      text: "You have the following rights:",
      items: [
        "Right to access your personal data.",
        "Right to correct inaccurate data.",
        "Right to request deletion of your data (subject to legal retention obligations).",
        "Right to withdraw consent at any time.",
        "Right to file a complaint with the Saudi Data & AI Authority (SDAIA).",
      ],
      text2: "To exercise these rights, please contact us via the Contact page.",
    },
    {
      title: "6. Data Retention",
      text: "We retain your personal data for the duration of your active account, and thereafter for the period required by law. Property data and usage logs are deleted after account closure per our retention policy. Consent records are immutable and cannot be deleted or modified to ensure compliance.",
    },
    {
      title: "7. Security",
      text: "We apply appropriate technical and organizational security measures to protect your personal data from unauthorized access, alteration, or disclosure. This includes encryption in transit, role-based access controls, and audit logging.",
    },
    {
      title: "8. Third-Party Processors",
      text: "We rely on third-party processors to deliver our services:",
      items: [
        "Cloud infrastructure providers for application and database hosting.",
        "AI model providers for processing pricing recommendations.",
        "Platform APIs (Airbnb, Gathern, Booking.com) for extracting public listing data.",
      ],
      text2: "All processors are bound by data protection agreements.",
    },
    {
      title: "9. Cross-Border Transfer",
      text: "Your personal data may be processed outside the Kingdom of Saudi Arabia. In such cases, we ensure that the transfer complies with PDPL requirements, including ensuring an adequate level of protection at the data destination.",
    },
  ];

  return <LegalPageLayout policyKey="privacy" sections={sections} />;
}