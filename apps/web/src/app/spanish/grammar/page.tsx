import { PageHeader } from "@/components/PageHeader";
import { SpanishGrammarGuide } from "@/components/SpanishGrammarGuide";

export const metadata = { title: "Spanish Grammar" };

export default function SpanishGrammarPage() {
  return (
    <main className="theme-spanish mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 md:gap-8 md:px-8 md:py-8">
      <PageHeader eyebrow="Grammar" title="See the patterns behind the language." description="Start with the structures that unlock the most Latin American Spanish. Each lesson gives you a rule, real examples you can hear, and one practical memory cue." />
      <SpanishGrammarGuide />
    </main>
  );
}
