'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Category {
  name: string;
  type: string;
  description: string;
  icon: string;
  color: string;
  image: string;
}

const categories: Category[] = [
  {
    name: 'Red Wines',
    type: 'Red',
    description: 'Bold and full-bodied selections',
    icon: '🍷',
    color: 'from-red-900/50 to-red-700/50',
    image: '/assets/wine-1.jpg',
  },
  {
    name: 'White Wines',
    type: 'White',
    description: 'Crisp and refreshing varieties',
    icon: '🥂',
    color: 'from-yellow-900/50 to-yellow-700/50',
    image: '/assets/glass-pour.jpg',
  },
  {
    name: 'Rosé Wines',
    type: 'Rosé',
    description: 'Light and elegant choices',
    icon: '🌸',
    color: 'from-pink-900/50 to-pink-700/50',
    image: '/assets/wine-3.jpg',
  },
  {
    name: 'Sparkling',
    type: 'Sparkling',
    description: 'Celebrate with bubbles',
    icon: '✨',
    color: 'from-purple-900/50 to-purple-700/50',
    image: '/assets/sparkling-wine.jpg',
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
          className="group relative h-[240px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/60 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-red-400/70 hover:shadow-2xl hover:shadow-red-500/20"
        >
          <div className="absolute inset-0">
            <Image
              src={category.image}
              alt={`${category.name} background`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/30" />
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60 mix-blend-screen transition-opacity group-hover:opacity-80`} />
          </div>

          <div className="relative flex h-full flex-col justify-between p-6">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white shadow-lg shadow-black/30 backdrop-blur">
                {category.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{category.name}</h3>
              <p className="mt-2 text-sm text-slate-200/80">{category.description}</p>
            </div>
            <div className="mt-4 flex items-center text-sm font-semibold text-red-200 transition-colors group-hover:text-red-100">
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
