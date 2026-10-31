/**
 * Yoruba copy.
 *
 * Typed against the English dictionary, so a missing or renamed key fails the
 * type check. Yoruba is written in standard orthography with underdots
 * (ẹ, ọ, ṣ) and tone marks. The brand addresses people with the respectful
 * plural "ẹ" / "yín".
 *
 * Draft translation: have a native Yoruba speaker review product and legal copy
 * before launch.
 */
import type { Dictionary } from "./en";

const role = (who: "artisan" | "merchant") =>
  who === "artisan" ? "oníṣẹ́-ọnà" : "oníṣòwò";

export const yo: Dictionary = {
  language: {
    label: "Èdè",
    choose: "Yan èdè",
  },

  nav: {
    home: "IPILE — ojú-ìwé àkọ́kọ́",
    mainNavigation: "Ìtọ́sọ́nà pàtàkì",
    discover: "Ṣàwárí",
    fabrics: "Aṣọ",
    artisans: "Àwọn oníṣẹ́-ọnà",
    aiStudio: "Sítúdíò AI",
    soon: "Láìpẹ́",
    searchLabel: "Wá àwọn àṣà, aṣọ, tàbí oníṣẹ́-ọnà",
    searchPlaceholder: "Wá nínú ilé-iṣẹ́ ọnà",
    submitSearch: "Fi ìwádìí ránṣẹ́",
    accountMenu: "Àtòjọ àkáǹtì",
    yourAccount: "Àkáǹtì yín",
    notifications: "Ìfitónilétí",
    unread: (count: number) => `${count} tí a kò tíì kà`,
    orders: "Àwọn àṣẹ",
    toDo: (count: number) => `${count} láti ṣe`,
    ordersAttention: (count: number) =>
      `Àwọn àṣẹ, ${count} nílò àkíyèsí yín`,
    selection: "Àṣàyàn yín",
    selectionLabel: (count: number) =>
      `Àṣàyàn yín, ohun ${count} tí a fi pamọ́`,
    myFabrics: "Àwọn aṣọ mi",
    adminDashboard: "Pátákó alábòójútó",
    signOut: "Jáde",
    survey: "Ìwádìí èsì",
    signIn: "Wọlé",
    joinAtelier: "Darapọ̀ mọ́ ilé-iṣẹ́ ọnà",
    openMenu: "Ṣí àtòjọ",
    closeMenu: "Pa àtòjọ dé",
    profile: {
      customer: "Àlàyé ìwọ̀n ara mi",
      tailor: "Àlàyé oníṣẹ́-ọnà mi",
      merchant: "Àlàyé oníṣòwò mi",
    },
    roles: {
      customer: "Oníbàárà",
      tailor: "Oníṣẹ́-ọnà",
      merchant: "Oníṣòwò",
      admin: "Alábòójútó",
    },
  },

  notifications: {
    label: (unread: number) =>
      `Ìfitónilétí${unread ? `, ${unread} tí a kò tíì kà` : ""}`,
    title: "Ìfitónilétí",
    markAllRead: "Sàmì sí gbogbo rẹ̀ pé a ti kà á",
    error: "A kò lè gbé ìfitónilétí wá. Ẹ gbìyànjú lẹ́ẹ̀kan sí i láìpẹ́.",
    loading: "Ó ń gbé e wá…",
    empty:
      "Kò sí ohun tuntun. Ìròyìn nípa àṣẹ àti àwọn ìfiránṣẹ́ yóò hàn níbí.",
    seeAll: "Wo gbogbo ìfitónilétí",
    justNow: "Ní báyìí",
    minutesAgo: (value: number) => `Ìṣẹ́jú ${value} sẹ́yìn`,
    hoursAgo: (value: number) => `Wákàtí ${value} sẹ́yìn`,
    daysAgo: (value: number) => `Ọjọ́ ${value} sẹ́yìn`,
    unreadLabel: "A kò tíì kà á",
  },

  footer: {
    home: "IPILE — ojú-ìwé àkọ́kọ́",
    kicker: "A ṢE É FÚN YÍN",
    titleLead: "A ṣe é fún bí",
    titleEmphasis: "ẹ ṣe ń rìn.",
    startDesign: "Bẹ̀rẹ̀ àwòrán yín",
    tagline: "Ẹwà Áfíríkà òde-òní, tí a fi ìrònú ṣe.",
    fabrics: "Aṣọ",
    artisans: "Àwọn oníṣẹ́-ọnà",
    support: "Ìrànlọ́wọ́",
    terms: "Àwọn òfin",
    privacy: "Àṣírí",
  },

  setup: {
    choose:
      "Parí ìṣètò: sọ fún wa bóyá ẹ wá láti rajà, láti ránṣọ, tàbí láti ta aṣọ.",
    chooseCta: "Yan ọ̀nà yín",
    start: (who: "artisan" | "merchant") =>
      `Parí àlàyé ${role(who)} yín. Àwọn oníbàárà yóò rí yín ní kété tí ẹgbẹ́ wa bá ti fìdí rẹ̀ múlẹ̀.`,
    startCta: "Tẹ̀síwájú pẹ̀lú ìṣètò",
    pending: (who: "artisan" | "merchant") =>
      `Ẹgbẹ́ wa ń ṣàyẹ̀wò àlàyé ${role(who)} yín. A ó fi ímeèlì ránṣẹ́ sí yín ní kété tí ẹ bá ti jáde.`,
    pendingCta: "Wo àlàyé",
    changes: (who: "artisan" | "merchant", note: string | null) =>
      `Àlàyé ${role(who)} yín nílò àwọn àtúnṣe díẹ̀ kí ó tó lè jáde${
        note ? `: “${note}”` : "."
      }`,
    changesCta: "Ṣe àtúnṣe",
  },

  survey: {
    kicker: "ÈSÌ YÍN",
    loading: "Ó ń gbé ìwádìí yín wá…",
    progress: (current: number, total: number) => `Ìbéèrè ${current} nínú ${total}`,
    optional: "Kò pọn dandan",
    otherLabel: "Ẹ jọ̀wọ́ ẹ ṣàlàyé",
    itemLabel: (n: number) => `Ohun ${n}`,
    charactersLeft: (n: number) => `Lẹ́tà ${n} ló kù`,
    back: "Padà",
    next: "Tẹ̀síwájú",
    skip: "Fò ó",
    saving: "Ó ń fi pamọ́…",
    saveError: "A kò lè fi ìdáhùn yẹn pamọ́. Ẹ ṣàyẹ̀wò ìsopọ̀ yín kí ẹ sì gbìyànjú lẹ́ẹ̀kan sí i.",
    required: "Ẹ jọ̀wọ́ ẹ dáhùn ìbéèrè yìí kí ẹ tó tẹ̀síwájú.",
    otherRequired: "Ẹ jọ̀wọ́ ẹ sọ ohun tí “Òmíràn” túmọ̀ sí.",
    reviewTitle: "Ẹ ṣàyẹ̀wò ìdáhùn yín",
    reviewBody: "Ẹ ṣàyẹ̀wò ìdáhùn yín, lẹ́yìn náà ẹ fi ránṣẹ́. Ẹ ṣì lè yí wọn padà lẹ́yìn náà.",
    notAnswered: "A kò dáhùn",
    edit: "Ṣàtúnṣe",
    submit: "Fi ìdáhùn ránṣẹ́",
    submitting: "Ó ń fi ránṣẹ́…",
    doneTitle: "Ẹ ṣé o!",
    doneBody:
      "Ìdáhùn yín ń ràn wá lọ́wọ́ láti ṣe IPILE dáadáa kí ó tó ṣí sílẹ̀. Ẹ lè padà wá ṣàtúnṣe wọn nígbàkúgbà.",
    editAnswers: "Ṣàtúnṣe ìdáhùn",
    backToDiscover: "Padà sí ṣíṣàwárí",
    promptText: "Ẹ ràn wá lọ́wọ́ láti ṣe IPILE: ẹ sọ fún wa bí ìdánwò ṣe lọ. Yóò gba nǹkan bí ìṣẹ́jú 5.",
    promptStart: "Ṣe ìwádìí náà",
    promptContinue: (answered: number, total: number) => `Tẹ̀síwájú (${answered}/${total})`,
    dismiss: "Pa á tì",
  },

  marketplace: {
    heroEyebrow: "ẸWÀ ÁFÍRÍKÀ ÒDE-ÒNÍ",
    heroTitleLead: "Ìran yín,",
    heroTitleEmphasis: "tí a fi ìrònú ṣe.",
    heroBody:
      "Ṣàwárí àwọn oníṣẹ́-ọnà tó mọṣẹ́, ṣàyẹ̀wò àwọn aṣọ, kí ẹ sì mú aṣọ yín tó kàn wá sí ìyè.",
    startDesign: "Bẹ̀rẹ̀ àwòrán yín",
    exploreAtelier: "Ṣàwárí ilé-iṣẹ́ ọnà",
    heroTrust:
      "A ń ṣàyẹ̀wò gbogbo oníṣẹ́-ọnà àti oníṣòwò kí wọ́n tó jáde.",
    heroLabelKicker: "01 / ILÉ-IṢẸ́ ỌNÀ TUNTUN",
    heroLabelTitle: "Iṣẹ́-ọnà pàdé ìrònú.",
    heroVertical: "IPILE · A ṢE É FÚN YÍN",
    scrollToExplore: "Yí lọ sísàlẹ̀ láti ṣàwárí",

    valueStripLabel: "Bí IPILE ṣe ń ṣiṣẹ́",
    valueArtisans: "Àwọn oníṣẹ́-ọnà tó mọṣẹ́",
    valueStyle: "Àṣà tí ó jẹ́ tiyín",
    valueMadeAroundYou: "A ṣe é fún yín",

    resultsKicker: "ÌWÁDÌÍ",
    resultsFor: "Àbájáde fún",
    resultsSummary: (artisans: number, fabrics: number, styles: number) =>
      `Oníṣẹ́-ọnà ${artisans} · aṣọ ${fabrics} · àṣà ${styles}`,
    clearSearch: "Pa ìwádìí rẹ́",

    possibilitiesKicker: "01 / ÀWỌN ÀǸFÀÀNÍ",
    possibilitiesTitleLead: "Bẹ̀rẹ̀ pẹ̀lú ohun tí",
    possibilitiesTitleEmphasis: "ó ń fún yín ní ìmísí.",
    possibilitiesBody:
      "Gbogbo iṣẹ́ ńlá ló ní ibi tí ó ti bẹ̀rẹ̀. Ẹ rí tiyín tó kàn níbí.",
    findArtisan: "Wá oníṣẹ́-ọnà",
    findArtisanBody:
      "Ẹ bá oníṣẹ́-ọnà tí ó lóye ìran yín ṣiṣẹ́ ní ojúkojú.",
    exploreArtisans: "Ṣàwárí àwọn oníṣẹ́-ọnà",
    discoverFabric: "Ṣàwárí aṣọ",
    discoverFabricBody:
      "Ẹ rí ìrísí, àwọ̀, àti àṣà ìbílẹ̀ nínú gbogbo aṣọ híhun dídára.",
    exploreFabrics: "Ṣàwárí àwọn aṣọ",
    createOwn: "Ṣẹ̀dá tiyín",
    createOwnBody:
      "Ẹ bẹ̀rẹ̀ ìrìn-àjò aṣọ àdáni yín pẹ̀lú èrò kan, lẹ́yìn náà ẹ sọ ọ́ di òótọ́.",
    getStarted: "Bẹ̀rẹ̀",

    stylesKicker: "02 / ÀKỌSÍLẸ̀ ÀṢÀ",
    stylesTitleLead: "Ẹ wọ aṣọ fún",
    stylesTitleEmphasis: "ayẹyẹ náà.",
    stylesBody: "Àwọn ìrísí aṣọ tí a ronú lé fún gbogbo ìpín ayé yín.",
    previousStyles: "Àwọn àṣà tó ṣáájú",
    nextStyles: "Àwọn àṣà tó kàn",
    startPiece: (name: string) => `Bẹ̀rẹ̀ aṣọ ${name}`,
    fromPrice: (price: string) => `Láti ${price}`,
    noStylesFor: (query: string) => `Kò sí àṣà tó bá “${query}” mu`,
    noStylesYet: "Kò sí àṣà kankan síbẹ̀",
    noStylesForBody:
      "Ẹ gbìyànjú ọ̀rọ̀ tó gbòòrò bíi “kaftan” tàbí “ìgbéyàwó”.",
    noStylesYetBody:
      "Àwọn ìrísí tuntun ń bọ̀. Ní báyìí ná, ẹ ṣàwárí àwọn aṣọ.",

    makingKicker: "ỌNÀ ÌṢẸ̀DÁ",
    makingTitleLead: "Ọwọ́ ló ṣe é.",
    makingTitleEmphasis: "A ṣe é fún yín.",
    makingBody:
      "Lẹ́yìn gbogbo ìránṣọ ni ènìyàn kan, ibì kan, àti ìtàn kan wà. Ẹ ṣàwárí àwọn oníṣẹ́-ọnà tí ń sọ èrò yín di aṣọ tí ẹ ó máa tọ́jú.",
    meetMakers: "Ẹ pàdé àwọn oníṣẹ́-ọnà",

    artisansKicker: "03 / ÀWỌN ÈNÌYÀN TÓ WÀ LẸ́YÌN IṢẸ́ NÁÀ",
    artisansTitleLead: "Ẹ pàdé",
    artisansTitleEmphasis: "oníṣẹ́-ọnà yín.",
    artisansBody:
      "Àwọn oníṣẹ́-ọnà olómìnira tí wọ́n ní ojú ìwòye tiwọn àti ìfẹ́ sí iṣẹ́ wọn.",
    viewAllArtisans: "Wo gbogbo àwọn oníṣẹ́-ọnà",
    artisansPreviewNote:
      "Àpẹẹrẹ àlàyé oníṣẹ́-ọnà àti iye owó fún àfihàn yìí.",
    filterArtisans: "Ṣàyàn àwọn oníṣẹ́-ọnà gẹ́gẹ́ bí ìlú",
    allCities: "Gbogbo ìlú",
    artisanFallback: "Oníṣẹ́-ọnà",
    viewProfile: (name: string) => `Wo àlàyé ${name}`,
    verifiedArtisan: "Oníṣẹ́-ọnà tí a ti fìdí rẹ̀ múlẹ̀",
    saveProfile: (name: string) => `Fi ${name} pamọ́`,
    removeProfile: (name: string) => `Yọ ${name} kúrò`,
    sampleProfile: "Àpẹẹrẹ àlàyé — kò gba iṣẹ́ lọ́wọ́lọ́wọ́",
    requestCommission: "Béèrè fún iṣẹ́",
    noArtisansFor: (query: string) =>
      `Kò sí oníṣẹ́-ọnà tó bá “${query}” mu`,
    noArtisansYet: "Kò sí oníṣẹ́-ọnà níbí síbẹ̀",
    noArtisansInCity: (city: string) =>
      `Kò sí oníṣẹ́-ọnà ní ${city} tó bá a mu. Ẹ gbìyànjú ìlú mìíràn.`,
    noArtisansYetBody:
      "Àwọn oníṣẹ́-ọnà tí a ti fìdí wọn múlẹ̀ yóò hàn níbí ní kété tí a bá fọwọ́ sí wọn.",
    browseAllArtisans: "Wo gbogbo àwọn oníṣẹ́-ọnà",

    fabricsKicker: "04 / ÀṢÀYÀN AṢỌ",
    fabricsTitleLead: "Ẹ bẹ̀rẹ̀ pẹ̀lú",
    fabricsTitleEmphasis: "aṣọ náà.",
    fabricsBody:
      "Àwọn aṣọ ẹlẹ́wà tí a yàn nítorí ìtàn tí wọ́n ń ràn wá lọ́wọ́ láti sọ.",
    exploreAllFabrics: "Ṣàwárí gbogbo aṣọ",
    fabricsPreviewNote:
      "Àpẹẹrẹ àtòjọ àti iye owó. Oníṣòwò kọ̀ọ̀kan ló ń fìdí wíwà rẹ̀ múlẹ̀.",
    filterFabrics: "Ṣàyàn àwọn aṣọ gẹ́gẹ́ bí irú",
    allFabrics: "Gbogbo rẹ̀",
    textileAlt: (name: string) => `Aṣọ ${name}`,
    verifiedMerchant: "Oníṣòwò tí a ti fìdí rẹ̀ múlẹ̀",
    noFabricsFor: (query: string) => `Kò sí aṣọ tó bá “${query}” mu`,
    noFabricsYet: "Kò sí aṣọ kankan lórí àtòjọ síbẹ̀",
    noFabricsYetBody:
      "Àwọn oníṣòwò tí a ti fìdí wọn múlẹ̀ ń fi aṣọ tuntun kún un déédéé.",
    openFabricExplorer: "Ṣí olùṣàwárí aṣọ",

    promptKicker: "ÈRÒ YÍN TÓ KÀN BẸ̀RẸ̀ NÍBÍ",
    promptTitleLead: "Kí ni ẹ máa",
    promptTitleEmphasis: "ṣẹ̀dá?",
    promptBodyAi:
      "Ẹ ṣàpèjúwe aṣọ tí ẹ ní lọ́kàn. Sítúdíò AI yóò sọ ọ́ di àwòrán àpẹẹrẹ tí ẹ lè gbé lọ fún oníṣẹ́-ọnà kan láti ṣe.",
    promptBody:
      "Ẹ ṣàpèjúwe aṣọ tí ẹ ní lọ́kàn, kí ẹ sì fi àwòrán àṣà tí ẹ fẹ́ràn kún un. Oníṣẹ́-ọnà tí a ti fìdí rẹ̀ múlẹ̀ yóò fún yín ní iye owó láti ṣe é.",
    promptLabel: "Ṣàpèjúwe èrò àṣà yín",
    promptPlaceholder: "Kaftan aláwọ̀ búlúù ọ̀gànjọ́ pẹ̀lú iṣẹ́-ọnà wúrà…",
    designInAiStudio: "Ya àwòrán èrò yìí ní Sítúdíò AI",
    commissionThisIdea: "Gbé èrò yìí fún oníṣẹ́-ọnà",
    tryIdea: "Ẹ gbìyànjú èrò kan:",
    ideas: ["Agbádá òde-òní", "Aṣọ àlejò ìgbéyàwó", "Ankara ojoojúmọ́"],

    trustReviewed: "A ń ṣàyẹ̀wò àwọn oníṣẹ́-ọnà kí wọ́n tó jáde",
    trustPrices: "A ń fi iye owó ìbẹ̀rẹ̀ hàn ní gbangba",
    trustMeasurements:
      "Ẹ ó fi ìwọ̀n ara yín pamọ́ lẹ́ẹ̀kan nínú àlàyé ìwọ̀n yín",
  },
};
