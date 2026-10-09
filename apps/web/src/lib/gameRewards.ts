export type MasteryStage = 0 | 1 | 2 | 3 | 4 | 5;

export type Tier = {
  stage: MasteryStage;
  name: string;
  medallion: string | null;
  tileClass: string;
};

export const TIERS: readonly Tier[] = [
  {
    stage: 0,
    name: "Seen",
    medallion: null,
    tileClass: "border-slate-200 bg-white/70 text-slate-500",
  },
  {
    stage: 1,
    name: "Bronze",
    medallion: "/game/medallion-bronze.png",
    tileClass: "border-[#c98a5a]/40 bg-[#fbeee3] text-[#7a4a2a]",
  },
  {
    stage: 2,
    name: "Silver",
    medallion: "/game/medallion-silver.png",
    tileClass: "border-slate-300 bg-[#f1f3f6] text-slate-700",
  },
  {
    stage: 3,
    name: "Gold",
    medallion: "/game/medallion-gold.png",
    tileClass: "border-[#d9a92e]/50 bg-[#fdf3d4] text-[#7a5a0e]",
  },
  {
    stage: 4,
    name: "Jade",
    medallion: "/game/medallion-jade.png",
    tileClass: "border-[#3f9b7a]/45 bg-[#e3f4ec] text-[#1f5e47]",
  },
  {
    stage: 5,
    name: "Mastered",
    medallion: "/game/medallion-mastered.png",
    tileClass: "border-[#d4688c]/50 bg-[linear-gradient(135deg,#fde7ef,#fff6e5)] text-[#7f2f4f]",
  },
];

export type Rank = {
  minLevel: number;
  title: string;
  romaji: string;
  english: string;
  crest: string;
};

export const RANKS: readonly Rank[] = [
  { minLevel: 1, title: "見習い", romaji: "Minarai", english: "Apprentice", crest: "/game/crest-minarai.png" },
  { minLevel: 4, title: "学生", romaji: "Gakusei", english: "Student", crest: "/game/crest-gakusei.png" },
  { minLevel: 8, title: "職人", romaji: "Shokunin", english: "Artisan", crest: "/game/crest-shokunin.png" },
  { minLevel: 12, title: "侍", romaji: "Samurai", english: "Samurai", crest: "/game/crest-samurai.png" },
  { minLevel: 17, title: "達人", romaji: "Tatsujin", english: "Master", crest: "/game/crest-tatsujin.png" },
  { minLevel: 23, title: "先生", romaji: "Sensei", english: "Sensei", crest: "/game/crest-sensei.png" },
];

export type CardThemeId = "sakura" | "momiji" | "lantern" | "fuji" | "snow";

export type CardTheme = {
  id: CardThemeId;
  name: string;
  description: string;
  minLevel: number;
  art: string;
  artClass: string;
  faceClass: string;
  glowClass: string;
  textClass: string;
  mutedClass: string;
  chipClass: string;
};

