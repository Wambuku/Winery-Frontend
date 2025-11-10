import dynamic from "next/dynamic";
import type { Metadata } from "next";

const WineHistoryTimeline = dynamic(() => import("../../components/education/WineHistoryTimeline"), {
  loading: () => (
    <section className="rounded-3xl border border-white/10 bg-black/60 p-6 text-white/60">
      Loading timeline…
    </section>
  ),
});

const WineRegionExplorer = dynamic(() => import("../../components/education/WineRegionExplorer"), {
  loading: () => (
    <section className="rounded-3xl border border-white/10 bg-black/60 p-6 text-white/60">
      Loading regions…
    </section>
  ),
});

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
    <main className="min-h-screen bg-gradient-to-b from-black via-[#120303] to-red-950 px-4 py-16 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4rem] text-yellow-300">Cellar academy</p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">Elevate your wine intelligence</h1>
          <p className="mx-auto max-w-3xl text-sm text-white/70 sm:text-base">
            Dive into curated lessons spanning history, terroir, tasting analysis, and pairing playbooks. Every module is
            crafted by our tasting panel to help your guests discover their next favorite bottle.
          </p>
        </header>

        <KnowledgeBaseSearch />
        <WineHistoryTimeline />
        <WineRegionExplorer />
        <WineTypeExplorer />
        <PairingShowcase />
        <TastingReviews />
      </div>
    </main>
  );
}
