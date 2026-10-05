import { RealtimeTutor } from "@/components/RealtimeTutor";

export const metadata = { title: "Spanish AI Tutor" };

export default function SpanishTutorPage() {
  return (
    <main className="theme-spanish flex w-full flex-col gap-5 px-4 py-5 sm:px-5 sm:py-6 md:gap-6 md:px-6 lg:h-[calc(100svh-5.5rem)] lg:overflow-hidden">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-matcha">Tutor</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Practice with a realtime Mexican Spanish tutor.</h1>
        <p className="mt-1 text-sm text-slate-600">Speak in English or Spanish, ask questions, and roleplay everyday situations from Mexico City to Oaxaca.</p>
      </div>
      <RealtimeTutor language="spanish" />
    </main>
  );
}
