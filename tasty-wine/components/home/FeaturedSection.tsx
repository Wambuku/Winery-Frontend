import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';

const palette = {
  gold: '#d8a424',
  text: '#f6f2e7',
  muted: '#c9c3b7',
  dark: '#060506',
  panel: '#0d0c0f',
};

// Static showcase data to avoid API usage for now.
const featuredProducts = [
  {
    id: 'reserve-150',
    name: 'Pope Valley Winery',
    price: 150,
    imageUrl: '/assets/wine-5.jpg',
  },
  {
    id: 'reserve-140',
    name: 'Pope Valley Winery',
    price: 140,
    imageUrl: '/assets/wine-6.jpg',
  },
  {
    id: 'reserve-158',
    name: 'Pope Valley Winery',
    price: 158,
    imageUrl: '/assets/wine-7.jpg',
  },
];

const featuredEvent = {
  title: '10th Annual Barrel Tasting',
  date: '15 Sept',
  copy:
    'Join us for a decadent evening of reserve pours, barrel samplings, and chef-paired small bites from the valley.',
  imageUrl: '/assets/glass-pour.jpg',
};

interface FeaturedSectionProps {
  title: string;
  wines: unknown[];
}

export default function FeaturedSection({ title: _title, wines: _wines }: FeaturedSectionProps) {
  const router = useRouter();
  const cards = featuredProducts;

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-yellow-900/30 bg-[color:var(--featured-bg)] px-4 py-12 shadow-2xl shadow-black/60 sm:px-10">
      <style jsx>{`
        :global(:root) {
          --featured-bg: ${palette.dark};
          --featured-panel: ${palette.panel};
          --featured-gold: ${palette.gold};
          --featured-text: ${palette.text};
          --featured-muted: ${palette.muted};
        }
      `}</style>

      <div className="text-center text-[color:var(--featured-text)]">
        <p className="text-sm uppercase tracking-[0.4em] text-[color:var(--featured-muted)]">Amazing</p>
        <h2 className="mt-2 text-3xl font-serif font-semibold uppercase tracking-[0.1em] text-[color:var(--featured-gold)] sm:text-4xl">
          Offer
        </h2>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((wine, idx) => (
          <button
            type="button"
            key={wine.id}
            onClick={() => router.push(`/wines/${wine.id}`)}
            className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border px-4 pb-5 pt-4 text-left shadow-[0_18px_38px_rgba(0,0,0,0.35)] transition-all ${
              idx === 1
                ? 'border-[color:var(--featured-gold)] bg-[color:var(--featured-panel)]'
                : 'border-white/10 bg-[color:var(--featured-panel)] hover:border-[color:var(--featured-gold)]'
            }`}
          >
            <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg">
              <Image
                src={wine.imageUrl}
                alt={wine.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              />
            </div>

            <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--featured-muted)]">
              Pope Valley Winery
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[color:var(--featured-text)] sm:text-xl">
              {wine.name}
            </h3>
            <p className="mt-2 text-sm font-black text-[color:var(--featured-gold)]">
              ${wine.price.toFixed(2)}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className={`h-2.5 w-2.5 rounded-full ${
              dot === 1 ? 'bg-[color:var(--featured-gold)]' : 'bg-white/25'
            }`}
          />
        ))}
      </div>

      <div className="mt-12 text-center text-[color:var(--featured-text)]">
        <p className="text-sm uppercase tracking-[0.4em] text-[color:var(--featured-muted)]">Featured</p>
        <h3 className="mt-2 text-2xl font-serif font-semibold uppercase tracking-[0.12em] text-[color:var(--featured-gold)] sm:text-3xl">
          Events
        </h3>
      </div>

      <div className="relative mt-8 grid gap-6 rounded-2xl border border-white/10 bg-[color:var(--featured-panel)] p-6 shadow-[0_18px_38px_rgba(0,0,0,0.35)] lg:grid-cols-[1.15fr,1fr]">
        <div className="absolute left-4 top-1/2 hidden -translate-y-1/2 md:block">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--featured-gold)] text-[color:var(--featured-gold)]">
            ‹
          </div>
        </div>
        <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 md:block">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--featured-gold)] text-[color:var(--featured-gold)]">
            ›
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl">
          <Image
            src={featuredEvent.imageUrl}
            alt={featuredEvent.title}
            width={720}
            height={480}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center gap-3 text-[color:var(--featured-text)]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--featured-muted)]">
              {featuredEvent.date}
            </p>
            <h4 className="mt-2 text-xl font-semibold sm:text-2xl">{featuredEvent.title}</h4>
          </div>
          <p className="text-sm leading-relaxed text-[color:var(--featured-muted)]">{featuredEvent.copy}</p>
          <button
            type="button"
            className="mt-2 w-fit rounded-full border border-[color:var(--featured-gold)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--featured-gold)] transition hover:-translate-y-0.5 hover:bg-[color:var(--featured-gold)] hover:text-black"
          >
            Read More
          </button>
        </div>
      </div>
    </div>
  );
}
