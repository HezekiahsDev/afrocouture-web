/**
 * Igbo copy.
 *
 * Typed against the English dictionary, so a missing or renamed key fails the
 * type check. Igbo is written in standard Ọnwụ orthography with the dotted
 * vowels (ị, ọ, ụ) and ṅ; tone marks are left out, as in everyday writing.
 * The brand addresses people with "gị".
 *
 * Draft translation: have a native Igbo speaker review product and legal copy
 * before launch.
 */
import type { Dictionary } from "./en";

const role = (who: "artisan" | "merchant") =>
  who === "artisan" ? "ọka nka" : "onye na-ere ahịa";

export const ig: Dictionary = {
  language: {
    label: "Asụsụ",
    choose: "Họrọ asụsụ",
  },

  nav: {
    home: "IPILE — ụlọ",
    mainNavigation: "Ntụziaka isi",
    discover: "Chọpụta",
    fabrics: "Akwa",
    artisans: "Ndị ọka nka",
    aiStudio: "Ụlọ Ọrụ AI",
    soon: "N'oge na-adịghị anya",
    searchLabel: "Chọọ ụdị, akwa, ma ọ bụ ndị ọka nka",
    searchPlaceholder: "Chọọ n'ụlọ nka",
    submitSearch: "Zipu nchọ",
    accountMenu: "Nhọrọ akaụntụ",
    yourAccount: "Akaụntụ gị",
    notifications: "Ọkwa",
    unread: (count: number) => `${count} a gụbeghị`,
    orders: "Ọda",
    toDo: (count: number) => `${count} ka a ga-eme`,
    ordersAttention: (count: number) =>
      `Ọda, ${count} chọrọ nlebara anya gị`,
    selection: "Nhọrọ gị",
    selectionLabel: (count: number) => `Nhọrọ gị, ihe ${count} echekwara`,
    myFabrics: "Akwa m",
    adminDashboard: "Dashbọọdụ nchịkwa",
    signOut: "Pụọ",
    signIn: "Banye",
    joinAtelier: "Sonye n'ụlọ nka",
    openMenu: "Mepee nhọrọ",
    closeMenu: "Mechie nhọrọ",
    profile: {
      customer: "Profaịlụ nha m",
      tailor: "Profaịlụ ọka nka m",
      merchant: "Profaịlụ onye ahịa m",
    },
    roles: {
      customer: "Onye na-azụ ahịa",
      tailor: "Ọka nka",
      merchant: "Onye na-ere ahịa",
      admin: "Onye nchịkwa",
    },
  },

  notifications: {
    label: (unread: number) =>
      `Ọkwa${unread ? `, ${unread} a gụbeghị` : ""}`,
    title: "Ọkwa",
    markAllRead: "Kaa ha niile dị ka a gụrụ agụ",
    error: "Enweghị ike ibudata ọkwa. Nwaa ọzọ n'oge na-adịghị anya.",
    loading: "Ọ na-ebu…",
    empty: "Ọ dịghị ihe ọhụrụ. Mmelite ọda na ozi ga-apụta ebe a.",
    seeAll: "Hụ ọkwa niile",
    justNow: "Ugbu a",
    minutesAgo: (value: number) => `Nkeji ${value} gara aga`,
    hoursAgo: (value: number) => `Awa ${value} gara aga`,
    daysAgo: (value: number) => `Ụbọchị ${value} gara aga`,
    unreadLabel: "A gụbeghị",
  },

  footer: {
    home: "IPILE — ụlọ",
    kicker: "EMERE MAKA GỊ",
    titleLead: "Emere maka otú",
    titleEmphasis: "ị si eje ije.",
    startDesign: "Malite ime ụdị gị",
    tagline: "Ọmarịcha ejiji Afrịka nke oge a, ejiri echiche mee.",
    fabrics: "Akwa",
    artisans: "Ndị ọka nka",
    support: "Nkwado",
    terms: "Usoro",
    privacy: "Nzuzo",
  },

  setup: {
    choose:
      "Mechaa nhazi: gwa anyị ma ị bịara ịzụ ahịa, ịkwa akwa, ma ọ bụ ire akwa.",
    chooseCta: "Họrọ ụzọ gị",
    start: (who: "artisan" | "merchant") =>
      `Mechaa profaịlụ ${role(who)} gị. Ndị na-azụ ahịa ga-ahụ gị ozugbo ndị otu anyị nyochachara ya.`,
    startCta: "Gaa n'ihu na nhazi",
    pending: (who: "artisan" | "merchant") =>
      `Ndị otu anyị na-enyocha profaịlụ ${role(who)} gị. Anyị ga-ezitere gị email ozugbo ndị mmadụ nwere ike ịhụ gị.`,
    pendingCta: "Lee profaịlụ",
    changes: (who: "artisan" | "merchant", note: string | null) =>
      `Profaịlụ ${role(who)} gị chọrọ mgbanwe ole na ole tupu e bipụta ya${
        note ? `: “${note}”` : "."
      }`,
    changesCta: "Mee mgbanwe",
  },

  marketplace: {
    heroEyebrow: "ỌMARỊCHA EJIJI AFRỊKA NKE OGE A",
    heroTitleLead: "Ọhụụ gị,",
    heroTitleEmphasis: "ejiri echiche mee.",
    heroBody:
      "Chọpụta ndị ọka nka nwere nkà, nyochaa akwa dị iche iche, ma mee ka uwe gị ọzọ dị ndụ.",
    startDesign: "Malite ime ụdị gị",
    exploreAtelier: "Nyochaa ụlọ nka",
    heroTrust:
      "A na-enyocha ọka nka na onye na-ere ahịa ọ bụla tupu ha apụta.",
    heroLabelKicker: "01 / ỤLỌ NKA ỌHỤRỤ",
    heroLabelTitle: "Nka zutere echiche.",
    heroVertical: "IPILE · EMERE MAKA GỊ",
    scrollToExplore: "Pịgharịa ka ị chọpụta",

    valueStripLabel: "Otú IPILE si arụ ọrụ",
    valueArtisans: "Ndị ọka nka nwere nkà",
    valueStyle: "Ụdị nke bụ nke gị",
    valueMadeAroundYou: "Emere maka gị",

    resultsKicker: "NCHỌ",
    resultsFor: "Nsonaazụ maka",
    resultsSummary: (artisans: number, fabrics: number, styles: number) =>
      `Ọka nka ${artisans} · akwa ${fabrics} · ụdị ${styles}`,
    clearSearch: "Hichapụ nchọ",

    possibilitiesKicker: "01 / OHERE DỊ ICHE ICHE",
    possibilitiesTitleLead: "Malite na ihe",
    possibilitiesTitleEmphasis: "na-akpali gị.",
    possibilitiesBody:
      "Ọrụ ọ bụla dị ebube na-amalite n'ebe ụfọdụ. Chọta nke gị ọzọ ebe a.",
    findArtisan: "Chọta ọka nka",
    findArtisanBody:
      "Gị na ọka nka ghọtara ọhụụ gị rụkọọ ọrụ n'onwe unu.",
    exploreArtisans: "Nyochaa ndị ọka nka",
    discoverFabric: "Chọpụta akwa",
    discoverFabricBody:
      "Chọta ụdị mmetụ, agba, na ihe nketa n'akwa ọ bụla mara mma.",
    exploreFabrics: "Nyochaa akwa",
    createOwn: "Mepụta nke gị",
    createOwnBody:
      "Jiri echiche malite njem uwe pụrụ iche gị, wee mee ka ọ bụrụ eziokwu.",
    getStarted: "Malite",

    stylesKicker: "02 / NDETU ỤDỊ",
    stylesTitleLead: "Yiri uwe maka",
    stylesTitleEmphasis: "emume ahụ.",
    stylesBody: "Ụdị uwe e chebara echiche maka oge ọ bụla nke ndụ gị.",
    previousStyles: "Ụdị gara aga",
    nextStyles: "Ụdị ndị ọzọ",
    startPiece: (name: string) => `Malite uwe ${name}`,
    fromPrice: (price: string) => `Site na ${price}`,
    noStylesFor: (query: string) => `Ọ dịghị ụdị dabara na “${query}”`,
    noStylesYet: "Ọ dịbeghị ụdị ọ bụla",
    noStylesForBody:
      "Nwaa okwu sara mbara dị ka “kaftan” ma ọ bụ “agbamakwụkwọ”.",
    noStylesYetBody:
      "Ụdị ọhụrụ na-abịa. Ka ọ dị ugbu a, nyochaa akwa.",

    makingKicker: "NKA NKE IME IHE",
    makingTitleLead: "Aka mere ya.",
    makingTitleEmphasis: "Emere ya maka gị.",
    makingBody:
      "N'azụ mkpụrụ ịkwa ọ bụla, e nwere mmadụ, ebe, na akụkọ. Chọpụta ndị ọka nka na-eme ka echiche gị ghọọ uwe ị ga-edebe.",
    meetMakers: "Zute ndị ọka nka",

    artisansKicker: "03 / NDỊ NỌ N'AZỤ ỌRỤ AHỤ",
    artisansTitleLead: "Zute",
    artisansTitleEmphasis: "ọka nka gị.",
    artisansBody:
      "Ndị ọka nka nọọrọ onwe ha, nwere echiche nke ha na ịhụnanya maka nka ha.",
    viewAllArtisans: "Hụ ndị ọka nka niile",
    artisansPreviewNote:
      "Profaịlụ ọka nka atụ na ọnụahịa atụ maka ngosi a.",
    filterArtisans: "Kewaa ndị ọka nka site n'obodo",
    allCities: "Obodo niile",
    artisanFallback: "Ọka nka",
    viewProfile: (name: string) => `Lee profaịlụ ${name}`,
    verifiedArtisan: "Ọka nka a kwadoro",
    saveProfile: (name: string) => `Chekwaa ${name}`,
    removeProfile: (name: string) => `Wepụ ${name}`,
    sampleProfile: "Profaịlụ atụ — anaghị anabata ọrụ",
    requestCommission: "Rịọ ka e meere gị",
    noArtisansFor: (query: string) =>
      `Ọ dịghị ọka nka dabara na “${query}”`,
    noArtisansYet: "Ọ dịbeghị ọka nka ebe a",
    noArtisansInCity: (city: string) =>
      `Ọ dịghị ọka nka dabara na ${city}. Nwaa obodo ọzọ.`,
    noArtisansYetBody:
      "Ndị ọka nka a kwadoro ga-apụta ebe a ozugbo a nabatara ha.",
    browseAllArtisans: "Lee ndị ọka nka niile",

    fabricsKicker: "04 / NHỌRỌ AKWA",
    fabricsTitleLead: "Malite na",
    fabricsTitleEmphasis: "akwa ahụ.",
    fabricsBody: "Akwa mara mma a họọrọ maka akụkọ ha na-enyere aka ịkọ.",
    exploreAllFabrics: "Nyochaa akwa niile",
    fabricsPreviewNote:
      "Ndepụta atụ na ọnụahịa. Onye na-ere ahịa ọ bụla na-akwado ma ọ dị.",
    filterFabrics: "Kewaa akwa site n'ụdị",
    allFabrics: "Niile",
    textileAlt: (name: string) => `Akwa ${name}`,
    verifiedMerchant: "Onye na-ere ahịa a kwadoro",
    noFabricsFor: (query: string) => `Ọ dịghị akwa dabara na “${query}”`,
    noFabricsYet: "Edepụtabeghị akwa ọ bụla",
    noFabricsYetBody:
      "Ndị na-ere ahịa a kwadoro na-agbakwunye akwa ọhụrụ mgbe niile.",
    openFabricExplorer: "Mepee ebe nyocha akwa",

    promptKicker: "ECHICHE GỊ ỌZỌ NA-AMALITE EBE A",
    promptTitleLead: "Gịnị ka ị ga-",
    promptTitleEmphasis: "emepụta?",
    promptBodyAi:
      "Kọwaa uwe ị na-eche n'uche. Ụlọ Ọrụ AI ga-eme ya ka ọ bụrụ ihe ngosi ụdị ị nwere ike ibuga ọka nka ka o mee ya.",
    promptBody:
      "Kọwaa uwe ị na-eche n'uche ma tinye foto ụdị ị hụrụ n'anya. Ọka nka a kwadoro ga-enye gị ọnụahịa iji mee ya.",
    promptLabel: "Kọwaa echiche ụdị gị",
    promptPlaceholder: "Kaftan na-acha anụnụ ọchịchịrị nwere ọlaedo e jiri kwaa ya…",
    designInAiStudio: "Mee ụdị echiche a n'Ụlọ Ọrụ AI",
    commissionThisIdea: "Nye ọka nka echiche a",
    tryIdea: "Nwaa otu echiche:",
    ideas: ["Agbada nke oge a", "Uwe ọbịa agbamakwụkwọ", "Ankara kwa ụbọchị"],

    trustReviewed: "A na-enyocha ndị ọka nka tupu ha apụta",
    trustPrices: "A na-egosi ọnụahịa mmalite n'ihu",
    trustMeasurements: "A na-echekwa nha gị otu ugboro na profaịlụ nha gị",
  },
};
