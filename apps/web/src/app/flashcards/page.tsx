import { FlashcardDeck } from "@/components/FlashcardDeck";

export default function FlashcardsPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col px-5 py-8 md:px-8">
      <FlashcardDeck />
    </main>
  );
}
