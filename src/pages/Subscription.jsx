import LegalPageLayout from "@/components/LegalPageLayout";
import { useLanguage } from "@/lib/LanguageContext";

export default function Subscription() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const sections = isRTL ? [
    {
      title: "1. الباقات والأسعار",
      text: "تقدم مدار الباقات التالية:",
      items: [
        "مجاني: حتى عقار واحد، توصيات تسعير يومية محدودة.",
        "أساسي: حتى عقارين، رؤى سوق، 99 ر.س شهرياً.",
        "نمو: حتى 5 عقارات، خريطة حرارية، مزامنة متعددة المنصات.",
        "احترافي: حتى 15 عقاراً، مساعد ذكي غير محدود، تقارير يومية.",
      ],
    },
    {
      title: "2. التجربة المجانية",
      text: "يحق لكل حساب جديد تجربة واحدة مجانية لمدة 14 يوماً لباقة النمو. التجربة مرة واحدة لكل حساب ولا يمكن تفعيلها مرة أخرى بعد انتهائها. تواصل مع الدعم لطلب إعادة التفعيل في الحالات الاستثنائية.",
    },
    {
      title: "3. التجديد والاستمرار",
      text: "تتحدث الباقات المدفوعة تلقائياً في تاريخ التجديد ما لم تقم بإلغائها قبل تاريخ التجديد. يتم تجديد الاشتراك بالسعر الحالي المعروض وقت التجديد.",
    },
    {
      title: "4. الإلغاء والخفض",
      text: "يمكنك إلغاء اشتراكك أو خفض مستواه في أي وقت. يستمر وصولك إلى مزايا باقتك الحالية حتى نهاية فترة الفوترة الحالية، ثم يتم تحويلك إلى الباقة المجانية.",
    },
    {
      title: "5. انتهاء الصلاحية",
      text: "عند انتهاء أو إلغاء اشتراكك المدفوع، يتم تحويل حسابك تلقائياً إلى الباقة المجانية مع الحدود المقابلة. لا يتم حذف بياناتك، لكن قد يتم تقييد الوصول إلى العقارات الإضافية فوق حد الباقة المجانية.",
    },
    {
      title: "6. تغييرات الباقة",
      text: "يمكنك ترقية باقتك في أي وقت. تسري الترقية فوراً، ويتم احتساب الفرق في السعر بنسبة الفترة المتبقية. لا تتوفر الترقية المدفوعة حالياً وسيتم تفعيلها قريباً.",
    },
    {
      title: "7. سياسة الاسترداد",
      text: "[سياسة الاسترداد — قيد الإنجاز]",
    },
    {
      title: "8. الموافقة المطلوبة للتفعيل",
      text: "يتطلب تفعيل التجربة المجانية أو الباقة المدفوعة موافقتك على شروط الاشتراك هذه. يتم تسجيل موافقتك مع الإصدار والتاريخ والمصدر، ولا يمكن تعديلها أو حذفها لضمان الامتثال.",
    },
  ] : [
    {
      title: "1. Plans and Pricing",
      text: "Madar offers the following plans:",
      items: [
        "Free: up to 1 property, limited daily pricing recommendations.",
        "Basic: up to 2 properties, market insights, 99 SAR/month.",
        "Growth: up to 5 properties, heatmap, multi-platform sync.",
        "Pro: up to 15 properties, unlimited AI assistant, daily reports.",
      ],
    },
    {
      title: "2. Free Trial",
      text: "Each new account is entitled to one 14-day free trial of the Growth plan. The trial is once per account and cannot be reactivated after expiry. Contact support to request reactivation in exceptional cases.",
    },
    {
      title: "3. Renewal and Continuation",
      text: "Paid plans automatically renew on the renewal date unless cancelled prior. The subscription renews at the current price displayed at renewal time.",
    },
    {
      title: "4. Cancellation and Downgrade",
      text: "You may cancel or downgrade your subscription at any time. You will retain access to your current plan's features until the end of the current billing period, after which you will be moved to the Free plan.",
    },
    {
      title: "5. Expiry",
      text: "Upon expiry or cancellation of your paid subscription, your account is automatically moved to the Free plan with the corresponding limits. Your data is not deleted, but access to additional properties beyond the Free plan limit may be restricted.",
    },
    {
      title: "6. Plan Changes",
      text: "You may upgrade your plan at any time. Upgrades take effect immediately, and the price difference is pro-rated for the remaining period. Paid upgrades are not currently available and will be activated soon.",
    },
    {
      title: "7. Refund Policy",
      text: "[Refund policy — to be finalized]",
    },
    {
      title: "8. Consent Required for Activation",
      text: "Activating the free trial or a paid plan requires your acceptance of these Subscription Terms. Your acceptance is recorded with the version, date, and source, and cannot be modified or deleted to ensure compliance.",
    },
  ];

  return <LegalPageLayout policyKey="subscription" sections={sections} />;
}