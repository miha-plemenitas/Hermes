import Link from "next/link";
import { Home, Newspaper, Search, Settings } from "lucide-react";

const icons = {
  Briefing: Newspaper,
  Home,
  Search,
  Settings,
};

export default function BottomNav({ active = "Home", items = [] }) {
  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-black bg-white sm:hidden"
        aria-label="Primary"
      >
        <div className="grid grid-cols-4">
          {items.map((item) => {
            const isActive = item.label === active;
            const Icon = icons[item.label] || Home;

            return (
              <Link
                className={`flex h-16 flex-col items-center justify-center gap-1 border-r border-black text-xs font-black last:border-r-0 ${
                  isActive ? "bg-yellow-300" : "bg-white"
                }`}
                href={item.href}
                key={item.label}
              >
                <Icon size={18} strokeWidth={3} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav
        className="mx-auto hidden max-w-5xl px-6 pb-8 sm:block"
        aria-label="Primary desktop"
      >
        <div className="flex border-2 border-black">
          {items.map((item) => {
            const isActive = item.label === active;
            const Icon = icons[item.label] || Home;

            return (
              <Link
                className={`flex h-14 flex-1 items-center justify-center gap-2 border-r border-black text-sm font-black last:border-r-0 ${
                  isActive ? "bg-yellow-300" : "bg-white"
                }`}
                href={item.href}
                key={item.label}
              >
                <Icon size={18} strokeWidth={3} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
