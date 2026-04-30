import { MeridianChat } from "@/components/MeridianChat";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MeridianChat />
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-center text-xs text-[var(--text-muted)]">
        Prototype assistant — answers use Meridian systems via the support API.
      </footer>
    </div>
  );
}
