import { PageHeader } from "@/components/PageHeader";
import { RoleplayPractice } from "@/components/RoleplayPractice";

export default function RoleplayPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 md:gap-8 md:px-8 md:py-8">
      <PageHeader
        description="Pick a real-world situation, speak or type your line, and continue the conversation with feedback."
        eyebrow="Roleplay"
        title="Rehearse practical Japanese conversations."
      />
      <RoleplayPractice />
    </main>
  );
}
