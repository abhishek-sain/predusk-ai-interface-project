"use client";

import { useSession } from "@/context/SessionContext";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";

export const ParametersPanel = () => {
  const {
    temperature,
    maxTokens,
    topP,
    presencePenalty,
    frequencyPenalty,
    setTemperature,
    setMaxTokens,
    setTopP,
    setPresencePenalty,
    setFrequencyPenalty,
    demoMode,
    setDemoMode,
  } = useSession();

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
        Parameters
      </h2>
      <Slider
        label={`Temperature (${temperature.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={temperature}
        onChange={(e) => setTemperature(parseFloat(e.target.value))}
        helperText="Higher = more creative, lower = more deterministic."
      />
      <Slider
        label={`Top-p (${topP.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={topP}
        onChange={(e) => setTopP(parseFloat(e.target.value))}
        helperText="Nucleus sampling cutoff; 1 = disabled."
      />
      <Slider
        label={`Max tokens (${maxTokens})`}
        min={64}
        max={2048}
        step={64}
        value={maxTokens}
        onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
        helperText="Upper bound on response length."
      />
      <Slider
        label={`Presence penalty (${presencePenalty.toFixed(2)})`}
        min={-2}
        max={2}
        step={0.1}
        value={presencePenalty}
        onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
        helperText="Positive discourages repeating tokens at all."
      />
      <Slider
        label={`Frequency penalty (${frequencyPenalty.toFixed(2)})`}
        min={-2}
        max={2}
        step={0.1}
        value={frequencyPenalty}
        onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
        helperText="Positive discourages repeating frequent tokens."
      />
      <div className="pt-1 flex items-center justify-between">
        <span className="text-[11px] text-gray-500 dark:text-slate-400">
          Demo mode (mock responses)
        </span>
        <Button
          type="button"
          size="sm"
          variant={demoMode ? "primary" : "outline"}
          onClick={() => setDemoMode(!demoMode)}
        >
          {demoMode ? "On" : "Off"}
        </Button>
      </div>
    </div>
  );
};