export const CARD_THEMES: readonly CardTheme[] = [
  {
    id: "sakura",
    name: "Sakura",
    description: "Spring blossoms on washi paper",
    minLevel: 1,
    art: "/flashcards/sakura-branch-transparent.png",
    artClass: "bottom-0 left-0 w-[24rem] -translate-x-8 translate-y-6 opacity-80",
    faceClass: "bg-washi",
    glowClass: "bg-sakura/45",
    textClass: "text-ink",
    mutedClass: "text-slate-500",
    chipClass: "bg-white/80 text-matcha",
  },
  {
    id: "momiji",
    name: "Autumn momiji",
    description: "Red maple leaves on warm cream",
    minLevel: 3,
    art: "/flashcards/themes/momiji.png",
    artClass: "bottom-0 left-0 w-[16rem] -translate-x-4 translate-y-4 opacity-90 sm:w-[22rem] sm:-translate-x-6 sm:translate-y-6",
    faceClass: "bg-[linear-gradient(160deg,#fff8ec,#fcebd6_60%,#f6d9bd)]",
    glowClass: "bg-[#e0663a]/25",
    textClass: "text-[#3b2216]",
    mutedClass: "text-[#8a5a3c]",
    chipClass: "bg-white/80 text-[#b5462a]",
  },
  {
    id: "lantern",
    name: "Night lantern",
    description: "Paper lantern under a crescent moon",
    minLevel: 6,
    art: "/flashcards/themes/lantern.png",
    artClass: "bottom-0 left-0 w-[13rem] -translate-x-3 translate-y-3 opacity-95 sm:w-[20rem] sm:-translate-x-4 sm:translate-y-4",
    faceClass: "bg-[linear-gradient(165deg,#232a4f,#1a1f3d_55%,#2b2350)]",
    glowClass: "bg-[#f5b25a]/30",
    textClass: "text-[#fdf3dc]",
    mutedClass: "text-[#c9c2e0]",
    chipClass: "bg-white/15 text-[#f7cf8a]",
  },
  {
    id: "fuji",
    name: "Fuji wave",
    description: "A great wave beneath Mt. Fuji",
    minLevel: 10,
    art: "/flashcards/themes/fuji.png",
    artClass: "bottom-0 left-0 w-[17rem] -translate-x-4 translate-y-3 opacity-90 sm:w-[24rem] sm:-translate-x-6 sm:translate-y-4",
    faceClass: "bg-[linear-gradient(170deg,#f4f8fb,#e2edf5_60%,#d3e3ef)]",
    glowClass: "bg-[#2f6d9e]/20",
    textClass: "text-[#15324d]",
    mutedClass: "text-[#4b6a85]",
    chipClass: "bg-white/80 text-[#2f6d9e]",
  },
  {
    id: "snow",
    name: "Snow shrine",
    description: "A quiet torii in fresh snow",
    minLevel: 15,
    art: "/flashcards/themes/snow.png",
    artClass: "bottom-0 left-0 w-[15rem] -translate-x-3 translate-y-3 opacity-90 sm:w-[22rem] sm:-translate-x-4 sm:translate-y-4",
    faceClass: "bg-[linear-gradient(170deg,#fbfcfd,#eef1f4_60%,#e3e8ee)]",
    glowClass: "bg-[#c8303a]/15",
    textClass: "text-[#1f2933]",
    mutedClass: "text-slate-500",
    chipClass: "bg-white/85 text-[#b0313a]",
  },
];

export type GardenStage = {
  stage: number;
  name: string;
  description: string;
  minGold: number;
  minLevel: number;
  minMastered: number;
  image: string;
};

export const GARDEN_STAGES: readonly GardenStage[] = [
  { stage: 0, name: "Empty courtyard", description: "Raked gravel and a young sapling", minGold: 0, minLevel: 1, minMastered: 0, image: "/garden/stage-0.jpg" },
  { stage: 1, name: "Moss and stepping stones", description: "A path appears through the gravel", minGold: 0, minLevel: 2, minMastered: 0, image: "/garden/stage-1.jpg" },
  { stage: 2, name: "Stone lantern", description: "A tōrō lights the garden", minGold: 3, minLevel: 3, minMastered: 0, image: "/garden/stage-2.jpg" },
  { stage: 3, name: "Koi pond", description: "Koi arrive in a new pond", minGold: 10, minLevel: 5, minMastered: 0, image: "/garden/stage-3.jpg" },
  { stage: 4, name: "Bonsai and bamboo fence", description: "A pine bonsai and a woven fence", minGold: 25, minLevel: 7, minMastered: 0, image: "/garden/stage-4.jpg" },
  { stage: 5, name: "Red bridge", description: "An arched bridge crosses the pond", minGold: 45, minLevel: 9, minMastered: 0, image: "/garden/stage-5.jpg" },
  { stage: 6, name: "Torii gate", description: "A vermilion gate marks the path", minGold: 70, minLevel: 12, minMastered: 0, image: "/garden/stage-6.jpg" },
  { stage: 7, name: "Cherry tree", description: "The sapling becomes a cherry tree", minGold: 100, minLevel: 15, minMastered: 10, image: "/garden/stage-7.jpg" },
  { stage: 8, name: "Full bloom", description: "Full bloom and a distant pagoda", minGold: 150, minLevel: 18, minMastered: 30, image: "/garden/stage-8.jpg" },
];
