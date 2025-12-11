import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Image from "next/image";

const WineTypeExplorer = dynamic(() => import("../../components/education/WineTypeExplorer"));
const PairingShowcase = dynamic(() => import("../../components/education/PairingShowcase"));
const TastingReviews = dynamic(() => import("../../components/education/TastingReviews"));
const KnowledgeBaseSearch = dynamic(() => import("../../components/education/KnowledgeBaseSearch"));

export const metadata: Metadata = {
  title: "Cellar Academy",
  description:
    "Explore wine history, terroir, tasting frameworks, and pairing inspiration through the Tasty Wine knowledge base.",
};

export default function KnowledgePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0c080f] to-red-950 text-white">
      <section className="relative overflow-hidden px-4 pb-12 pt-16 sm:px-8">
        <div className="absolute inset-0">
          <Image
            src="/assets/wine-5.jpg"
            alt="Wine cellar shelves"
            fill
            priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-red-900/60" />
          <div className="absolute -left-10 top-8 h-48 w-48 rounded-full bg-red-500/20 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
          <header className="space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-200 backdrop-blur">
              Cellar academy
              <span className="rounded-full bg-yellow-400/20 px-2 py-1 text-[10px] text-yellow-100">Guides</span>
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              Elevate your wine intelligence
            </h1>
            <p className="max-w-3xl text-sm text-white/75 sm:text-base">
              Bite-sized playbooks on tasting, terroir, and pairing. Learn quickly, save favorites, and share tips with your guests or friends.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Learning paths", value: "6 tracks" },
                { label: "Reading time", value: "5–10 min" },
                { label: "Pairing cheatsheets", value: "Instant" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-wide text-white/50">{item.label}</p>
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </header>

          <nav className="flex flex-wrap gap-3">
            {[
              { href: "#search", label: "Search library" },
              { href: "#types", label: "Styles & grapes" },
              { href: "#pairing", label: "Pairing lab" },
              { href: "#reviews", label: "Tasting room" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-yellow-300/60 hover:text-yellow-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 sm:px-8">
        <section
          id="search"
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/3 to-black/40 p-4 shadow-xl shadow-black/30 sm:p-6"
        >
          <KnowledgeBaseSearch />
        </section>

        <section className="grid gap-4 rounded-3xl border border-white/10 bg-black/60 p-6 shadow-xl shadow-black/30 sm:grid-cols-3 sm:p-8">
          {[
            {
              title: "Learn fast",
              body: "Micro-lessons with key takeaways and tasting vocabulary you can use tableside.",
              icon: "⚡",
            },
            {
              title: "Serve with confidence",
              body: "Glassware, temperature, and decanting cheatsheets per style.",
              icon: "🍇",
            },
            {
              title: "Pairing made easy",
              body: "Principles-first pairing matrix with real dishes and quick swaps.",
              icon: "🍽️",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-yellow-300/60"
            >
              <span className="text-2xl">{card.icon}</span>
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="text-sm text-white/70">{card.body}</p>
            </div>
          ))}
        </section>

        <section id="types" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Styles & grapes</p>
              <h2 className="text-2xl font-bold">Decode each wine family</h2>
              <p className="text-sm text-white/70">
                Quick snapshots on tannin, acidity, body, and aroma hallmarks to guide recommendations.
              </p>
            </div>
            <span className="hidden rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/60 sm:inline-flex">
              Interactive
            </span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/70 p-4 sm:p-6">
            <WineTypeExplorer />
          </div>
        </section>

        <section id="pairing" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Pairing lab</p>
              <h2 className="text-2xl font-bold">Serve smarter, pair better</h2>
              <p className="text-sm text-white/70">
                Browse pairings, swap ingredients, and get temperature and glassware cues instantly.
              </p>
            </div>
            <span className="hidden rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/60 sm:inline-flex">
              Templates
            </span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/70 p-4 sm:p-6">
            <PairingShowcase />
          </div>
        </section>

        <section id="reviews" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4rem] text-yellow-300">Tasting room</p>
              <h2 className="text-2xl font-bold">Recent tasting impressions</h2>
              <p className="text-sm text-white/70">
                Sommeliers, critics, and passionate customers share their sensory takeaways to guide your next pour.
              </p>
            </div>
            <span className="hidden rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/60 sm:inline-flex">
              Updated weekly
            </span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/70 p-4 sm:p-6">
            <TastingReviews />
          </div>
        </section>
      </div>
    </main>
  );
}
