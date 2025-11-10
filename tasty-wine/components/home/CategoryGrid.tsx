'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  name: string;
  type: string;
  description: string;
  icon: string;
  color: string;
}

const categories: Category[] = [
  {
    name: 'Red Wines',
    type: 'Red',
    description: 'Bold and full-bodied selections',
    icon: '🍷',
    color: 'from-red-900/50 to-red-700/50',
  },
  {
    name: 'White Wines',
    type: 'White',
    description: 'Crisp and refreshing varieties',
    icon: '🥂',
    color: 'from-yellow-900/50 to-yellow-700/50',
  },
  {
    name: 'Rosé Wines',
    type: 'Rosé',
    description: 'Light and elegant choices',
    icon: '🌸',
    color: 'from-pink-900/50 to-pink-700/50',
  },
  {
    name: 'Sparkling',
    type: 'Sparkling',
    description: 'Celebrate with bubbles',
    icon: '✨',
    color: 'from-purple-900/50 to-purple-700/50',
  },
];

export default function CategoryGrid() {
  const router = useRouter();

  const handleCategoryClick = (type: string) => {
    router.push(`/wines?type=${encodeURIComponent(type)}`);
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <button
          key={category.type}
          onClick={() => handleCategoryClick(category.type)}
          className="group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-left transition-all hover:border-red-500 hover:shadow-xl hover:shadow-red-500/20"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 transition-opacity group-hover:opacity-100`} />
          
          <div className="relative">
            <div className="mb-4 text-4xl">{category.icon}</div>
            <h3 className="text-xl font-bold text-white">{category.name}</h3>
            <p className="mt-2 text-sm text-slate-400">{category.description}</p>
            <div className="mt-4 flex items-center text-sm font-semibold text-red-400">
              Explore
              <svg
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
