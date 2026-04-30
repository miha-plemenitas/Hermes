import Link from "next/link";
import { Flame, Sparkles } from "lucide-react";

export default function TopicTabs({ activeTab = "top", tabs = [] }) {
  return (
    <nav
      className="mx-auto flex max-w-5xl gap-2 overflow-x-auto border-t border-black/10 px-4 py-3 sm:px-6"
      aria-label="Topics"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        const href = tab.value === "top" ? "/" : `/?tab=${tab.value}`;

        return (
          <Link
            className={`ink-button flex shrink-0 items-center gap-2 px-4 py-2 text-sm font-bold ${
              isActive ? "bg-black text-white" : "bg-white text-black"
            }`}
            href={href}
            key={tab.value}
          >
            {isActive ? (
              <Flame size={15} strokeWidth={3} />
            ) : (
              <Sparkles size={15} strokeWidth={3} />
            )}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
