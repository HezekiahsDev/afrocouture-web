/**
 * English copy — the source of truth for every translated string.
 *
 * `Dictionary` is inferred from this object, so every other language must
 * provide the same keys (and the same function signatures) or TypeScript fails
 * the build. Prefer a function for anything with a count or interpolated value.
 */
export const en = {
  language: {
    label: "Language",
    choose: "Choose a language",
  },

  nav: {
    home: "IPILE — home",
    mainNavigation: "Main navigation",
    discover: "Discover",
    fabrics: "Fabrics",
    artisans: "Artisans",
    aiStudio: "AI Studio",
    soon: "Soon",
    searchLabel: "Search styles, fabrics, or artisans",
    searchPlaceholder: "Search the atelier",
    submitSearch: "Submit search",
    accountMenu: "Account menu",
    yourAccount: "Your account",
    notifications: "Notifications",
    unread: (count: number) => `${count} unread`,
    orders: "Orders",
    toDo: (count: number) => `${count} to do`,
    ordersAttention: (count: number) =>
      `Orders, ${count} need${count === 1 ? "s" : ""} your attention`,
    selection: "Your selection",
    selectionLabel: (count: number) =>
      `Your selection, ${count} saved item${count === 1 ? "" : "s"}`,
    myFabrics: "My fabrics",
    adminDashboard: "Admin dashboard",
    signOut: "Sign out",
    signIn: "Sign in",
    joinAtelier: "Join the atelier",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    profile: {
      customer: "My fit profile",
      tailor: "My artisan profile",
      merchant: "My merchant profile",
    },
    roles: {
      customer: "Customer",
      tailor: "Artisan",
      merchant: "Merchant",
      admin: "Admin",
    },
  },

  notifications: {
    label: (unread: number) =>
      `Notifications${unread ? `, ${unread} unread` : ""}`,
    title: "Notifications",
    markAllRead: "Mark all read",
    error: "Couldn't load notifications. Try again in a moment.",
    loading: "Loading…",
    empty:
      "You're all caught up. Order updates and messages will appear here.",
    seeAll: "See all notifications",
    justNow: "Just now",
    minutesAgo: (value: number) => `${value}m ago`,
    hoursAgo: (value: number) => `${value}h ago`,
    daysAgo: (value: number) => `${value}d ago`,
    unreadLabel: "Unread",
  },

  footer: {
    home: "IPILE — home",
    kicker: "CRAFTED AROUND YOU",
    titleLead: "Made for the way",
    titleEmphasis: "you move.",
    startDesign: "Start your design",
    tagline: "Contemporary African luxury, thoughtfully made.",
    fabrics: "Fabrics",
    artisans: "Artisans",
    support: "Support",
    terms: "Terms",
    privacy: "Privacy",
  },

  setup: {
    choose:
      "Finish setting up: tell us whether you’re here to shop, make or sell fabric.",
    chooseCta: "Choose your path",
    start: (who: "artisan" | "merchant") =>
      `Finish your ${who} profile. Customers can see you once our team has verified it.`,
    startCta: "Continue setup",
    pending: (who: "artisan" | "merchant") =>
      `Your ${who} profile is with our team for review. We’ll email you as soon as you’re live.`,
    pendingCta: "View profile",
    changes: (who: "artisan" | "merchant", note: string | null) =>
      `Your ${who} profile needs a few changes before it can go live${
        note ? `: “${note}”` : "."
      }`,
    changesCta: "Make changes",
  },

  marketplace: {
    heroEyebrow: "CONTEMPORARY AFRICAN LUXURY",
    heroTitleLead: "Your vision,",
    heroTitleEmphasis: "thoughtfully made.",
    heroBody:
      "Discover skilled makers, explore fabrics, and bring your next outfit to life.",
    startDesign: "Start your design",
    exploreAtelier: "Explore the atelier",
    heroTrust: "Every artisan and merchant is reviewed before they go live.",
    heroLabelKicker: "01 / THE NEW ATELIER",
    heroLabelTitle: "Craft meets imagination.",
    heroVertical: "IPILE · CRAFTED AROUND YOU",
    scrollToExplore: "Scroll to explore",

    valueStripLabel: "How IPILE works",
    valueArtisans: "Skilled artisans",
    valueStyle: "A style that is yours",
    valueMadeAroundYou: "Made around you",

    resultsKicker: "SEARCH",
    resultsFor: "Results for",
    resultsSummary: (artisans: number, fabrics: number, styles: number) =>
      `${artisans} ${artisans === 1 ? "artisan" : "artisans"} · ${fabrics} ${
        fabrics === 1 ? "fabric" : "fabrics"
      } · ${styles} ${styles === 1 ? "style" : "styles"}`,
    clearSearch: "Clear search",

    possibilitiesKicker: "01 / THE POSSIBILITIES",
    possibilitiesTitleLead: "Start with what",
    possibilitiesTitleEmphasis: "inspires you.",
    possibilitiesBody:
      "Every great piece begins somewhere. Find your next one here.",
    findArtisan: "Find an artisan",
    findArtisanBody:
      "Work one on one with a maker who understands your vision.",
    exploreArtisans: "Explore artisans",
    discoverFabric: "Discover fabric",
    discoverFabricBody:
      "Find texture, color, and heritage in every beautiful weave.",
    exploreFabrics: "Explore fabrics",
    createOwn: "Create your own",
    createOwnBody:
      "Begin your bespoke journey with an idea, then make it real.",
    getStarted: "Get started",

    stylesKicker: "02 / STYLE NOTES",
    stylesTitleLead: "Wear the",
    stylesTitleEmphasis: "occasion.",
    stylesBody: "Considered silhouettes for every chapter of your life.",
    previousStyles: "Previous styles",
    nextStyles: "Next styles",
    startPiece: (name: string) => `Start a ${name} piece`,
    fromPrice: (price: string) => `From ${price}`,
    noStylesFor: (query: string) => `No styles match “${query}”`,
    noStylesYet: "No styles yet",
    noStylesForBody: "Try a broader word like “kaftan” or “wedding”.",
    noStylesYetBody:
      "New silhouettes are on their way. Explore fabrics in the meantime.",

    makingKicker: "THE ART OF MAKING",
    makingTitleLead: "Made by hands.",
    makingTitleEmphasis: "Made for you.",
    makingBody:
      "Behind every stitch is a person, a place, and a story. Discover the artisans turning your ideas into pieces to keep.",
    meetMakers: "Meet the makers",

    artisansKicker: "03 / PEOPLE BEHIND THE PIECES",
    artisansTitleLead: "Meet your",
    artisansTitleEmphasis: "maker.",
    artisansBody:
      "Independent artisans with a point of view and a love for their craft.",
    viewAllArtisans: "View all artisans",
    artisansPreviewNote:
      "Illustrative artisan profiles and sample pricing for this preview.",
    filterArtisans: "Filter artisans by city",
    allCities: "All cities",
    artisanFallback: "Artisan",
    viewProfile: (name: string) => `View ${name}'s profile`,
    verifiedArtisan: "Verified artisan",
    saveProfile: (name: string) => `Save ${name}`,
    removeProfile: (name: string) => `Remove ${name}`,
    sampleProfile: "Sample profile — not taking commissions",
    requestCommission: "Request a commission",
    noArtisansFor: (query: string) => `No artisans match “${query}”`,
    noArtisansYet: "No artisans here yet",
    noArtisansInCity: (city: string) =>
      `No artisans in ${city} match. Try another city.`,
    noArtisansYetBody:
      "Verified artisans appear here as soon as they're approved.",
    browseAllArtisans: "Browse all artisans",

    fabricsKicker: "04 / THE TEXTILE EDIT",
    fabricsTitleLead: "Start with the",
    fabricsTitleEmphasis: "material.",
    fabricsBody: "Beautiful fabrics chosen for the stories they help tell.",
    exploreAllFabrics: "Explore all fabrics",
    fabricsPreviewNote:
      "Sample listings and pricing. Availability is confirmed by each merchant.",
    filterFabrics: "Filter fabrics by type",
    allFabrics: "All",
    textileAlt: (name: string) => `${name} textile`,
    verifiedMerchant: "Verified merchant",
    noFabricsFor: (query: string) => `No fabrics match “${query}”`,
    noFabricsYet: "No fabrics listed yet",
    noFabricsYetBody: "Verified merchants add new textiles regularly.",
    openFabricExplorer: "Open the fabric explorer",

    promptKicker: "YOUR NEXT IDEA STARTS HERE",
    promptTitleLead: "What would you",
    promptTitleEmphasis: "create?",
    promptBodyAi:
      "Describe the piece you have in mind. AI Studio turns it into design previews you can take to an artisan as a commission.",
    promptBody:
      "Describe the piece you have in mind and add photos of the style you love. A verified artisan quotes to make it for you.",
    promptLabel: "Describe your style idea",
    promptPlaceholder: "A midnight blue kaftan with gold embroidery…",
    designInAiStudio: "Design this idea in AI Studio",
    commissionThisIdea: "Commission this idea",
    tryIdea: "Try an idea:",
    ideas: ["Modern agbada", "Wedding guest look", "Everyday Ankara"],

    trustReviewed: "Artisans reviewed before they go live",
    trustPrices: "Starting prices shown up front",
    trustMeasurements: "Measurements saved once in your fit profile",
  },
};

export type Dictionary = typeof en;
