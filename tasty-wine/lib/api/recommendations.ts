import { apiRequest } from './client';
import type { WineRecommendation, RecommendationParams, UserBehavior } from '../types/recommendation';

export async function getRecommendations(
  params: RecommendationParams = {},
  options: { token?: string; signal?: AbortSignal } = {}
): Promise<WineRecommendation[]> {
  const query: Record<string, string | number | undefined> = {
    user_id: params.userId,
    wine_id: params.wineId,
    limit: params.limit || 10,
    types: params.types?.join(','),
    max_price: params.maxPrice,
    exclude_ids: params.excludeIds?.join(','),
  };

  return apiRequest<WineRecommendation[]>('/api/recommendations/', {
    method: 'GET',
    token: options.token,
    signal: options.signal,
    query,
  });
}

export async function trackWineView(
  wineId: string,
  options: { token?: string; signal?: AbortSignal } = {}
): Promise<void> {
  await apiRequest<void>('/api/recommendations/track/view/', {
    method: 'POST',
    token: options.token,
    signal: options.signal,
    body: { wine_id: wineId },
  });
}

export async function trackSearch(
  query: string,
  options: { token?: string; signal?: AbortSignal } = {}
): Promise<void> {
  await apiRequest<void>('/api/recommendations/track/search/', {
    method: 'POST',
    token: options.token,
    signal: options.signal,
    body: { query },
  });
}

export async function getUserBehavior(
  userId: string,
  options: { token?: string; signal?: AbortSignal } = {}
): Promise<UserBehavior> {
  return apiRequest<UserBehavior>(`/api/recommendations/behavior/${userId}/`, {
    method: 'GET',
    token: options.token,
    signal: options.signal,
  });
}

export async function getTrendingWines(
  limit: number = 10,
  options: { token?: string; signal?: AbortSignal } = {}
): Promise<WineRecommendation[]> {
  return apiRequest<WineRecommendation[]>('/api/recommendations/trending/', {
    method: 'GET',
    token: options.token,
    signal: options.signal,
    query: { limit },
  });
}

export async function getNewArrivals(
  limit: number = 10,
  options: { token?: string; signal?: AbortSignal } = {}
): Promise<WineRecommendation[]> {
  return apiRequest<WineRecommendation[]>('/api/recommendations/new-arrivals/', {
    method: 'GET',
    token: options.token,
    signal: options.signal,
    query: { limit },
  });
}
