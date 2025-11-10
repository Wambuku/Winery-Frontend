export interface WineHistoryEntry {
  id: string;
  title: string;
  region: string;
  period: string;
  summary: string;
  highlights: string[];
  notableFigures: string[];
  imageUrl?: string;
  relatedArticles?: string[];
}

export interface WineRegionGuide {
  id: string;
  name: string;
  country: string;
  climate: string;
  description: string;
  signatureGrapes: string[];
  keyAppellations: string[];
  travelTips?: string[];
  heroImage?: string;
}

export interface WineTypeProfile {
  id: string;
  name: string;
  body: "light" | "medium" | "full";
  acidity: "low" | "medium" | "high";
  tannins: "low" | "medium" | "high" | "none";
  sweetness: "dry" | "off-dry" | "sweet";
  servingTemp: string;
  description: string;
  aromaNotes: string[];
  palateNotes: string[];
  finishNotes?: string[];
  recommendedRegions: string[];
}

export interface WinePairingSuggestion {
  id: string;
  title: string;
  wineTypes: string[];
  foods: string[];
  occasion?: string;
  chefTips?: string[];
}

export interface TastingReview {
  id: string;
  wineId: string;
  wineName: string;
  vintage?: number;
  reviewer: string;
  role: "sommelier" | "critic" | "customer";
  rating: number;
  nose: string[];
  palate: string[];
  finish: string;
  comments: string;
  tastingDate: string;
  recommendedPairings?: string[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: "history" | "regions" | "types" | "pairings" | "education";
  excerpt: string;
  content: string;
  readingTimeMinutes: number;
  tags: string[];
  updatedAt: string;
  author: string;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}
