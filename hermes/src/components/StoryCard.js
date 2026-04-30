import { ArrowUpRight, Clock3, Layers3, Radio, Sparkles } from "lucide-react";

export default function StoryCard({ story }) {
  const storyHref = story.detailUrl || story.url || `/stories/${story.id}`;
  const isExternal = storyHref.startsWith("http");

  return (
    <article className="ink-panel pop-in group relative overflow-hidden p-4">
      <div className="absolute right-3 top-3 h-10 w-10 rotate-6 border-2 border-black bg-yellow-300 opacity-20 transition-transform group-hover:rotate-12" />
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1 bg-black px-2 py-1 text-xs font-black uppercase text-white">
          <Radio size={13} strokeWidth={3} />
          {story.topic}
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-black/60">
          <Clock3 size={13} strokeWidth={3} />
          {story.timestamp}
        </span>
      </div>

      <h3 className="mt-4 text-xl font-black leading-snug">
        <a
          className="inline-flex items-start gap-2 decoration-yellow-400 decoration-4 underline-offset-4 hover:underline"
          href={storyHref}
          rel={isExternal ? "noreferrer" : undefined}
          target={isExternal ? "_blank" : undefined}
        >
          {story.headline}
          <ArrowUpRight className="mt-1 shrink-0" size={18} strokeWidth={3} />
        </a>
      </h3>

      <p className="mt-2 text-sm font-medium leading-6 text-black/70">
        {story.summary}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        <span className="flex items-center gap-1 border border-black bg-white px-2 py-1">
          <Layers3 size={13} strokeWidth={3} />
          {story.sourceCount} sources
        </span>
        <span className="flex items-center gap-1 border border-black bg-yellow-300 px-2 py-1">
          <Sparkles size={13} strokeWidth={3} />
          {story.trend}
        </span>
        <span className="border border-black bg-white px-2 py-1">
          Score {story.score}
        </span>
      </div>

      <div className="mt-4 border-t border-black/20 pt-3">
        <p className="text-xs font-black uppercase text-black/50">Top sources</p>
        <p className="mt-1 text-sm font-bold">{story.sources.join(", ")}</p>
        <p className="mt-2 text-xs font-black uppercase text-black/50">
          Opens original Reddit post or linked article
        </p>
      </div>
    </article>
  );
}
