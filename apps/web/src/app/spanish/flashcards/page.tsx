import { SpanishFlashcardDeck } from "@/components/SpanishFlashcardDeck";

export const metadata = { title: "Spanish Flashcards" };

export default function SpanishFlashcardsPage() {
  return (
    <main className="theme-spanish mx-auto flex max-w-7xl flex-col px-4 py-6 sm:px-5 md:min-h-[calc(100vh-5rem)] md:px-8 md:py-8">
      <SpanishFlashcardDeck />
    </main>
  );
}
