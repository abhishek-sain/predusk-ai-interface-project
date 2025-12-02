"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, Message } from "@/context/SessionContext";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Button } from "@/components/ui/Button";

export const ChatArea = () => {
  const {
    messages,
    addMessage,
    updateMessage,
    replaceMessages,
    model,
    temperature,
    maxTokens,
    topP,
    presencePenalty,
    frequencyPenalty,
    systemPrompt,
    demoMode,
  } = useSession();

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isStreamingRef = useRef(false);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  const stopStreaming = () => {
    setIsStreaming(false);
    setStreamingMessageId(null);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const demoResponses = [
    (user: string) =>
      `Let me break that down for you.\n\n1. **Restating your request**\n\n> ${user}\n\n2. **Key considerations**\n- Context awareness\n- Local-first storage\n- Responsive UI\n\n3. **Next steps**\nI'll outline a short plan and then we can iterate.\n\n\`\`\`thinking\nAnalyzing UI requirements…\nDesigning state shape…\n\`\`\``,
    (user: string) =>
      `Here's a more detailed walkthrough.\n\n### High-level idea\nWe want a local-first playground that feels like ChatGPT or Claude.\n\n### Rough structure\n- Layout: header + sidebar + chat\n- State: sessions, messages, system prompt\n- Mock backend: demo mode with fake tool calls.\n\n### Your latest input\n\`\`\`user\n${user}\n\`\`\`\n\n\`\`\`tool:search\n{"query":"local-first chat ui","top_k":3}\n\`\`\`\n\nFrom here we can plug in a real LLM later.`,
    (user: string) =>
      `We can also think about this mathematically.\n\n$$p(w_t \\mid w_{<t}) \\propto p(w_t) \\cdot \\prod_{i < t} f(w_i, w_t)$$\n\nWhere the temperature, top-p, presence, and frequency penalties all adjust this distribution.\n\nFor your message:\n\n> ${user}\n\nwe'd tune these parameters to control creativity vs. determinism.`,
  ];

  const buildMockResponse = (userContent: string) => {
    const idx = messages.filter((m) => m.role === "assistant").length;
    const fn = demoMode
      ? demoResponses[idx % demoResponses.length]
      : (u: string) =>
          `Model: ${model}\nTemperature: ${temperature.toFixed(
            2
          )} | Max tokens: ${maxTokens}\nTop-p: ${topP.toFixed(
            2
          )} | Presence: ${presencePenalty.toFixed(
            2
          )} | Frequency: ${frequencyPenalty.toFixed(
            2
          )}\n\nYou said: "${u}"\n\nThis is a mock response summarising and acknowledging your input.`;
    return fn(userContent);
  };

  const streamResponse = (fullText: string) => {
    const assistantMsg = addMessage("assistant", "");
    setStreamingMessageId(assistantMsg.id);
    setIsStreaming(true);
    isStreamingRef.current = true;

    const words = fullText.split(/\s+/);
    let i = 0;

    const step = () => {
      if (!isStreamingRef.current) return;
      i += 4; // stream in small chunks of words
      const chunk = words.slice(0, i).join(" ");
      updateMessage(assistantMsg.id, { content: chunk });
      if (i < words.length) {
        const delay = 200 + Math.random() * 200;
        timeoutRef.current = window.setTimeout(step, delay);
      } else {
        setIsStreaming(false);
        setStreamingMessageId(null);
      }
    };

    step();
  };

  const handleSend = () => {
    if (!input.trim() || !model || isSending || isStreaming) return;
    const userContent = input.trim();
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      if (editingMessageId) {
        // Edit existing message, trim following, then regenerate
        const targetIndex = messages.findIndex(
          (m) => m.id === editingMessageId
        );
        if (targetIndex !== -1) {
          const updated: Message = {
            ...messages[targetIndex],
            content: userContent,
            timestamp: new Date().toISOString(),
          };
          const trimmed = [
            ...messages.slice(0, targetIndex),
            updated,
          ] as Message[];
          replaceMessages(trimmed);
        }
        setEditingMessageId(null);
      } else {
        addMessage("user", userContent);
      }

      // implicitly prepend system prompt as first "system" message in conceptual conversation
      if (systemPrompt.trim()) {
        // we *display* it separately; for now we just acknowledge it in the mock response
      }

      const mock = buildMockResponse(userContent);
      streamResponse(mock);
    } catch {
      setError("Failed to generate response.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      alert("Copy failed");
    }
  };

  const handleDownloadJson = (msg: any) => {
    const blob = new Blob([JSON.stringify(msg, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-response-${msg.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleRegenerateLast = () => {
    if (isStreaming) return;
    const lastAssistantIndex = [...messages]
      .map((m, i) => ({ m, i }))
      .reverse()
      .find(({ m }) => m.role === "assistant")?.i;
    if (lastAssistantIndex === undefined) return;
    const before = messages.slice(0, lastAssistantIndex);
    const lastUser = [...before]
      .map((m, i) => ({ m, i }))
      .reverse()
      .find(({ m }) => m.role === "user")?.m;
    if (!lastUser) return;
    replaceMessages(before);
    const mock = buildMockResponse(lastUser.content);
    streamResponse(mock);
  };

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        textareaRef.current?.focus();
      }

      if (isMeta && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }

      if (
        e.key === "ArrowUp" &&
        document.activeElement === textareaRef.current &&
        !input.trim()
      ) {
        const lastUser = [...messages]
          .map((m, i) => ({ m, i }))
          .reverse()
          .find(({ m }) => m.role === "user")?.m;
        if (lastUser) {
          e.preventDefault();
          setInput(lastUser.content);
          setEditingMessageId(lastUser.id);
          textareaRef.current?.focus();
        }
      }

      if (e.key === "Escape") {
        if (isStreaming) {
          e.preventDefault();
          stopStreaming();
        } else if (input) {
          e.preventDefault();
          setInput("");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSend, input, isStreaming, messages]);

  const disabledReason = !model
    ? "Select a model first."
    : isSending
    ? "Sending..."
    : isStreaming
    ? "Streaming..."
    : "";

  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          Chat
        </h2>
        {model && (
          <span className="text-[11px] text-gray-400">
            Using <span className="font-medium">{model}</span>
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-950/40 px-3 py-2 mb-3">
        {systemPrompt.trim() && (
          <div className="mb-3">
            <ChatBubble
              message={{
                id: "system",
                role: "system",
                content: systemPrompt,
                timestamp: new Date().toISOString(),
              }}
              onCopy={handleCopy}
              onDownloadJson={handleDownloadJson}
            />
          </div>
        )}
        {messages.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            Start a conversation by typing a message below. Use the left panel
            to adjust model, system prompt, and parameters.
          </p>
        )}
        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={m}
            onCopy={handleCopy}
            onDownloadJson={handleDownloadJson}
            isLastAssistant={m.id === lastAssistantId}
            onRegenerateLast={
              m.id === lastAssistantId ? handleRegenerateLast : undefined
            }
          />
        ))}
      </div>
      {error && (
        <div
          role="alert"
          className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md px-2 py-1 mb-2"
        >
          {error}
        </div>
      )}
      <form
        className="flex gap-2 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <label className="flex-1 flex flex-col gap-1">
          <span className="sr-only">Your message</span>
          <textarea
            ref={textareaRef}
            required
            rows={2}
            className="w-full rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none"
            placeholder={
              model
                ? editingMessageId
                  ? "Editing previous message…"
                  : "Ask anything…"
                : "Select a model before sending…"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <Button
          type="submit"
          disabled={!input.trim() || !model || isSending || isStreaming}
          aria-disabled={!input.trim() || !model || isSending || isStreaming}
        >
          {isStreaming ? "Streaming…" : isSending ? "Sending…" : "Send"}
        </Button>
      </form>
      <div className="mt-1 flex items-center justify-between">
        {disabledReason && (
          <p className="text-[11px] text-gray-400">{disabledReason}</p>
        )}
        {isStreaming && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={stopStreaming}
          >
            ⏹ Stop generating
          </Button>
        )}
      </div>
      <p className="mt-1 text-[10px] text-gray-400">
        Shortcuts: ⌘/Ctrl+K focus • ⌘/Ctrl+Enter send • ↑ edit last message • Esc
        stop/clear
      </p>
    </div>
  );
};
