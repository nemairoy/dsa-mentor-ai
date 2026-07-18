import { Bell, Brain, Languages, Lock, Moon, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PremiumCard } from "@/components/shared/premium-card";

const sections = [
  { icon: Moon, title: "Theme", text: "System theme enabled with light and dark mode support.", value: "System" },
  { icon: Languages, title: "Language", text: "Learning interface language for future localized content.", value: "English" },
  { icon: Bell, title: "Notifications", text: "Study reminders, streak nudges, and weekly summaries.", value: "Quiet" },
  { icon: Brain, title: "AI preferences", text: "Beginner-friendly tone, examples first, concise answers.", value: "Guided" },
  { icon: Lock, title: "Account", text: "Google OAuth account managed through secure authentication.", value: "Google" },
  { icon: ShieldCheck, title: "Privacy", text: "Learning data is used only for progress and recommendations.", value: "Protected" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Modern workspace preferences without changing authentication, AI, or backend configuration." />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <PremiumCard key={section.title}>
            <section.icon aria-hidden={true} size={20} className="text-emerald-700 dark:text-emerald-300" />
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{section.title}</h2>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{section.text}</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{section.value}</span>
            </div>
          </PremiumCard>
        ))}
      </div>
    </div>
  );
}
