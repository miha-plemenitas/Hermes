import Link from "next/link";
import { notFound } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { mockStories, navItems } from "@/data/mockStories";
import { getStoryDetail } from "@/lib/news/storyDetail";
import { Clock3, ExternalLink, Layers3, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

function getMockStoryDetail(id) {
  const story = mockStories.find((item) => item.id === id);

  if (!story) {
    return null;
  }

  return {
    ...story,
    sourceItems: story.sources.map((source) => ({
      id: source,
      title: story.headline,
      url: "#",
      snippet: story.summary,
      source,
      timestamp: story.timestamp,
    })),
    firstSeen: story.timestamp,
    lastSeen: story.timestamp,
  };
}

export default async function StoryDetail({ params }) {
  const { id } = await params;
  const story = (await getStoryDetail(id)) || getMockStoryDetail(id);

  if (!story) {
    notFound();
  }

  return (
    <main className="min-h-screen pb-24 text-black">
      <header className="sticky top-0 z-20 border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="text-sm font-black" href="/">
            Hermes
          </Link>
          <span className="ink-button bg-yellow-300 px-3 py-2 text-xs font-black">
            {story.topic}
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <p className="text-xs font-black uppercase text-black/50">
          {story.timestamp} / {story.sourceCount} sources / score {story.score}
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
          {story.headline}
        </h1>

        <section className="ink-panel-yellow mt-6 p-4">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase">
            <Sparkles size={16} strokeWidth={3} />
            AI summary
          </h2>
          <p className="mt-3 text-base font-medium leading-7">{story.summary}</p>
        </section>

        <section className="ink-panel mt-6 p-4">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase">
            <Clock3 size={16} strokeWidth={3} />
            Timeline
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-bold text-black/50">First seen</dt>
              <dd className="font-black">{story.firstSeen}</dd>
            </div>
            <div>
              <dt className="font-bold text-black/50">Last update</dt>
              <dd className="font-black">{story.lastSeen}</dd>
            </div>
          </dl>
        </section>

        <section className="ink-panel mt-6 p-4">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase">
            <Layers3 size={16} strokeWidth={3} />
            Sources
          </h2>
          <ul className="mt-3 space-y-3 text-sm">
            {story.sourceItems.map((sourceItem) => (
              <li className="border-b border-black/20 pb-3" key={sourceItem.id}>
                <a
                  className="font-black underline decoration-yellow-400 decoration-4 underline-offset-4"
                  href={sourceItem.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="mr-1 inline" size={15} strokeWidth={3} />
                  {sourceItem.title}
                </a>
                <p className="mt-1 font-bold text-black/60">
                  {sourceItem.source} / {sourceItem.timestamp}
                </p>
                {sourceItem.snippet ? (
                  <p className="mt-2 font-medium leading-6 text-black/70">
                    {sourceItem.snippet}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </article>

      <BottomNav active="Home" items={navItems} />
    </main>
  );
}
