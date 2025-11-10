'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { getKnowledgeArticles, getKnowledgeCategories, searchKnowledgeBase } from '../../lib/education';
import type { KnowledgeArticle, KnowledgeCategory } from '../../lib/types/education';

interface KnowledgeBaseSearchProps {
  categories?: KnowledgeCategory[];
  articles?: KnowledgeArticle[];
}

export default function KnowledgeBaseSearch({ categories, articles }: KnowledgeBaseSearchProps) {
  const categoryList = categories ?? getKnowledgeCategories();
  const articleList = articles ?? getKnowledgeArticles();

  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  const results = useMemo(() => {
    if (!query.trim() && (categoryId === 'all')) {
      return articleList.slice(0, 6).map((article) => ({ article, score: 0, matchedFields: [] as string[] }));
    }
    return searchKnowledgeBase({
      query,
      categoryId: categoryId === 'all' ? undefined : categoryId,
      limit: 8,
    });
  }, [query, categoryId, articleList]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    startTransition(() => setQuery(value));
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    startTransition(() => setCategoryId(value));
  };

  return (
    <section
      aria-labelledby="knowledge-base-heading"
      className="space-y-6 rounded-3xl border border-white/10 bg-black/70 p-6"
    >
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Cellar Academy</p>
        <h2 id="knowledge-base-heading" className="text-2xl font-semibold text-white sm:text-3xl">
          Search the wine knowledge base
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-white/70 sm:text-base">
          Browse guides covering history, regions, styles, and service rituals. Filter by topic or search by keyword.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="knowledge-query">
          Search knowledge base
        </label>
        <div className="relative flex-1">
          <input
            id="knowledge-query"
            type="search"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search articles, e.g. sparkling service or terroir"
            className="w-full rounded-full border border-white/10 bg-black/60 px-12 py-3 text-sm text-white placeholder:text-white/40 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
            aria-describedby="search-status"
          />
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" aria-hidden>
            🔍
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="knowledge-category">
            Filter by category
          </label>
          <select
            id="knowledge-category"
            value={categoryId}
            onChange={handleCategoryChange}
            className="min-w-[10rem] rounded-full border border-white/10 bg-black/60 px-4 py-3 text-sm text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
          >
            <option value="all">All topics</option>
            {categoryList.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon ?? ''} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div id="search-status" role="status" className="text-xs uppercase tracking-wide text-white/50">
        {isPending ? 'Searching…' : `${results.length} ${results.length === 1 ? 'article' : 'articles'} found`}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {results.map(({ article, matchedFields }) => (
          <article
            key={article.id}
            className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow shadow-black/30 transition hover:border-yellow-300/60"
            tabIndex={0}
            aria-labelledby={`article-${article.id}`}
          >
            <header className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-white/60">
                {article.category} · {article.readingTimeMinutes} min read
              </p>
              <h3 id={`article-${article.id}`} className="text-lg font-semibold text-white">
                {article.title}
              </h3>
            </header>
            <p className="text-sm leading-relaxed text-white/75">{article.excerpt}</p>
            <footer className="mt-auto space-y-2">
              <div className="flex flex-wrap gap-2 text-xs">
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-white/60">
                    #{tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-white/50">
                Updated {new Date(article.updatedAt).toLocaleDateString()} · {article.author}
              </p>
              {matchedFields.length > 0 && (
                <p className="text-xs text-yellow-200">
                  Matches in: {matchedFields.join(', ')}
                </p>
              )}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
