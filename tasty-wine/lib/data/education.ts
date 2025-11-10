import type {
  KnowledgeArticle,
  KnowledgeCategory,
  TastingReview,
  WineHistoryEntry,
  WinePairingSuggestion,
  WineRegionGuide,
  WineTypeProfile,
} from "../types/education";

export const wineHistoryTimeline: WineHistoryEntry[] = [
  {
    id: "origin-georgia",
    title: "Neolithic Origins in Georgia",
    region: "Kakheti, Georgia",
    period: "6000 – 4000 BCE",
    summary:
      "Archaeologists discovered the earliest traces of winemaking in Georgian clay qvevri, showcasing the roots of modern vinification.",
    highlights: [
      "Qvevri vessels lined with beeswax",
      "Wild grape domestication begins",
      "Community celebrations around harvest",
    ],
    notableFigures: ["Ancient Georgian vintners"],
    relatedArticles: ["georgian-qvevri-tradition"],
  },
  {
    id: "roman-expansion",
    title: "Roman Expansion of the Vine",
    region: "Roman Empire",
    period: "200 BCE – 400 CE",
    summary:
      "Roman legions spread viticulture across Europe, codifying growing practices and creating the first appellation-style protections.",
    highlights: [
      "Introduction of pruning systems",
      "Viticulture reaches Gaul, Hispania, and Britannia",
      "Development of amphora transport logistics",
    ],
    notableFigures: ["Pliny the Elder", "Columella"],
    relatedArticles: ["roman-viticulture-codes"],
  },
  {
    id: "monastic-revival",
    title: "Monastic Revival of the Middle Ages",
    region: "Burgundy & Champagne, France",
    period: "900 – 1400 CE",
    summary:
      "Monastic orders documented terroir-driven practices, laying foundations for Burgundy crus and the méthode champenoise.",
    highlights: [
      "Cistercian vineyard mapping",
      "Early sparkling wine experiments",
      "Creation of cellar aging protocols",
    ],
    notableFigures: ["Dom Pérignon", "Cistercian monks"],
    relatedArticles: ["cistercian-terroir-mapping"],
  },
];

export const wineRegionGuides: WineRegionGuide[] = [
  {
    id: "napa-valley",
    name: "Napa Valley",
    country: "United States",
    climate: "Mediterranean",
    description:
      "Napa Valley's sun-soaked hillsides produce bold Cabernet Sauvignon and elegant Chardonnay backed by complex microclimates.",
    signatureGrapes: ["Cabernet Sauvignon", "Chardonnay", "Merlot"],
    keyAppellations: ["Rutherford", "Stags Leap District", "Oakville"],
    travelTips: [
      "Reserve tastings at boutique estates ahead of harvest season.",
      "Explore biodynamic vineyards in Carneros during sunrise.",
    ],
    heroImage: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "rioja",
    name: "Rioja",
    country: "Spain",
    climate: "Continental with Atlantic influence",
    description:
      "Rioja's tiered classification system rewards patience, crafting Tempranillo wines ranging from juicy joven to contemplative gran reserva.",
    signatureGrapes: ["Tempranillo", "Garnacha", "Graciano"],
    keyAppellations: ["Rioja Alta", "Rioja Alavesa", "Rioja Oriental"],
    travelTips: [
      "Tour century-old cellars carved beneath Haro's railway district.",
      "Pair mature reservas with slow-roasted lamb in Logroño.",
    ],
    heroImage: "https://images.unsplash.com/photo-1509057199576-632a47484ece?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "marlborough",
    name: "Marlborough",
    country: "New Zealand",
    climate: "Cool maritime",
    description:
      "Crisp breezes and long sunshine hours forge Sauvignon Blancs bursting with citrus, passionfruit, and vibrant acidity.",
    signatureGrapes: ["Sauvignon Blanc", "Pinot Noir"],
    keyAppellations: ["Wairau Valley", "Awatere Valley", "Southern Valleys"],
    travelTips: [
      "Cycle between cellar doors via the Marlborough Wine Trail.",
      "Sample freshly shucked Cloudy Bay clams alongside local vintages.",
    ],
    heroImage: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1600&q=80",
  },
];

