import BottomNav from "@/components/BottomNav";
import StoryCard from "@/components/StoryCard";
import { navItems } from "@/data/mockStories";
import { getDailyBriefing } from "@/lib/news/briefing";
import { Newspaper, Radar, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BriefingPage() {
  let briefing = {
    mode: "empty",
    topStories: [],
    fastRisingStories: [],
    watchlistStories: [],
    briefingStories: [],
  };
  let error = null;

  try {
    briefing = await getDailyBriefing();
  } catch (caughtError) {
    error = caughtError.message;
  }

  const leadStory = briefing.briefingStories[0];

  return (
    <main className="min-h-screen pb-24 text-black">
      <header className="sticky top-0 z-20 border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-normal text-yellow-500">
              <Newspaper size={14} strokeWidth={3} />
              Hermes
            </p>
            <h1 className="text-2xl font-black tracking-normal">Briefing</h1>
          </div>
          <div className="ink-button bg-yellow-300 px-3 py-2 text-right text-xs font-bold">
            <p>{briefing.briefingStories.length} stories</p>
            <p className="text-black/60">{briefing.mode}</p>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="ink-panel-yellow relative overflow-hidden p-4">
            <div className="absolute -right-8 -top-8 h-24 w-24 rotate-12 border-2 border-black bg-white/40" />
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-normal">
              <Sparkles size={15} strokeWidth={3} />
              Daily briefing
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight">
              {leadStory?.headline || "No briefing stories yet."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6">
              {leadStory?.summary ||
                "Ingest, cluster, and rank Reddit posts to build your briefing."}
            </p>
          </section>

          {error ? (
            <section className="ink-panel p-4">
              <h2 className="text-xl font-black">Briefing unavailable</h2>
              <p className="mt-2 text-sm font-bold text-black/60">{error}</p>
            </section>
          ) : null}

          <div className="space-y-4">
            {briefing.briefingStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="ink-panel p-4">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase">
              <Radar size={16} strokeWidth={3} />
              Sections
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-bold text-black/60">Top stories</dt>
                <dd className="font-black">{briefing.topStories.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-bold text-black/60">Fast rising</dt>
                <dd className="font-black">
                  {briefing.fastRisingStories.length}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-bold text-black/60">Watchlist</dt>
                <dd className="font-black">{briefing.watchlistStories.length}</dd>
              </div>
            </dl>
          </section>

          <section className="ink-panel-dark p-4">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase">
              <Sparkles size={16} strokeWidth={3} />
              Briefing logic
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-white/80">
              Built from existing ranked stories. No separate ingestion pipeline
              is used for this page.
            </p>
          </section>
        </aside>
      </section>

      <BottomNav active="Briefing" items={navItems} />
    </main>
  );
}
