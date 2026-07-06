// Public (guest) assistant — a deterministic bilingual FAQ engine.
//
// Guests are anonymous, so this assistant deliberately calls NO backend and
// NO LLM: it answers from a curated knowledge base about Madar's features,
// plans, signup steps, and support channels. By construction it cannot
// access or discuss customer data, properties, internal metrics, or admin
// information — private or unsupported questions get a safe, friendly
// redirect to signup or support. Pure module, unit-tested.

const normalize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '') // Arabic diacritics + tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();

// Questions about private/internal things a public bot must never touch.
const PRIVATE_PATTERNS = [
  /\bmy (propert|revenue|earnings|account|listing|price|report|data|subscription|bill)/,
  /\b(other|another) (user|host|customer)/,
  /\b(admin|database|internal|backend|api key|password|token)\b/,
  /عقاري|عقاراتي|ايرادي|ايراداتي|حسابي|اشتراكي|فاتورتي|بياناتي|تقريري|ارباحي/,
  /مستخدم اخر|عميل اخر|مضيف اخر/,
  /قاعده البيانات|كلمه المرور|لوحه الادمن|المشرف/,
];

// Curated public knowledge base. Every answer must stay marketing-public:
// nothing here may reference a specific customer, metric, or internal system.
const KNOWLEDGE_BASE = [
  {
    id: 'what_is_madar',
    keywords: ['what is madar', 'about madar', 'who are you', 'ما هو مدار', 'عن مدار', 'من انتم', 'وش مدار'],
    answer: {
      en: 'Madar is an AI revenue co-pilot for short-term rental hosts in Saudi Arabia. It analyzes your listings across Airbnb, Gathern and Booking.com and suggests pricing and improvements — you stay in control of every change.',
      ar: 'مدار هو مساعد إيرادات ذكي لمضيفي الإيجار قصير المدة في السعودية. يحلل إعلاناتك على Airbnb وGathern وBooking.com ويقترح تحسينات وتسعيرًا أفضل — والقرار النهائي دائمًا بيدك.',
    },
    links: [{ to: '/how-to-use', label: { en: 'How Madar works', ar: 'كيف يعمل مدار' } }],
  },
  {
    id: 'features',
    keywords: ['feature', 'what can', 'tools', 'services', 'المزايا', 'الميزات', 'الخدمات', 'وش يسوي', 'ماذا يقدم'],
    answer: {
      en: 'Madar offers AI pricing recommendations, market insights for 12+ Saudi cities, multi-platform listing links, performance reports, alerts, and an AI assistant for your properties. Higher plans add competitor comparison, heatmaps, and an investment consultant.',
      ar: 'يقدم مدار توصيات تسعير ذكية، ومؤشرات سوق لأكثر من 12 مدينة سعودية، وربط الإعلانات عبر المنصات، وتقارير أداء وتنبيهات، ومساعدًا ذكيًا لعقاراتك. وتضيف الباقات الأعلى مقارنة المنافسين والخرائط الحرارية والمستشار الاستثماري.',
    },
    links: [{ to: '/pricing', label: { en: 'Compare plans', ar: 'قارن الباقات' } }],
  },
  {
    id: 'pricing',
    keywords: ['price', 'pricing', 'cost', 'plan', 'subscription', 'how much', 'الاسعار', 'السعر', 'الباقات', 'الخطط', 'التكلفه', 'كم سعر', 'اشتراك'],
    answer: {
      en: 'Madar has a free plan to start, plus paid plans (Basic, Growth, Pro and a custom Business tier) with more properties, deeper AI limits and richer reports. Full, up-to-date pricing is on the pricing page.',
      ar: 'يوفر مدار باقة مجانية للبدء، وباقات مدفوعة (الأساسية والنمو وبرو وباقة أعمال مخصصة) بعدد عقارات أكبر وحدود ذكاء اصطناعي أعلى وتقارير أشمل. الأسعار الكاملة والمحدثة في صفحة الأسعار.',
    },
    links: [{ to: '/pricing', label: { en: 'View pricing', ar: 'عرض الأسعار' } }],
  },
  {
    id: 'trial',
    keywords: ['trial', 'free trial', 'try', 'تجربه', 'تجريبيه', 'مجانيه', 'اجرب'],
    answer: {
      en: 'New accounts can activate one free 14-day Growth trial — no credit card required. When it ends you simply return to the free plan unless you subscribe.',
      ar: 'يمكن للحسابات الجديدة تفعيل تجربة مجانية واحدة لباقة النمو لمدة 14 يومًا — دون بطاقة ائتمان. وعند انتهائها تعود تلقائيًا للباقة المجانية ما لم تشترك.',
    },
    links: [{ to: '/signup', label: { en: 'Create an account', ar: 'أنشئ حسابًا' } }],
  },
  {
    id: 'signup',
    keywords: ['sign up', 'signup', 'register', 'create account', 'get started', 'how do i start', 'التسجيل', 'انشاء حساب', 'اسجل', 'ابدا', 'كيف ابدأ'],
    answer: {
      en: 'Signing up takes about two minutes: create an account with your name and email, verify the code we send you, then add your first property with the guided wizard (you can even paste an Airbnb link and we prefill what we can).',
      ar: 'التسجيل يستغرق دقيقتين تقريبًا: أنشئ حسابًا باسمك وبريدك، وأدخل رمز التحقق المُرسل إليك، ثم أضف عقارك الأول عبر المعالج الإرشادي (يمكنك لصق رابط Airbnb وسنعبّئ ما نستطيع تلقائيًا).',
    },
    links: [{ to: '/signup', label: { en: 'Start free', ar: 'ابدأ مجانًا' } }],
  },
  {
    id: 'platforms',
    keywords: ['airbnb', 'gathern', 'booking', 'platform', 'المنصات', 'اير بي ان بي', 'جاذرن', 'بوكينج'],
    answer: {
      en: 'Madar works with listings on Airbnb, Gathern and Booking.com — you can link one listing per platform to each property.',
      ar: 'يعمل مدار مع إعلانات Airbnb وGathern وBooking.com — ويمكنك ربط إعلان واحد لكل منصة بكل عقار.',
    },
    links: [{ to: '/how-to-use', label: { en: 'How it works', ar: 'كيف يعمل' } }],
  },
  {
    id: 'support',
    keywords: ['support', 'help', 'contact', 'complaint', 'problem', 'الدعم', 'مساعده', 'تواصل', 'شكوى', 'مشكله'],
    answer: {
      en: 'You can reach Madar support through the WhatsApp button here, or the contact page for complaints and data requests. We answer in Arabic and English.',
      ar: 'يمكنك الوصول لدعم مدار عبر زر واتساب هنا، أو صفحة التواصل للشكاوى وطلبات البيانات. نجيب بالعربية والإنجليزية.',
    },
    links: [{ to: '/contact', label: { en: 'Contact & complaints', ar: 'التواصل والشكاوى' } }],
  },
  {
    id: 'security_privacy',
    keywords: ['privacy', 'secure', 'safe', 'data protection', 'pdpl', 'الخصوصيه', 'امان', 'حمايه البيانات'],
    answer: {
      en: 'Madar follows Saudi PDPL-aligned practices: your data is scoped to your own account, and our Privacy Policy and Data & AI Policy explain exactly what we collect and why.',
      ar: 'يلتزم مدار بممارسات متوافقة مع نظام حماية البيانات الشخصية السعودي: بياناتك مقصورة على حسابك، وتوضح سياسة الخصوصية وسياسة البيانات والذكاء الاصطناعي ما نجمعه ولماذا بالتفصيل.',
    },
    links: [{ to: '/privacy', label: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' } }],
  },
];

const PRIVATE_GUARD_ANSWER = {
  en: "I'm the public Madar guide, so I can't see or discuss any account, property, or customer data. Once you sign in, the in-app assistant can help with your own account — or our support team can assist directly.",
  ar: 'أنا الدليل العام لمدار، لذا لا يمكنني الاطلاع على أي بيانات حسابات أو عقارات أو عملاء أو مناقشتها. بعد تسجيل الدخول سيساعدك المساعد الذكي داخل المنصة في حسابك — أو يمكن لفريق الدعم مساعدتك مباشرة.',
};

const FALLBACK_ANSWER = {
  en: "I can help with general questions about Madar's features, plans, signing up, and support. For anything else, our team is happy to help — or create a free account to explore the platform yourself.",
  ar: 'أستطيع مساعدتك في الأسئلة العامة عن مزايا مدار وباقاته وخطوات التسجيل والدعم. ولأي شيء آخر يسعد فريقنا بمساعدتك — أو أنشئ حسابًا مجانيًا لاستكشاف المنصة بنفسك.',
};

const GUIDANCE_LINKS = [
  { to: '/signup', label: { en: 'Create a free account', ar: 'أنشئ حسابًا مجانيًا' } },
  { to: '/contact', label: { en: 'Contact support', ar: 'تواصل مع الدعم' } },
];

export const PUBLIC_SUGGESTED_QUESTIONS = {
  en: ['What is Madar?', 'How much does it cost?', 'How do I sign up?', 'Which platforms are supported?'],
  ar: ['ما هو مدار؟', 'كم تكلفة الاشتراك؟', 'كيف أسجل؟', 'ما المنصات المدعومة؟'],
};

/**
 * Answer a guest question from the public knowledge base.
 * Returns { type: 'faq'|'private_guard'|'fallback', id?, answer: {en,ar}, links }.
 * Never throws, never calls a backend, never references customer data.
 */
export function answerPublicQuestion(question) {
  const q = normalize(question);
  if (!q) return { type: 'fallback', answer: FALLBACK_ANSWER, links: GUIDANCE_LINKS };

  for (const re of PRIVATE_PATTERNS) {
    if (re.test(q)) {
      return { type: 'private_guard', answer: PRIVATE_GUARD_ANSWER, links: GUIDANCE_LINKS };
    }
  }

  let best = null;
  for (const entry of KNOWLEDGE_BASE) {
    const hits = entry.keywords.filter((k) => q.includes(normalize(k))).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { entry, hits };
  }
  if (best) {
    return { type: 'faq', id: best.entry.id, answer: best.entry.answer, links: best.entry.links };
  }
  return { type: 'fallback', answer: FALLBACK_ANSWER, links: GUIDANCE_LINKS };
}
