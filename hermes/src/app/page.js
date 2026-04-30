import BottomNav from "@/components/BottomNav";
import PreferenceAwareFeed from "@/components/PreferenceAwareFeed";
import TopicTabs from "@/components/TopicTabs";
import { feedTabs, mockStories, navItems } from "@/data/mockStories";
import { getQuoteOfTheDay } from "@/data/quotes";
import { getFeedStories, getRawFeedStories } from "@/lib/news/feed";
import { Activity, Bot, RefreshCw, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

function getActiveTab(searchParams) {
  const tab = searchParams?.tab;
  const allowedTabs = new Set(["top", "tech", "gaming", "for-you"]);

  return allowedTabs.has(tab) ? tab : "top";
}

function filterStoriesForTab(stories, activeTab) {
  if (activeTab === "tech") {
    return stories.filter((story) => story.topic === "Tech");
  }

  if (activeTab === "gaming") {
    return stories.filter((story) => story.topic === "Gaming");
  }

  return stories;
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  let feed = {
    mode: "mock",
    stories: [],
  };
  let feedError = null;
  const activeTab = getActiveTab(params);

  try {
    feed = await getFeedStories({ limit: 50 });
  } catch (error) {
    feedError = error.message;
  }

  const allStories = feed.stories.length > 0 ? feed.stories : mockStories;
  let stories = filterStoriesForTab(allStories, activeTab);

  if (
    stories.length === 0 &&
    feed.stories.length > 0 &&
    (activeTab === "tech" || activeTab === "gaming")
  ) {
    const rawStories = await getRawFeedStories({ limit: 50 });
    stories = filterStoriesForTab(rawStories, activeTab);
  }

  const feedMode = feed.stories.length > 0 ? "Live feed" : "Mock feed";
  const feedSourceLabel =
    feed.stories.length > 0
      ? feed.mode === "story_clusters"
        ? "Clustered feed"
        : "Raw feed"
      : "Mock data";
  const leadStory = stories[0];
  const quoteOfTheDay = getQuoteOfTheDay();

  return (
    <main className="min-h-screen pb-24 text-black">
      <header className="sticky top-0 z-20 border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-normal text-yellow-500">
              <Zap size={14} strokeWidth={3} />
              News desk
            </p>
            <h1 className="text-2xl font-black tracking-normal">Hermes</h1>
          </div>
          <div className="ink-button bg-yellow-300 px-3 py-2 text-right text-xs font-bold">
            <p className="flex items-center justify-end gap-1">
              <RefreshCw size={13} strokeWidth={3} />
              Updated
            </p>
            <p className="text-black/60">{feedMode}</p>
          </div>
        </div>

        <div className="ticker-shell text-xs font-black uppercase text-yellow-300">
          <div className="ticker-track">
            <div className="ticker-copy">
              <span className="ticker-quote">“{quoteOfTheDay.quote}”</span>
              <span className="text-white/35">/</span>
              <span className="ticker-author">— {quoteOfTheDay.author}</span>
            </div>
          </div>
        </div>

        <TopicTabs activeTab={activeTab} tabs={feedTabs} />
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="ink-panel-yellow relative overflow-hidden p-4">
            <div className="absolute -right-8 -top-8 h-24 w-24 rotate-12 border-2 border-black bg-white/40" />
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-normal">
              <Activity size={15} strokeWidth={3} />
              {feedTabs.find((tab) => tab.value === activeTab)?.label || "Top news"}
            </p>
            {leadStory ? (
              <>
                <h2 className="mt-2 text-3xl font-black leading-tight">
                  {leadStory.headline}
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-medium leading-6">
                  {leadStory.summary}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-2 text-3xl font-black leading-tight">
                  No stories in this tab yet.
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-medium leading-6">
                  Try another tab, or ingest more Reddit sources so this
                  category fills up.
                </p>
              </>
            )}
          </section>

          <PreferenceAwareFeed activeTab={activeTab} stories={stories} />
        </div>

        <aside className="space-y-4">
          <section className="ink-panel p-4">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-normal">
              <Activity size={16} strokeWidth={3} />
              Feed status
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-bold text-black/60">Mode</dt>
                <dd className="font-black">
                  {feed.stories.length > 0 ? "Live" : "Static"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-bold text-black/60">Stories</dt>
                <dd className="font-black">{stories.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-bold text-black/60">Source</dt>
                <dd className="font-black">
                  {feedSourceLabel}
                </dd>
              </div>
            </dl>
            {feedError ? (
              <p className="mt-4 border-t border-black/20 pt-3 text-xs font-bold text-black/60">
                Feed fallback: {feedError}
              </p>
            ) : null}
          </section>

          <section className="ink-panel-dark p-4">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-normal">
              <Bot size={16} strokeWidth={3} />
              Deployment ready
            </h2>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-white/80">
              <li>Server-side Supabase reads and ingestion are wired up.</li>
              <li>Reddit, clustering, ranking, and summarization are connected.</li>
              <li>Groq powers the personalized tab with a fallback path.</li>
              <li>Vercel cron refreshes the feed automatically every 24 hours.</li>
              <li>Preferences stay local for now, so the app deploys without auth.</li>
            </ul>
          </section>
        </aside>
      </section>

      <BottomNav active="Home" items={navItems} />
    </main>
  );
}
