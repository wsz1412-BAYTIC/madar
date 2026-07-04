import LegalPageLayout from "@/components/LegalPageLayout";
import { useLanguage } from "@/lib/LanguageContext";

export default function Terms() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const sections = isRTL ? [
    {
      title: "1. قبول الشروط",
      text: "باستخدامك لمنصة مدار وموقعها الإلكتروني وخدماتها، فإنك توافق على الالتزام بشروط الاستخدام هذه. إذا كنت لا توافق على أي جزء من هذه الشروط، فيجب عليك عدم استخدام خدماتنا.",
    },
    {
      title: "2. وصف الخدمة",
      text: "مدار منصة لذكاء التسعير العقاري توفر توصيات أسعار مدعومة بالذكاء الاصطناعي لعقارات الإيجار قصير الأجل في المملكة العربية السعودية. تشمل الخدمات تحليل السوق، ومقارنة المنافسين، والمساعد الذكي، وتوصيات التسعير.",
    },
    {
      title: "3. طبيعة الاستشارة فقط",
      text: "جميع توصيات الذكاء الاصطناعي والمخرجات التحليلية التي تقدمها مدار هي لأغراض استشارية فقط. لا تشكل أي نصيحة قانونية أو ضريبية أو استثمارية أو مالية. يجب عليك إجراء بحثك الخاص والتشاور مع متخصصين قبل اتخاذ أي قرار تسعيري أو استثماري.",
    },
    {
      title: "4. عدم وجود ضمانات",
      text: "تُقدم الخدمات \"كما هي\" دون أي ضمانات صريحة أو ضمنية. نحن لا نضمن:",
      items: [
        "أي إيرادات أو إشغال أو ترتيب أو موافقة أو حجوزات محددة.",
        "دقة أو اكتمال بيانات السوق أو توصيات الذكاء الاصطناعي.",
        "أن الخدمات ستكون متاحة دون انقطاع أو خالية من الأخطاء.",
        "نتائج محددة من اتباع توصياتنا.",
      ],
    },
    {
      title: "5. مسؤولية المستخدم",
      text: "أنت مسؤول عن:",
      items: [
        "تقديم معلومات دقيقة وعملية عن عقاراتك.",
        "مراجعة وتقييم توصيات الذكاء الاصطناعي قبل تطبيقها.",
        "الامتثال لشروط منصات الإعلانات (Airbnb، Gathern، Booking.com).",
        "الحفاظ على سرية بيانات حسابك.",
      ],
    },
    {
      title: "6. حقوق الملكية الفكرية",
      text: "جميع حقوق الملكية الفكرية المتعلقة بمنصة مدار، بما في ذلك البرمجيات والتصميم والخوارزميات والعلامات التجارية، مملوكة لمدار أو مرخصة لها. لا يُمنح أي ترخيص ضمني باستخدام أي حقوق ملكية فكرية.",
    },
    {
      title: "7. تعليق الحساب وإنهاؤه",
      text: "نحتفظ بالحق في تعليق أو إنهاء حسابك في حال انتهاك هذه الشروط أو استخدام الخدمات بطريقة غير مصرح بها أو ضارة. يمكنك إلغاء حسابك في أي وقت عبر التواصل معنا.",
    },
    {
      title: "8. حدود المسؤولية",
      text: "بأقصى حد يسمح به القانون، لن تكون مدار مسؤولة عن أي أضرار غير مباشرة أو عرضية أو تبعية أو عقابية ناتجة عن استخدامك للخدمات. إجمالي مسؤوليتنا لا يتجاوز المبلغ الذي دفعته للاشتراك خلال الثلاثة أشهر السابقة للحدث.",
    },
    {
      title: "9. تغيير الشروط",
      text: "قد نقوم بتحديث هذه الشروط من وقت لآخر. سنخطرك بالتغييرات الجوهرية عبر البريد الإلكتروني أو داخل التطبيق. استمرارك في استخدام الخدمات بعد التغييرات يعني موافقتك على الشروط المحدثة.",
    },
  ] : [
    {
      title: "1. Acceptance of Terms",
      text: "By using the Madar platform, website, and services, you agree to be bound by these Terms of Use. If you do not agree to any part of these terms, you must not use our services.",
    },
    {
      title: "2. Service Description",
      text: "Madar is a rental pricing intelligence platform that provides AI-powered pricing recommendations for short-term rental properties in the Kingdom of Saudi Arabia. Services include market analysis, competitor comparison, an AI assistant, and pricing recommendations.",
    },
    {
      title: "3. Advisory-Only Nature",
      text: "All AI recommendations and analytical outputs provided by Madar are for advisory purposes only. They do not constitute legal, tax, investment, or financial advice. You should conduct your own research and consult with professionals before making any pricing or investment decisions.",
    },
    {
      title: "4. No Guarantees",
      text: "Services are provided \"as is\" without any express or implied warranties. We do not guarantee:",
      items: [
        "Any revenue, occupancy, ranking, approval, bookings, or compliance.",
        "The accuracy or completeness of market data or AI recommendations.",
        "That services will be uninterrupted or error-free.",
        "Specific results from following our recommendations.",
      ],
    },
    {
      title: "5. User Responsibilities",
      text: "You are responsible for:",
      items: [
        "Providing accurate and current information about your properties.",
        "Reviewing and evaluating AI recommendations before applying them.",
        "Complying with the terms of listing platforms (Airbnb, Gathern, Booking.com).",
        "Maintaining the confidentiality of your account credentials.",
      ],
    },
    {
      title: "6. Intellectual Property",
      text: "All intellectual property rights related to the Madar platform, including software, design, algorithms, and trademarks, are owned by or licensed to Madar. No implicit license is granted to use any intellectual property rights.",
    },
    {
      title: "7. Account Suspension and Termination",
      text: "We reserve the right to suspend or terminate your account if you violate these Terms or use the services in an unauthorized or harmful manner. You may cancel your account at any time by contacting us.",
    },
    {
      title: "8. Limitation of Liability",
      text: "To the maximum extent permitted by law, Madar shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the services. Our total liability shall not exceed the amount you paid for your subscription in the three months preceding the event.",
    },
    {
      title: "9. Changes to Terms",
      text: "We may update these Terms from time to time. We will notify you of material changes via email or within the app. Your continued use of the services after changes constitutes acceptance of the updated Terms.",
    },
  ];

  return <LegalPageLayout policyKey="terms" sections={sections} />;
}