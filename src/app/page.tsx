

"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ModelSelector } from "@/components/ai/ModelSelector";
import { PromptEditor } from "@/components/ai/PromptEditor";
import { ParametersPanel } from "@/components/ai/ParametersPanel";
import { ChatArea } from "@/components/ai/ChatArea";

export default function HomePage() {
  return (
    <AppShell>
      <section className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 flex flex-col gap-4 p-4 overflow-y-auto">
        <ModelSelector />
        <PromptEditor />
        <ParametersPanel />
      </section>

      <section className="flex-1 flex flex-col p-4 overflow-hidden">
        <ChatArea />
      </section>
    </AppShell>
  );
}
