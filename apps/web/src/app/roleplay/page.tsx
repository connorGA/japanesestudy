import { PageHeader } from "@/components/PageHeader";
import { RoleplayPractice } from "@/components/RoleplayPractice";

export default function RoleplayPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader
        description="Pick a real-world situation, speak or type your line, and continue the conversation with feedback."
        eyebrow="Roleplay"
        title="Rehearse practical Japanese conversations."
      />
      <RoleplayPractice />
    </main>
  );
}
