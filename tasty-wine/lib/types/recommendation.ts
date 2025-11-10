export interface UserBehavior {
  userId: string;
  viewedWines: string[];
  purchasedWines: string[];
  searchQueries: string[];
  preferredTypes: string[];
  preferredRegions: string[];
  priceRange: {
    min: number;
    max: number;
  };
  lastActivity: string;
}

export interface WineRecommendation {
  wineId: string;
  wineName: string;
  score: number;
  reason: 'similar_type' | 'same_region' | 'price_range' | 'popular' | 'trending' | 'new_arrival';
  imageUrl?: string;
  price: number;
  type: string;
  region: string;
}

export interface RecommendationParams {
  userId?: string;
  wineId?: string;
  limit?: number;
  types?: string[];
  maxPrice?: number;
  excludeIds?: string[];
}
