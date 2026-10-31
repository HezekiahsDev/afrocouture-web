/**
 * Hausa copy.
 *
 * Typed against the English dictionary, so a missing or renamed key fails the
 * type check. Hausa is written here in Boko with the standard hooked letters
 * (ɓ, ɗ, ƙ). The brand addresses people with the respectful plural "ku".
 *
 * Draft translation: have a native Hausa speaker review product and legal copy
 * before launch.
 */
import type { Dictionary } from "./en";

export const ha: Dictionary = {
  language: {
    label: "Harshe",
    choose: "Zaɓi harshe",
  },

  nav: {
    home: "IPILE — gida",
    mainNavigation: "Babban menu",
    discover: "Gano",
    fabrics: "Yadudduka",
    artisans: "Masu sana'a",
    aiStudio: "Situdiyo na AI",
    soon: "Ba da jimawa ba",
    searchLabel: "Nemo salo, yadudduka, ko masu sana'a",
    searchPlaceholder: "Bincika gidan sana'a",
    submitSearch: "Aika bincike",
    accountMenu: "Menu na asusu",
    yourAccount: "Asusunku",
    notifications: "Sanarwa",
    unread: (count: number) => `${count} ba a karanta ba`,
    orders: "Oda",
    toDo: (count: number) => `${count} a yi`,
    ordersAttention: (count: number) =>
      `Oda, ${count} na buƙatar kulawar ku`,
    selection: "Zaɓinku",
    selectionLabel: (count: number) => `Zaɓinku, an ajiye abu ${count}`,
    myFabrics: "Yaduddukana",
    adminDashboard: "Dashboard ɗin gudanarwa",
    signOut: "Fita",
    signIn: "Shiga",
    joinAtelier: "Shiga gidan sana'a",
    openMenu: "Buɗe menu",
    closeMenu: "Rufe menu",
    profile: {
      customer: "Bayanan ma'aunana",
      tailor: "Bayanan sana'ata",
      merchant: "Bayanan kasuwancina",
    },
    roles: {
      customer: "Abokin ciniki",
      tailor: "Mai sana'a",
      merchant: "Ɗan kasuwa",
      admin: "Mai gudanarwa",
    },
  },

  notifications: {
    label: (unread: number) =>
      `Sanarwa${unread ? `, ${unread} ba a karanta ba` : ""}`,
    title: "Sanarwa",
    markAllRead: "Yi duk a karanta",
    error: "Ba a iya loda sanarwa ba. Sake gwadawa nan gaba kaɗan.",
    loading: "Ana lodawa…",
    empty:
      "Kuna kan gaba. Sabbin oda da saƙonni za su bayyana a nan.",
    seeAll: "Duba dukkan sanarwa",
    justNow: "Yanzu",
    minutesAgo: (value: number) => `Minti ${value} da suka wuce`,
    hoursAgo: (value: number) => `Awa ${value} da suka wuce`,
    daysAgo: (value: number) => `Kwana ${value} da suka wuce`,
    unreadLabel: "Ba a karanta ba",
  },

  footer: {
    home: "IPILE — gida",
    kicker: "AN ƘIRƘIRA DOMINKU",
    titleLead: "An yi don yadda",
    titleEmphasis: "kuke motsi.",
    startDesign: "Fara zanenku",
    tagline: "Alatu na Afirka ta zamani, an yi shi da tunani.",
    fabrics: "Yadudduka",
    artisans: "Masu sana'a",
    support: "Taimako",
    terms: "Sharuddan",
    privacy: "Sirri",
  },

  setup: {
    choose:
      "Kammala saitin: gaya mana ko kuna nan don siyayya, yin kaya, ko sayar da yadi.",
    chooseCta: "Zaɓi hanyarku",
    start: (who: "artisan" | "merchant") =>
      who === "artisan"
        ? "Kammala bayanan sana'arka. Abokan ciniki za su iya ganinka da zarar ƙungiyarmu ta tabbatar."
        : "Kammala bayanan kasuwancinka. Abokan ciniki za su iya ganinka da zarar ƙungiyarmu ta tabbatar.",
    startCta: "Ci gaba da saitin",
    pending: (who: "artisan" | "merchant") =>
      who === "artisan"
        ? "Bayanan sana'arka na hannun ƙungiyarmu don dubawa. Za mu yi maka imel da zarar an buɗe ka."
        : "Bayanan kasuwancinka na hannun ƙungiyarmu don dubawa. Za mu yi maka imel da zarar an buɗe ka.",
    pendingCta: "Duba bayanan",
    changes: (who: "artisan" | "merchant", note: string | null) =>
      `Bayanan ${
        who === "artisan" ? "sana'arka" : "kasuwancinka"
      } na buƙatar wasu canje-canje kafin a buɗe shi${
        note ? `: “${note}”` : "."
      }`,
    changesCta: "Yi canje-canje",
  },

  marketplace: {
    heroEyebrow: "ALATU NA AFIRKA TA ZAMANI",
    heroTitleLead: "Hangen nesanku,",
    heroTitleEmphasis: "an yi shi da tunani.",
    heroBody:
      "Gano ƙwararrun masu ƙira, bincika yadudduka, kuma ku ba da rai ga sabon kayan da za ku saka.",
    startDesign: "Fara zanenku",
    exploreAtelier: "Bincika gidan sana'a",
    heroTrust: "Ana duba kowane mai sana'a da ɗan kasuwa kafin a buɗe su.",
    heroLabelKicker: "01 / SABON GIDAN SANA'A",
    heroLabelTitle: "Sana'a ta haɗu da hasashe.",
    heroVertical: "IPILE · AN ƘIRƘIRA DOMINKU",
    scrollToExplore: "Gungura don bincike",

    valueStripLabel: "Yadda IPILE ke aiki",
    valueArtisans: "Ƙwararrun masu sana'a",
    valueStyle: "Salon da ya ke naku",
    valueMadeAroundYou: "An yi shi domin ku",

    resultsKicker: "BINCIKE",
    resultsFor: "Sakamakon",
    resultsSummary: (artisans: number, fabrics: number, styles: number) =>
      `${artisans} masu sana'a · ${fabrics} yadudduka · ${styles} salo`,
    clearSearch: "Share bincike",

    possibilitiesKicker: "01 / DAMARMA",
    possibilitiesTitleLead: "Fara da abin da",
    possibilitiesTitleEmphasis: "ya motsa ku.",
    possibilitiesBody:
      "Kowane babban aiki yana farawa daga wani wuri. Nemo naku na gaba a nan.",
    findArtisan: "Nemo mai sana'a",
    findArtisanBody:
      "Yi aiki kai tsaye da mai ƙira wanda ya fahimci hangen nesan ku.",
    exploreArtisans: "Bincika masu sana'a",
    discoverFabric: "Gano yadudduka",
    discoverFabricBody:
      "Nemo laushi, launi, da gadon kakanni a kowane kyakkyawan saƙa.",
    exploreFabrics: "Bincika yadudduka",
    createOwn: "Ƙirƙiri naku",
    createOwnBody:
      "Fara tafiyar ƙirarku da wata tunani, sannan ku mai da ita gaske.",
    getStarted: "Fara",

    stylesKicker: "02 / BAYANIN SALO",
    stylesTitleLead: "Sa don",
    stylesTitleEmphasis: "bikin.",
    stylesBody: "Sifofi da aka yi tunani don kowane babi na rayuwarku.",
    previousStyles: "Salon da suka gabata",
    nextStyles: "Salo na gaba",
    startPiece: (name: string) => `Fara aikin ${name}`,
    fromPrice: (price: string) => `Daga ${price}`,
    noStylesFor: (query: string) => `Babu salo da ya dace da “${query}”`,
    noStylesYet: "Babu salo tukuna",
    noStylesForBody: "Gwada wata kalma mai faɗi kamar “kaftan” ko “biki”.",
    noStylesYetBody:
      "Sabbin sifofi suna zuwa. A halin yanzu, bincika yadudduka.",

    makingKicker: "FASANAR ƘIRƘIRA",
    makingTitleLead: "An yi da hannu.",
    makingTitleEmphasis: "An yi domin ku.",
    makingBody:
      "Bayan kowane ɗinki akwai mutum, wuri, da labari. Gano masu sana'ar da ke mai da tunaninku kayan da za ku adana.",
    meetMakers: "Haɗu da masu ƙira",

    artisansKicker: "03 / MUTANEN DA KE BAYAN KAYAN",
    artisansTitleLead: "Haɗu da",
    artisansTitleEmphasis: "mai ƙirarku.",
    artisansBody:
      "Masu sana'a masu zaman kansu waɗanda ke da ra'ayi da ƙaunar sana'arsu.",
    viewAllArtisans: "Duba dukkan masu sana'a",
    artisansPreviewNote:
      "Bayanan masu sana'a na misali da farashin samfur don wannan hasashe.",
    filterArtisans: "Tace masu sana'a bisa birni",
    allCities: "Duk garuruwa",
    artisanFallback: "Mai sana'a",
    viewProfile: (name: string) => `Duba bayanan ${name}`,
    verifiedArtisan: "Mai sana'ar da aka tabbatar",
    saveProfile: (name: string) => `Ajiye ${name}`,
    removeProfile: (name: string) => `Cire ${name}`,
    sampleProfile: "Bayanan misali — ba ya karɓar ayyuka",
    requestCommission: "Nemi aiki",
    noArtisansFor: (query: string) =>
      `Babu mai sana'a da ya dace da “${query}”`,
    noArtisansYet: "Babu masu sana'a a nan tukuna",
    noArtisansInCity: (city: string) =>
      `Babu masu sana'a a ${city} da suka dace. Gwada wani birni.`,
    noArtisansYetBody:
      "Masu sana'ar da aka tabbatar suna bayyana a nan da zarar an amince da su.",
    browseAllArtisans: "Duba dukkan masu sana'a",

    fabricsKicker: "04 / ZAƁIN YADUDDUKA",
    fabricsTitleLead: "Fara da",
    fabricsTitleEmphasis: "kayan.",
    fabricsBody:
      "Kyawawan yadudduka da aka zaɓa saboda labarun da suke taimakawa bayarwa.",
    exploreAllFabrics: "Bincika dukkan yadudduka",
    fabricsPreviewNote:
      "Jerin misali da farashi. Kowane ɗan kasuwa ne ke tabbatar da samuwa.",
    filterFabrics: "Tace yadudduka bisa nau'i",
    allFabrics: "Duka",
    textileAlt: (name: string) => `${name} yadi`,
    verifiedMerchant: "Ɗan kasuwar da aka tabbatar",
    noFabricsFor: (query: string) => `Babu yadi da ya dace da “${query}”`,
    noFabricsYet: "Babu yadudduka da aka jera tukuna",
    noFabricsYetBody:
      "Ɗan kasuwar da aka tabbatar suna ƙara sabbin yadudduka akai-akai.",
    openFabricExplorer: "Buɗe binciken yadudduka",

    promptKicker: "TUNANINKU NA GABA YA FARA A NAN",
    promptTitleLead: "Me za ku",
    promptTitleEmphasis: "ƙirƙira?",
    promptBodyAi:
      "Bayyana kayan da kuke tunani. Situdiyo na AI zai mai da shi hasashen zane da za ku kai wa mai sana'a a matsayin aiki.",
    promptBody:
      "Bayyana kayan da kuke tunani sannan ku ƙara hotunan salon da kuke so. Mai sana'ar da aka tabbatar zai ba da farashi don yin shi.",
    promptLabel: "Bayyana tunanin salanku",
    promptPlaceholder: "Kaftan shuɗin tsakar dare da zaren zinariya…",
    designInAiStudio: "Ƙirƙira wannan tunani a Situdiyo na AI",
    commissionThisIdea: "Ba da wannan tunani ga mai sana'a",
    tryIdea: "Gwada wani tunani:",
    ideas: ["Agbada na zamani", "Kayan baƙon biki", "Ankara ta yau da kullum"],

    trustReviewed: "Ana duba masu sana'a kafin a buɗe su",
    trustPrices: "Ana nuna farashin farawa a fili",
    trustMeasurements: "Ana ajiye ma'aunai sau ɗaya a bayanan kamanku",
  },
};
