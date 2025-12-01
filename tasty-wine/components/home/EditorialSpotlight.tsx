import Link from 'next/link';
import React from 'react';

const stories = [
  {
    category: 'Pairing Lab',
    title: 'Build the perfect tapas flight for warm evenings',
    description:
      'Sommelier-approved pours with salty bites, ripe stone fruit, and charcoal-grilled mains.',
    readingTime: '5 min read',
    href: '/orders',
    accent: 'from-red-600/30 via-red-400/10 to-transparent',
  },
  {
    category: 'Cellar Notes',
    title: 'How we source volcanic-soil reds from Sicily and Santorini',
    description:
      'Travel diary from our buying trip across the Mediterranean with tasting notes you can shop.',
    readingTime: '7 min read',
    href: '/inventory',
    accent: 'from-purple-600/30 via-purple-400/10 to-transparent',
  },
  {
    category: 'Service Rituals',
    title: 'Design a by-the-glass program that feels bespoke every week',
    description:
      'Playbooks for wine bars and boutique hotels looking to refresh their board in 48 hours.',
    readingTime: '4 min read',
    href: '/pos',
    accent: 'from-amber-500/30 via-amber-300/10 to-transparent',
  },
];

export default function EditorialSpotlight() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-300">
            Cellar journal
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Field notes & service playbooks
          </h2>
        </div>
        <Link
          href="/wines"
          className="text-sm font-semibold text-red-300 transition hover:text-red-200"
        >
          Browse all stories →
        </Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {stories.map((story) => (
          <article
            key={story.title}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60 p-6 text-white transition hover:border-red-400/50 hover:shadow-2xl hover:shadow-red-500/10 sm:p-8"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${story.accent} opacity-0 transition-opacity group-hover:opacity-100`}
            />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                {story.category}
              </p>
              <h3 className="mt-4 text-2xl font-semibold leading-tight">{story.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{story.description}</p>
            </div>
            <div className="relative mt-8 flex items-center justify-between text-sm text-slate-400">
              <span>{story.readingTime}</span>
              <Link
                href={story.href}
                className="inline-flex items-center gap-2 font-semibold text-red-300 transition group-hover:translate-x-1 group-hover:text-red-200"
              >
                Read guide
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
