import {
  knowledgeArticles,
  knowledgeCategories,
  pairingSuggestions,
  tastingReviews,
  wineHistoryTimeline,
  wineRegionGuides,
  wineTypeProfiles,
} from "../data/education";
import type {
  KnowledgeArticle,
  KnowledgeCategory,
  TastingReview,
  WineHistoryEntry,
  WinePairingSuggestion,
  WineRegionGuide,
  WineTypeProfile,
} from "../types/education";

export function getWineHistory(): WineHistoryEntry[] {
  return wineHistoryTimeline;
}

export function getWineRegions(): WineRegionGuide[] {
  return wineRegionGuides;
}

export function getWineTypes(): WineTypeProfile[] {
  return wineTypeProfiles;
}

export function getPairingSuggestions(): WinePairingSuggestion[] {
  return pairingSuggestions;
}

export function getTastingReviews(): TastingReview[] {
  return tastingReviews;
}

export function getKnowledgeCategories(): KnowledgeCategory[] {
  return knowledgeCategories;
}

export function getKnowledgeArticles(): KnowledgeArticle[] {
  return knowledgeArticles;
}

export interface KnowledgeSearchOptions {
  query: string;
  categoryId?: string;
  limit?: number;
}

export interface KnowledgeSearchResult {
  article: KnowledgeArticle;
  score: number;
  matchedFields: Array<"title" | "excerpt" | "content" | "tags">;
}

export function searchKnowledgeBase({
  query,
  categoryId,
  limit = 10,
}: KnowledgeSearchOptions): KnowledgeSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return knowledgeArticles
      .filter((article) => (categoryId ? article.category === categoryId : true))
      .slice(0, limit)
      .map((article) => ({
        article,
        score: 0,
        matchedFields: [],
      }));
  }

  const keywords = normalizedQuery.split(/\s+/).filter(Boolean);

  const scored = knowledgeArticles
    .filter((article) => (categoryId ? article.category === categoryId : true))
    .map((article) => {
      let score = 0;
      const matchedFields = new Set<KnowledgeSearchResult["matchedFields"][number]>();

      const haystacks: Array<[KnowledgeSearchResult["matchedFields"][number], string]> = [
        ["title", article.title],
        ["excerpt", article.excerpt],
        ["content", article.content],
      ];

      haystacks.forEach(([field, value]) => {
        const normalizedValue = value.toLowerCase();
        keywords.forEach((keyword) => {
          if (normalizedValue.includes(keyword)) {
            score += field === "title" ? 3 : field === "excerpt" ? 2 : 1;
            matchedFields.add(field);
          }
        });
      });

      article.tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase();
        keywords.forEach((keyword) => {
          if (normalizedTag.includes(keyword)) {
            score += 2;
            matchedFields.add("tags");
          }
        });
      });

      return {
        article,
        score,
        matchedFields: Array.from(matchedFields),
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
