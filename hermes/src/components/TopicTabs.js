import { Flame, Sparkles } from "lucide-react";

export default function TopicTabs({ activeTopic = "Top", topics = [] }) {
  return (
    <nav
      className="mx-auto flex max-w-5xl gap-2 overflow-x-auto border-t border-black/10 px-4 py-3 sm:px-6"
      aria-label="Topics"
    >
      {topics.map((topic) => {
        const isActive = topic === activeTopic;

        return (
          <button
            className={`ink-button flex shrink-0 items-center gap-2 px-4 py-2 text-sm font-bold ${
              isActive ? "bg-black text-white" : "bg-white text-black"
            }`}
            key={topic}
            type="button"
          >
            {isActive ? (
              <Flame size={15} strokeWidth={3} />
            ) : (
              <Sparkles size={15} strokeWidth={3} />
            )}
            {topic}
          </button>
        );
      })}
    </nav>
  );
}
