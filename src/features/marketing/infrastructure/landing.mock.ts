import type { Locale } from "@/shared/i18n/config";
import type { LandingContent } from "@/features/marketing/domain/landing";

/** Shared hero photo (external, mock). Swap for a tenant/CMS asset later. */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=1200&fit=crop";

const en: LandingContent = {
  nav: {
    features: "Features",
    howItWorks: "How it works",
    themes: "Themes",
    pricing: "Pricing",
    signIn: "Sign in",
    getStarted: "Get started",
  },
  hero: {
    badge: "New · Live theme editor",
    title: "Beautiful digital menus for every restaurant",
    subtitle:
      "Create, translate, and publish a stunning menu in minutes. Scan to view, no app required, fully branded to your restaurant.",
    ctaPrimary: "Start free",
    ctaSecondary: "View a live menu",
    trust: ["No credit card", "Cancel anytime", "RTL & Arabic ready"],
    demoSlug: "aurum",
    preview: {
      tonightLabel: "Tonight at",
      restaurantName: "Aurum",
      imageUrl: HERO_IMAGE,
      items: [
        { name: "Wagyu Tartare", price: "$28" },
        { name: "Dry-Aged Ribeye", price: "$72" },
      ],
    },
    floatingScans: { label: "2,481 scans", sub: "this week" },
    floatingTheme: { label: "Theme updated", sub: "instantly live" },
  },
  trust: {
    label: "Trusted by modern restaurants",
    brands: ["Aurum", "Petal & Pour", "BurgerLab", "Zaytoon", "& more"],
  },
  features: {
    label: "Everything you need",
    title: "A menu platform built for hospitality",
    items: [
      {
        title: "Live theming",
        description:
          "Match your brand with presets or a custom palette — changes go live instantly.",
      },
      {
        title: "Scan to view",
        description:
          "Every table gets a QR code. Guests browse on their phone, no app to install.",
      },
      {
        title: "Multilingual & RTL",
        description:
          "Publish in Arabic and English with first-class right-to-left support.",
      },
      {
        title: "Instant updates",
        description:
          "Change a price or 86 an item and it updates everywhere in real time.",
      },
      {
        title: "Menu insights",
        description:
          "See what guests view most and when, with built-in menu analytics.",
      },
      {
        title: "Reliable & secure",
        description:
          "Fast, always-on hosting so your menu is ready whenever guests scan.",
      },
    ],
  },
  how: {
    label: "How it works",
    title: "Launch in three steps",
    items: [
      {
        title: "Create your menu",
        description:
          "Add categories, items, photos, and prices — or import what you already have.",
      },
      {
        title: "Pick a theme",
        description:
          "Choose a preset or craft a custom look that matches your brand.",
      },
      {
        title: "Share your QR",
        description: "Print the code, place it on tables, and you’re live.",
      },
    ],
  },
  themes: {
    label: "Themes",
    title: "One menu, endless looks",
    subtitle:
      "Switch presets or fine-tune every color, radius, and font. Preview it live.",
    demos: [
      { slug: "aurum", name: "Aurum" },
      { slug: "petal-pour", name: "Petal & Pour" },
      { slug: "burgerlab", name: "BurgerLab" },
      { slug: "zaytoon", name: "Zaytoon" },
    ],
  },
  pricing: {
    label: "Pricing",
    title: "Simple, transparent plans",
    subtitle: "Start free. Upgrade when you’re ready.",
    note: "Prices in USD. Taxes may apply.",
    mostPopular: "Most popular",
    plans: [

      {
        id: "growth",
        name: "Growth",
        description: "For growing restaurants",
        price: "$49",
        period: "/mo",
        features: [
          "Unlimited items",
          "Custom branding",
          "All languages & RTL",
          "Menu analytics",
          "Priority support",
        ],
        ctaLabel: "Start free",
        highlighted: true,
      },

    ],
  },
  faq: {
    label: "FAQ",
    title: "Questions, answered",
    items: [
      {
        q: "Do my guests need an app?",
        a: "No. They scan the QR code and your menu opens instantly in any browser.",
      },
      {
        q: "Can I publish in Arabic?",
        a: "Yes — MenuNova is fully bilingual with first-class right-to-left support.",
      },
      {
        q: "Can I match my brand?",
        a: "Absolutely. Use a preset or customize every color, font, and corner radius.",
      },
      {
        q: "How fast are updates?",
        a: "Instant. Edit a price or hide an item and it’s live everywhere immediately.",
      },
      {
        q: "Is there a free plan?",
        a: "Yes, the Starter plan is free forever for a single menu.",
      },
    ],
  },
  finalCta: {
    title: "Ready to serve a better menu?",
    subtitle: "Join restaurants delighting guests with MenuNova.",
    cta: "Start free",
  },
  footer: {
    tagline: "Digital menus for modern restaurants",
    features: "Features",
    pricing: "Pricing",
    signIn: "Sign in",
  },
};

