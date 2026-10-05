import { PageHeader } from "@/components/PageHeader";
import { SpanishPronunciation } from "@/components/SpanishPronunciation";

export const metadata = { title: "Spanish Pronunciation" };

export default function SpanishPronunciationPage() {
  return (
    <main className="theme-spanish mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 md:gap-8 md:px-8 md:py-8">
      <PageHeader eyebrow="Pronunciation" title="Sound naturally Mexican from day one." description="Spanish spelling is beautifully regular. Learn the ten sound rules that matter most in Latin America, then tap any example to hear a native Mexican speaker." />
      <SpanishPronunciation />
    </main>
  );
}
