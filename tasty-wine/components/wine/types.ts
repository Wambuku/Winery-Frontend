"use client";

export interface WineSummary {
  id: string;
  name: string;
  category: string;
  type: string;
  region: string;
  country?: string;
  vintage?: number;
  price: number;
  rating?: number;
  imageUrl?: string;
  shortDescription?: string;
  badges?: string[];
  inStock?: boolean;
}

export interface WineDetailData extends WineSummary {
  longDescription?: string;
  tastingNotes?: string[];
  pairingSuggestions?: string[];
  ingredients?: string[];
  history?: string;
  availableSizes?: Array<{ label: string; price: number }>;
  purchaseLink?: string;
}
