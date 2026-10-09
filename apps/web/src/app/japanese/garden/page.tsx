import type { Metadata } from "next";
import { OfflineDownload } from "@/components/OfflineDownload";
import { ZenGarden } from "@/components/game/ZenGarden";

export const metadata: Metadata = { title: "Garden" };

export default function GardenPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 md:px-8 md:py-8">
      <ZenGarden />
      <OfflineDownload />
    </main>
  );
}
