"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/context/SessionContext";

interface Model {
  id: string;
  name: string;
  description: string;
}

export const ModelSelector = () => {
  const { model, setModel } = useSession();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/models");
        if (!res.ok) throw new Error("Failed to fetch models");
        const data: Model[] = await res.json();
        setModels(data);
        // If no model selected yet, pick the first one
        if (!model && data[0]) setModel(data[0].id);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [model, setModel]);

  const selectedModel = useMemo(
    () => models.find((m) => m.id === model) || null,
    [models, model]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          Model
        </h2>
        {loading && (
          <span className="text-[11px] text-gray-400">Loading…</span>
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

      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-gray-700 dark:text-slate-200">
          Select model
        </span>
        <select
          className="w-full rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          value={model ?? ""}
          onChange={(e) => {
            const value = e.target.value || null;
            setModel(value);
          }}
        >
          <option value="">Choose a model…</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>

      {selectedModel && (
        <p className="text-[11px] text-gray-500 dark:text-slate-400">
          {selectedModel.description}
        </p>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        type="button"
        onClick={() => {
          // simple refetch – easiest is reload for now
          window.location.reload();
        }}
      >
        Refresh models
      </Button>
    </div>
  );
};