export const wineTypeProfiles: WineTypeProfile[] = [
  {
    id: "pinot-noir",
    name: "Pinot Noir",
    body: "light",
    acidity: "high",
    tannins: "low",
    sweetness: "dry",
    servingTemp: "14 – 16°C (57 – 61°F)",
    description:
      "A delicate red celebrated for translucent ruby hues, red berry aromatics, and silky structure that mirrors terroir nuances.",
    aromaNotes: ["Wild strawberry", "Cherry blossom", "Forest floor"],
    palateNotes: ["Cranberry", "Raspberry leaf", "Earthy spice"],
    finishNotes: ["Silky tannins", "Bright acidity"],
    recommendedRegions: ["Burgundy", "Central Otago", "Sonoma Coast"],
  },
  {
    id: "riesling",
    name: "Riesling",
    body: "light",
    acidity: "high",
    tannins: "none",
    sweetness: "off-dry",
    servingTemp: "6 – 8°C (43 – 46°F)",
    description:
      "Highly aromatic with electric acidity, Riesling delivers styles from bone-dry to lusciously sweet while reflecting vineyard elevation.",
    aromaNotes: ["White peach", "Jasmine", "Slate"],
    palateNotes: ["Green apple", "Lime zest", "Honeycomb"],
    finishNotes: ["Mineral snap", "Lingering citrus"],
    recommendedRegions: ["Mosel", "Clare Valley", "Finger Lakes"],
  },
  {
    id: "nebbiolo",
    name: "Nebbiolo",
    body: "full",
    acidity: "high",
    tannins: "high",
    sweetness: "dry",
    servingTemp: "18 – 20°C (64 – 68°F)",
    description:
      "Iconic Piedmontese grape famed for roses-and-tar aromatics, firm tannins, and remarkable aging potential stretching decades.",
    aromaNotes: ["Dried rose", "Tar", "Anise"],
    palateNotes: ["Sour cherry", "Truffle", "Leather"],
    finishNotes: ["Pronounced tannins", "Savory spice"],
    recommendedRegions: ["Barolo", "Barbaresco", "Valtellina"],
  },
];

export const pairingSuggestions: WinePairingSuggestion[] = [
  {
    id: "pinot-mushroom",
    title: "Forest-inspired Pinot Pairing",
    wineTypes: ["pinot-noir"],
    foods: ["Wild mushroom risotto", "Herb-roasted quail", "Gruyère tart"],
    occasion: "Autumn dinner party",
    chefTips: [
      "Finish risotto with truffle oil to echo Pinot's earthy notes.",
      "Lightly chill the Pinot Noir for 15 minutes to sharpen acidity.",
    ],
  },
  {
    id: "riesling-spice",
    title: "Riesling Meets Spice",
    wineTypes: ["riesling"],
    foods: ["Thai green curry", "Vietnamese summer rolls", "Spicy glazed prawns"],
    occasion: "Weeknight takeout upgrade",
    chefTips: [
      "Balance heat with coconut milk richness.",
      "Serve Riesling in tall Riesling stems to accentuate aromatics.",
    ],
  },
  {
    id: "nebbiolo-feast",
    title: "Nebbiolo Feast",
    wineTypes: ["nebbiolo"],
    foods: ["Braised short ribs", "Porcini polenta", "Aged Parmigiano-Reggiano"],
    occasion: "Winter celebration dinner",
    chefTips: [
      "Decant Nebbiolo for two hours to soften tannins.",
      "Garnish with fresh rosemary to uplift savory aromas.",
    ],
  },
];

export const tastingReviews: TastingReview[] = [
  {
    id: "review-luminous-pinot-2019",
    wineId: "luminous-pinot-2019",
    wineName: "Luminous Ridge Pinot Noir",
    vintage: 2019,
    reviewer: "Amina Kariuki",
    role: "sommelier",
    rating: 4.7,
    nose: ["Red currant", "Rose hip tea", "Wet sandstone"],
    palate: ["Pomegranate", "Cranberry", "Sandalwood"],
    finish: "Silky with persistent minerality and verdant herbs.",
    comments:
      "An expressive coastal Pinot Noir that balances airy fruit with savory forest nuance—decant briefly for maximum aromatic lift.",
    tastingDate: "2024-03-12T00:00:00.000Z",
    recommendedPairings: ["Seared duck breast", "Charred beet salad"],
  },
  {
    id: "review-riesling-2022",
    wineId: "suntrail-riesling-2022",
    wineName: "Suntrail Vineyard Riesling",
    vintage: 2022,
    reviewer: "Diego Chen",
    role: "critic",
    rating: 4.5,
    nose: ["Lime leaf", "Orange blossom", "Slate"],
    palate: ["Key lime pie", "White nectarine", "Crushed stones"],
    finish: "Laser-focused acidity with a whisper of sweetness.",
    comments:
      "A vibrant Riesling that sings with Thai flavors—the restrained sweetness keeps spice in harmony without overwhelming texture.",
    tastingDate: "2024-04-03T00:00:00.000Z",
    recommendedPairings: ["Thai lemongrass chicken", "Vietnamese prawn rolls"],
  },
  {
    id: "review-barolo-2017",
    wineId: "alba-nebbiolo-2017",
    wineName: "Alba Ridge Barolo",
    vintage: 2017,
    reviewer: "Lucia Bianchi",
    role: "customer",
    rating: 4.2,
    nose: ["Dried cherries", "Tar", "Violet"],
    palate: ["Sour cherry", "Dark cocoa", "Anise"],
    finish: "Assertive tannins with a lingering savory edge.",
    comments:
      "Opened alongside braised short ribs—firm tannins still present but softened beautifully with hearty fare.",
    tastingDate: "2024-02-18T00:00:00.000Z",
  },
];

