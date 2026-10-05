import { PageHeader } from "@/components/PageHeader";
import { SpanishExpressions } from "@/components/SpanishExpressions";

export const metadata = { title: "Spanish Expressions" };

export default function SpanishExpressionsPage() {
  return (
    <main className="theme-spanish mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 md:gap-8 md:px-8 md:py-8">
      <PageHeader eyebrow="Expressions" title="Talk like you grew up in México." description="Everyday Mexican slang, the words that change across Latin America, and the context to use each one naturally." />
      <SpanishExpressions />
    </main>
  );
}
