import BottomNav from "@/components/BottomNav";
import PreferenceAwareFeed from "@/components/PreferenceAwareFeed";
import TopicTabs from "@/components/TopicTabs";
import { mockStories, navItems, topics } from "@/data/mockStories";
import { getFeedStories } from "@/lib/news/feed";
import { Activity, Bot, RefreshCw, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  let feed = {
    mode: "mock",
    stories: [],
  };
  let feedError = null;

  try {
    feed = await getFeedStories();
  } catch (error) {
    feedError = error.message;
  }

  const stories = feed.stories.length > 0 ? feed.stories : mockStories;
  const feedMode = feed.stories.length > 0 ? "Live feed" : "Mock feed";
  const leadStory = stories[0];

  return (
    <main className="min-h-screen pb-24 text-black">
      <header className="sticky top-0 z-20 border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-normal text-yellow-500">
              <Zap size={14} strokeWidth={3} />
              Reddit news desk
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

        <div className="overflow-hidden border-t-2 border-black bg-black py-2 text-xs font-black uppercase text-yellow-300">
          <div className="ticker-track flex w-max gap-8 px-4">
            <span>Reddit signals</span>
            <span>Community momentum</span>
            <span>Ranked Reddit posts</span>
            <span>Ranked trends</span>
            <span>Reddit signals</span>
            <span>Community momentum</span>
            <span>Ranked Reddit posts</span>
            <span>Ranked trends</span>
          </div>
        </div>

        <TopicTabs activeTopic="Top" topics={topics} />
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="ink-panel-yellow relative overflow-hidden p-4">
            <div className="absolute -right-8 -top-8 h-24 w-24 rotate-12 border-2 border-black bg-white/40" />
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-normal">
              <Activity size={15} strokeWidth={3} />
              Trending now
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight">
              {leadStory.headline}
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6">
              {leadStory.summary}
            </p>
          </section>

          <PreferenceAwareFeed stories={stories} />
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
                  {feed.stories.length > 0 ? feed.mode : "Mock"}
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
              Build focus
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-white/80">
              Preferences can prioritize topics and hide blocked sources. They
              are stored locally until account auth is added.
            </p>
          </section>
        </aside>
      </section>

      <BottomNav active="Home" items={navItems} />
    </main>
  );
}
