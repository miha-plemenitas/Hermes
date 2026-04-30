import BottomNav from "@/components/BottomNav";
import SettingsForm from "@/components/SettingsForm";
import { navItems } from "@/data/mockStories";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="min-h-screen pb-24 text-black">
      <header className="sticky top-0 z-20 border-b-2 border-black bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-normal text-yellow-500">
            <Settings size={14} strokeWidth={3} />
            Hermes
          </p>
          <h1 className="text-2xl font-black tracking-normal">Settings</h1>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <SettingsForm />
      </section>

      <BottomNav active="Settings" items={navItems} />
    </main>
  );
}
