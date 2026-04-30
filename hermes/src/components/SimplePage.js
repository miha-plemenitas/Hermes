import BottomNav from "@/components/BottomNav";
import { navItems } from "@/data/mockStories";

export default function SimplePage({ active, title, description }) {
  return (
    <main className="min-h-screen bg-white pb-24 text-black">
      <header className="sticky top-0 z-20 border-b-2 border-black bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-normal text-yellow-500">
            Hermes
          </p>
          <h1 className="text-2xl font-black tracking-normal">{title}</h1>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="border-2 border-black bg-yellow-300 p-4">
          <h2 className="text-2xl font-black leading-tight">{title}</h2>
          <p className="mt-3 text-sm font-medium leading-6">{description}</p>
        </div>
      </section>

      <BottomNav active={active} items={navItems} />
    </main>
  );
}
