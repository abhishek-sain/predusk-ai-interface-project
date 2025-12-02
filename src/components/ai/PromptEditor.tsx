"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/context/SessionContext";

interface Template {
  id: string;
  name: string;
  content: string;
}

const LOCAL_KEY = "ai-ui-prompt-templates";

export const PromptEditor = () => {
  const { systemPrompt, setSystemPrompt } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/templates");
        if (!res.ok) {
          throw new Error(`Templates request failed (${res.status})`);
        }
        const text = await res.text();
        if (!text) throw new Error("Templates response is empty");
        let apiTemplates: Template[] = [];
        try {
          apiTemplates = JSON.parse(text) as Template[];
        } catch (parseErr) {
          console.error("Failed to parse /api/templates JSON:", parseErr);
          throw new Error("Templates response is not valid JSON");
        }
        const customRaw = window.localStorage.getItem(LOCAL_KEY);
        const custom = customRaw ? (JSON.parse(customRaw) as Template[]) : [];
        if (!cancelled) {
          setTemplates([...apiTemplates, ...custom]);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = (e as Error).message || "Unknown error";
          setError(msg);
          console.error("Error fetching templates:", e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (template) setSystemPrompt(template.content);
  };

  const handleSaveTemplate = () => {
    const name = window.prompt("Template name?");
    if (!name || !systemPrompt.trim()) return;
    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name,
      content: systemPrompt,
    };
    const customTemplates = templates.filter((t) => t.id.startsWith("custom-"));
    const updatedCustom = [...customTemplates, newTemplate];
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(updatedCustom));
    setTemplates((prev) => [...prev, newTemplate]);
    setSelectedTemplateId(newTemplate.id);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          System prompt
        </h2>
        {loading && (
          <span className="text-[11px] text-gray-400">
            Loading templates…
          </span>
        )}
      </div>
      {error && (
        <div
          role="alert"
          className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md px-2 py-1"
        >
          {error}
        </div>
      )}
      <select
        aria-label="Prompt templates"
        className="w-full rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        value={selectedTemplateId}
        onChange={(e) => handleTemplateChange(e.target.value)}
      >
        <option value="">Blank prompt</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <textarea
        aria-label="System prompt editor"
        className="w-full min-h-[120px] rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-y"
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        placeholder="Describe how the AI should behave or what it should do..."
      />
      <div className="flex gap-2 justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSaveTemplate}
        >
          Save as template
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedTemplateId("");
            setSystemPrompt("");
          }}
        >
          Clear prompt
        </Button>
      </div>
    </div>
  );
};
