import { FlashcardDeck } from "@/components/FlashcardDeck";

export default function FlashcardsPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col px-4 py-6 sm:px-5 md:min-h-[calc(100vh-5rem)] md:px-8 md:py-8">
      <FlashcardDeck />
    </main>
  );
}
