import { Suspense } from "react";
import RoleplayPageClient from "./RoleplayPageClient";

export default function RoleplayPage() {
  return (
    <Suspense>
      <RoleplayPageClient />
    </Suspense>
  );
}
