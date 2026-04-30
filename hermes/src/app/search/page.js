import BottomNav from "@/components/BottomNav";
import StoryCard from "@/components/StoryCard";
import { navItems } from "@/data/mockStories";
import { searchRawItems } from "@/lib/news/search";
import { Filter, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const platform = "reddit";
  const source = params?.source || "";
  const time = params?.time || "";
  const hasFilters = Boolean(query || source || time);
  const stories = hasFilters
    ? await searchRawItems({ query, platform, source, time })
    : [];

  return (
    <main className="min-h-screen pb-24 text-black">
      <header className="sticky top-0 z-20 border-b-2 border-black bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-normal text-yellow-500">
            <Search size={14} strokeWidth={3} />
            Hermes
          </p>
          <h1 className="text-2xl font-black tracking-normal">Search</h1>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <form className="ink-panel-yellow grid gap-3 p-4 sm:grid-cols-4">
          <label className="sm:col-span-2">
            <span className="text-xs font-black uppercase">Keyword</span>
            <input
              className="mt-1 h-12 w-full border-2 border-black bg-white px-3 text-base font-bold outline-none"
              defaultValue={query}
              name="q"
              placeholder="AI, Ukraine, markets..."
            />
          </label>

          <input name="platform" type="hidden" value="reddit" />

          <div>
            <span className="text-xs font-black uppercase">Platform</span>
            <div className="mt-1 flex h-12 items-center border-2 border-black bg-white px-3 text-base font-black">
              Reddit
            </div>
          </div>

          <label>
            <span className="text-xs font-black uppercase">Time</span>
            <select
              className="mt-1 h-12 w-full border-2 border-black bg-white px-3 text-base font-bold outline-none"
              defaultValue={time}
              name="time"
            >
              <option value="">Any</option>
              <option value="day">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </label>

          <label className="sm:col-span-3">
            <span className="text-xs font-black uppercase">Source</span>
            <input
              className="mt-1 h-12 w-full border-2 border-black bg-white px-3 text-base font-bold outline-none"
              defaultValue={source}
              name="source"
              placeholder="r/worldnews, r/technology..."
            />
          </label>

          <button
            className="ink-button flex h-12 items-center justify-center gap-2 self-end bg-black px-4 text-sm font-black uppercase text-white"
            type="submit"
          >
            <Filter size={16} strokeWidth={3} />
            Search
          </button>
        </form>

        <div className="mt-6">
          <p className="flex items-center gap-2 text-sm font-black uppercase text-black/60">
            <Search size={16} strokeWidth={3} />
            {hasFilters ? `${stories.length} results` : "Enter search filters"}
          </p>

          <div className="mt-4 space-y-4">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>

      <BottomNav active="Search" items={navItems} />
    </main>
  );
}