const ar: LandingContent = {
  nav: {
    features: "المميزات",
    howItWorks: "كيف يعمل",
    themes: "الأنماط",
    pricing: "الأسعار",
    signIn: "تسجيل الدخول",
    getStarted: "ابدأ الآن",
  },
  hero: {
    badge: "جديد · محرّر الأنماط المباشر",
    title: "قوائم طعام رقمية جميلة لكل مطعم",
    subtitle:
      "أنشئ قائمتك وترجمها وانشرها خلال دقائق. امسح لتتصفّح، دون أي تطبيق، وبهوية مطعمك الكاملة.",
    ctaPrimary: "ابدأ مجانًا",
    ctaSecondary: "شاهد قائمة مباشرة",
    trust: ["دون بطاقة ائتمان", "إلغاء في أي وقت", "يدعم العربية وRTL"],
    demoSlug: "aurum",
    preview: {
      tonightLabel: "الليلة في",
      restaurantName: "Aurum",
      imageUrl: HERO_IMAGE,
      items: [
        { name: "تارتار واغيو", price: "$28" },
        { name: "ريب آي معتّق", price: "$72" },
      ],
    },
    floatingScans: { label: "2,481 مسحة", sub: "هذا الأسبوع" },
    floatingTheme: { label: "تم تحديث النمط", sub: "مباشر فورًا" },
  },
  trust: {
    label: "موثوق من مطاعم عصرية",
    brands: ["Aurum", "Petal & Pour", "BurgerLab", "Zaytoon", "والمزيد"],
  },
  features: {
    label: "كل ما تحتاجه",
    title: "منصّة قوائم مصمّمة للضيافة",
    items: [
      {
        title: "تنسيق مباشر",
        description: "طابِق هويتك بأنماط جاهزة أو ألوان مخصّصة — تظهر التغييرات فورًا.",
      },
      {
        title: "امسح لتتصفّح",
        description: "لكل طاولة رمز QR. يتصفّح ضيوفك من هواتفهم دون أي تطبيق.",
      },
      {
        title: "متعدد اللغات وRTL",
        description: "انشر بالعربية والإنجليزية بدعم كامل للكتابة من اليمين إلى اليسار.",
      },
      {
        title: "تحديثات فورية",
        description: "غيّر سعرًا أو أوقف صنفًا فيتحدّث في كل مكان لحظيًا.",
      },
      {
        title: "تحليلات القائمة",
        description: "اعرف أكثر الأصناف مشاهدةً ومتى، مع تحليلات مدمجة.",
      },
      {
        title: "موثوق وآمن",
        description: "استضافة سريعة ودائمة لتكون قائمتك جاهزة عند كل مسح.",
      },
    ],
  },
  how: {
    label: "كيف يعمل",
    title: "انطلق في ثلاث خطوات",
    items: [
      {
        title: "أنشئ قائمتك",
        description: "أضف التصنيفات والأصناف والصور والأسعار — أو استورد ما لديك.",
      },
      {
        title: "اختر نمطًا",
        description: "اختر نمطًا جاهزًا أو صمّم مظهرًا يطابق هويتك.",
      },
      {
        title: "شارك رمزك",
        description: "اطبع الرمز وضعه على الطاولات وستكون مباشرًا.",
      },
    ],
  },
  themes: {
    label: "الأنماط",
    title: "قائمة واحدة، مظاهر لا تنتهي",
    subtitle: "بدّل الأنماط أو اضبط كل لون وحواف وخط. عايِن مباشرة.",
    demos: [
      { slug: "aurum", name: "Aurum" },
      { slug: "petal-pour", name: "Petal & Pour" },
      { slug: "burgerlab", name: "BurgerLab" },
      { slug: "zaytoon", name: "Zaytoon" },
    ],
  },
  pricing: {
    label: "الأسعار",
    title: "خطط بسيطة وواضحة",
    subtitle: "ابدأ مجانًا. ارتقِ عندما تجهز.",
    note: "الأسعار بالدولار. قد تُطبّق ضرائب.",
    mostPopular: "الأكثر شيوعًا",
    plans: [
      {
        id: "growth",
        name: "النمو",
        description: "للمطاعم المتنامية",
        price: "$49",
        period: "/شهر",
        features: [
          "أصناف غير محدودة",
          "هوية مخصّصة",
          "كل اللغات وRTL",
          "تحليلات القائمة",
          "دعم ذو أولوية",
        ],
        ctaLabel: "ابدأ مجانًا",
        highlighted: true,
      },

    ],
  },
  faq: {
    label: "الأسئلة الشائعة",
    title: "إجابات لأسئلتك",
    items: [
      {
        q: "هل يحتاج ضيوفي تطبيقًا؟",
        a: "لا. يمسحون رمز QR فتفتح قائمتك فورًا في أي متصفح.",
      },
      {
        q: "هل يمكنني النشر بالعربية؟",
        a: "نعم — مينونوفا ثنائية اللغة بالكامل مع دعم كامل للكتابة من اليمين إلى اليسار.",
      },
      {
        q: "هل أطابق هويتي؟",
        a: "بالتأكيد. استخدم نمطًا جاهزًا أو خصّص كل لون وخط وحواف.",
      },
      {
        q: "ما سرعة التحديثات؟",
        a: "فورية. عدّل سعرًا أو أخفِ صنفًا فيظهر مباشرًا في كل مكان.",
      },
      {
        q: "هل توجد خطة مجانية؟",
        a: "نعم، خطة المبتدئة مجانية للأبد لقائمة واحدة.",
      },
    ],
  },
  finalCta: {
    title: "جاهز لتقديم قائمة أفضل؟",
    subtitle: "انضم لمطاعم تُبهر ضيوفها مع مينونوفا.",
    cta: "ابدأ مجانًا",
  },
  footer: {
    tagline: "قوائم رقمية للمطاعم العصرية",
    features: "المميزات",
    pricing: "الأسعار",
    signIn: "تسجيل الدخول",
  },
};

export const LANDING_CONTENT: Record<Locale, LandingContent> = { en, ar };