export const knowledgeCategories: KnowledgeCategory[] = [
  {
    id: "history",
    name: "Wine History",
    description: "Explore the moments that shaped global wine culture and craftsmanship.",
    icon: "📜",
  },
  {
    id: "regions",
    name: "Regions & Terroir",
    description: "Travel through iconic regions, microclimates, and appellations.",
    icon: "🗺️",
  },
  {
    id: "types",
    name: "Wine Styles",
    description: "Understand varietals, structure, and what makes each style distinct.",
    icon: "🍇",
  },
  {
    id: "pairings",
    name: "Pairings",
    description: "Match wines to cuisine, experiences, and celebrations.",
    icon: "🥂",
  },
  {
    id: "education",
    name: "Cellar Academy",
    description: "Deepen wine knowledge with guides, glossaries, and tasting frameworks.",
    icon: "🎓",
  },
];

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: "georgian-qvevri-tradition",
    title: "Inside Georgia's Qvevri Tradition",
    category: "history",
    excerpt:
      "Clay qvevri vessels have hosted fermentation for millennia. Discover how this UNESCO-listed tradition influences texture and flavor.",
    content:
      "Georgian winemaking relies on qvevri—large earthenware amphorae buried underground. The unique vessel stabilizes temperature and allows extended skin contact, producing amber-toned wines with tea-like tannins. Modern artisans continue crafting qvevri by hand, maintaining techniques passed through generations...",
    readingTimeMinutes: 6,
    tags: ["qvevri", "amber wine", "UNESCO"],
    updatedAt: "2024-02-10T00:00:00.000Z",
    author: "Nino Beridze",
  },
  {
    id: "roman-viticulture-codes",
    title: "Roman Viticulture Codes Still Used Today",
    category: "history",
    excerpt:
      "From pruning to appellations, Roman agronomists set rules still echoed in today's vineyards across Europe.",
    content:
      "Agrarian writer Columella documented vineyard management: winter pruning to control yields, training vines along trellises, and staggering harvests by microclimate. These codified practices ensured consistent supply for the empire and inspire modern growers from Champagne to Tuscany...",
    readingTimeMinutes: 5,
    tags: ["history", "viticulture", "Romans"],
    updatedAt: "2024-01-22T00:00:00.000Z",
    author: "Marcus Vitus",
  },
  {
    id: "cistercian-terroir-mapping",
    title: "How Cistercian Monks Mapped Terroir",
    category: "regions",
    excerpt:
      "Centuries before satellites, monks ranked Burgundy parcels through patient observation—meet the original terroir cartographers.",
    content:
      "Through meticulous record keeping, Cistercian monks in Burgundy correlated soil types, drainage, and microclimates with wine quality. Their ledgers formed the bedrock for today's cru classifications, proving that terroir-driven viticulture predates modern technology...",
    readingTimeMinutes: 7,
    tags: ["terroir", "Burgundy", "history"],
    updatedAt: "2024-03-02T00:00:00.000Z",
    author: "Elise Martin",
  },
  {
    id: "pinot-service-guide",
    title: "Serving Pinot Noir with Confidence",
    category: "types",
    excerpt:
      "Dial in glassware, temperature, and decanting moves that elevate Pinot Noir's subtle aromatics.",
    content:
      "Pinot Noir thrives in Burgundy stems with a tapered lip to concentrate aromatics. Serve slightly chilled, between 14 and 16°C, and consider a brief decant to unlock forest floor notes. Avoid heavy sauces when pairing—think herb-roasted poultry and earthy vegetables...",
    readingTimeMinutes: 4,
    tags: ["service", "pinot noir", "tips"],
    updatedAt: "2024-03-18T00:00:00.000Z",
    author: "Amina Kariuki",
  },
  {
    id: "food-pairing-framework",
    title: "Designing Food Pairings Like a Sommelier",
    category: "pairings",
    excerpt:
      "Structure your pairing choices using acidity, texture, and flavor bridges so every course sings.",
    content:
      "Start by matching intensity—delicate wines with subtle dishes, bold wines with robust flavors. Use acidity to cut fat, sweetness to balance spice, and tannins to complement protein structure. Layer mirrored flavors like citrus zest or herbal notes to tie everything together...",
    readingTimeMinutes: 8,
    tags: ["pairing", "framework", "sommelier"],
    updatedAt: "2024-03-28T00:00:00.000Z",
    author: "Diego Chen",
  },
  {
    id: "cellar-academy-tasting-grid",
    title: "The Cellar Academy Tasting Grid",
    category: "education",
    excerpt:
      "Adopt our structured tasting grid to sharpen sensory recall and build confident wine vocabulary.",
    content:
      "Assess appearance, aroma, palate, and structure systematically. Note clarity, viscosity, and color; categorize aromatics into fruit, floral, herbal, and earth; evaluate sweetness, acidity, tannin, alcohol, and body; finish with conclusions on quality and readiness for drinking...",
    readingTimeMinutes: 9,
    tags: ["tasting", "education", "training"],
    updatedAt: "2024-02-25T00:00:00.000Z",
    author: "Lucia Bianchi",
  },
];
