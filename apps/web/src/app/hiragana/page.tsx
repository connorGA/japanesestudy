import { Suspense } from "react";
import HiraganaPageClient from "./HiraganaPageClient";

export default function HiraganaPage() {
  return (
    <Suspense>
      <HiraganaPageClient />
    </Suspense>
  );
}
