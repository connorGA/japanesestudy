import { PageHeader } from "@/components/PageHeader";
import { SpanishVerbTrainer } from "@/components/SpanishVerbTrainer";

export const metadata = { title: "Spanish Verbs" };

export default function SpanishVerbsPage() {
  return <main className="theme-spanish mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 md:gap-8 md:px-8 md:py-8"><PageHeader eyebrow="Verb lab" title="Conjugate the verbs that power conversation." description="Switch between the present, the preterite, and the everyday ir a future. Tap any form to hear it from a native Mexican speaker, or hide the answers in quiz mode." /><SpanishVerbTrainer /></main>;
}
