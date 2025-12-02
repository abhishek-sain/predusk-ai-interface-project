"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import LZString from "lz-string";

export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
}

export interface SessionState {
  model: string | null;
  temperature: number;
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  systemPrompt: string;
  messages: Message[];
}

export interface SavedSession extends SessionState {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionContextValue extends SessionState {
  // core controls
  setModel: (model: string | null) => void;
  setTemperature: (value: number) => void;
  setMaxTokens: (value: number) => void;
  setTopP: (value: number) => void;
  setPresencePenalty: (value: number) => void;
  setFrequencyPenalty: (value: number) => void;
  setSystemPrompt: (value: string) => void;

  addMessage: (role: Role, content: string) => Message;
  updateMessage: (id: string, partial: Partial<Message>) => void;
  replaceMessages: (messages: Message[]) => void;
  clearMessages: () => void;

  // sessions
  sessions: SavedSession[];
  activeSessionId: string;
  createNewSession: () => void;
  renameSession: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
  switchSession: (id: string) => void;
  getActiveSessionSnapshot: () => SavedSession | null;

  // demo mode
  demoMode: boolean;
  setDemoMode: (value: boolean) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "ai-ui-sessions";
const ACTIVE_KEY = "ai-ui-active-session";

const DEFAULT_PARAMS = {
  temperature: 0.7,
  maxTokens: 512,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
};

const createEmptySession = (id?: string): SavedSession => {
  const now = new Date().toISOString();
  return {
    id: id ?? crypto.randomUUID(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    model: null,
    systemPrompt: "",
    messages: [],
    ...DEFAULT_PARAMS,
  };
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");

  // live state mirrors active session
  const [model, setModelState] = useState<string | null>(null);
  const [temperature, setTemperatureState] = useState(DEFAULT_PARAMS.temperature);
  const [maxTokens, setMaxTokensState] = useState(DEFAULT_PARAMS.maxTokens);
  const [topP, setTopPState] = useState(DEFAULT_PARAMS.topP);
  const [presencePenalty, setPresencePenaltyState] = useState(
    DEFAULT_PARAMS.presencePenalty
  );
  const [frequencyPenalty, setFrequencyPenaltyState] = useState(
    DEFAULT_PARAMS.frequencyPenalty
  );
  const [systemPrompt, setSystemPromptState] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // hydrate from localStorage & ?share=
  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const shared = url.searchParams.get("share");

    if (shared) {
      try {
        const json = LZString.decompressFromEncodedURIComponent(shared);
        if (json) {
          const imported = JSON.parse(json) as SavedSession;
          const importedSession: SavedSession = {
            ...createEmptySession(),
            ...imported,
            id: crypto.randomUUID(),
            title: imported.title || "Shared chat",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setSessions([importedSession]);
          setActiveSessionId(importedSession.id);
          // reflect into live state
          setModelState(importedSession.model);
          setTemperatureState(importedSession.temperature);
          setMaxTokensState(importedSession.maxTokens);
          setTopPState(importedSession.topP);
          setPresencePenaltyState(importedSession.presencePenalty);
          setFrequencyPenaltyState(importedSession.frequencyPenalty);
          setSystemPromptState(importedSession.systemPrompt);
          setMessages(importedSession.messages);
          // clean URL
          url.searchParams.delete("share");
          window.history.replaceState({}, "", url.toString());
          return;
        }
      } catch {
        // fall back to normal load
      }
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    const activeRaw = window.localStorage.getItem(ACTIVE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedSession[];
        if (parsed.length > 0) {
          setSessions(parsed);
          const candidate =
            activeRaw && parsed.find((s) => s.id === activeRaw)
              ? activeRaw
              : parsed[0].id;
          setActiveSessionId(candidate);
          const active = parsed.find((s) => s.id === candidate)!;
          setModelState(active.model);
          setTemperatureState(active.temperature);
          setMaxTokensState(active.maxTokens);
          setTopPState(active.topP);
          setPresencePenaltyState(active.presencePenalty);
          setFrequencyPenaltyState(active.frequencyPenalty);
          setSystemPromptState(active.systemPrompt);
          setMessages(active.messages);
          return;
        }
      } catch {
        // ignore
      }
    }
    const fresh = createEmptySession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setModelState(fresh.model);
    setTemperatureState(fresh.temperature);
    setMaxTokensState(fresh.maxTokens);
    setTopPState(fresh.topP);
    setPresencePenaltyState(fresh.presencePenalty);
    setFrequencyPenaltyState(fresh.frequencyPenalty);
    setSystemPromptState(fresh.systemPrompt);
    setMessages(fresh.messages);
  }, []);

  // persist sessions + active id
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    window.localStorage.setItem(ACTIVE_KEY, activeSessionId);
  }, [sessions, activeSessionId]);

  const syncActiveSession = (partial?: Partial<SavedSession>) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              model,
              temperature,
              maxTokens,
              topP,
              presencePenalty,
              frequencyPenalty,
              systemPrompt,
              messages,
              updatedAt: new Date().toISOString(),
              ...partial,
            }
          : s
      )
    );
  };

  const withSync =
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>, key: keyof SavedSession) =>
    (value: T) => {
      setter(value);
      syncActiveSession({ [key]: value } as Partial<SavedSession>);
    };

  const setModel = (value: string | null) => {
    setModelState(value);
    syncActiveSession({ model: value });
  };
  const setTemperature = withSync(setTemperatureState, "temperature");
  const setMaxTokens = withSync(setMaxTokensState, "maxTokens");
  const setTopP = withSync(setTopPState, "topP");
  const setPresencePenalty = withSync(
    setPresencePenaltyState,
    "presencePenalty"
  );
  const setFrequencyPenalty = withSync(
    setFrequencyPenaltyState,
    "frequencyPenalty"
  );
  const setSystemPrompt = (value: string) => {
    setSystemPromptState(value);
    syncActiveSession({ systemPrompt: value });
  };

  const addMessage = (role: Role, content: string): Message => {
    const msg: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => {
      const next = [...prev, msg];
      // auto-title from first user message
      if (
        role === "user" &&
        prev.filter((m) => m.role === "user").length === 0
      ) {
        const firstLine = content.split("\n")[0].slice(0, 40);
        const title = firstLine || "New chat";
        syncActiveSession({ title });
      } else {
        syncActiveSession();
      }
      return next;
    });
    return msg;
  };

  const updateMessage = (id: string, partial: Partial<Message>) => {
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...partial } : m));
      syncActiveSession({ messages: next });
      return next;
    });
  };

  const replaceMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    syncActiveSession({ messages: newMessages });
  };

  const clearMessages = () => {
    setMessages([]);
    syncActiveSession({ messages: [] });
  };

  const createNewSession = () => {
    const fresh = createEmptySession();
    setSessions((prev) => [...prev, fresh]);
    setActiveSessionId(fresh.id);
    setModelState(fresh.model);
    setTemperatureState(fresh.temperature);
    setMaxTokensState(fresh.maxTokens);
    setTopPState(fresh.topP);
    setPresencePenaltyState(fresh.presencePenalty);
    setFrequencyPenaltyState(fresh.frequencyPenalty);
    setSystemPromptState(fresh.systemPrompt);
    setMessages(fresh.messages);
  };

  const renameSession = (id: string, title: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (id === activeSessionId) {
      const remaining = sessions.filter((s) => s.id !== id);
      if (remaining.length) {
        const next = remaining[0];
        setActiveSessionId(next.id);
        setModelState(next.model);
        setTemperatureState(next.temperature);
        setMaxTokensState(next.maxTokens);
        setTopPState(next.topP);
        setPresencePenaltyState(next.presencePenalty);
        setFrequencyPenaltyState(next.frequencyPenalty);
        setSystemPromptState(next.systemPrompt);
        setMessages(next.messages);
      } else {
        const fresh = createEmptySession();
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
        setModelState(fresh.model);
        setTemperatureState(fresh.temperature);
        setMaxTokensState(fresh.maxTokens);
        setTopPState(fresh.topP);
        setPresencePenaltyState(fresh.presencePenalty);
        setFrequencyPenaltyState(fresh.frequencyPenalty);
        setSystemPromptState(fresh.systemPrompt);
        setMessages(fresh.messages);
      }
    }
  };

  const switchSession = (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (!target) return;
    setActiveSessionId(id);
    setModelState(target.model);
    setTemperatureState(target.temperature);
    setMaxTokensState(target.maxTokens);
    setTopPState(target.topP);
    setPresencePenaltyState(target.presencePenalty);
    setFrequencyPenaltyState(target.frequencyPenalty);
    setSystemPromptState(target.systemPrompt);
    setMessages(target.messages);
  };

  const getActiveSessionSnapshot = () => {
    const base = sessions.find((s) => s.id === activeSessionId);
    if (!base) return null;
    return {
      ...base,
      model,
      temperature,
      maxTokens,
      topP,
      presencePenalty,
      frequencyPenalty,
      systemPrompt,
      messages,
    };
  };

  const value: SessionContextValue = useMemo(
    () => ({
      model,
      temperature,
      maxTokens,
      topP,
      presencePenalty,
      frequencyPenalty,
      systemPrompt,
      messages,
      setModel,
      setTemperature,
      setMaxTokens,
      setTopP,
      setPresencePenalty,
      setFrequencyPenalty,
      setSystemPrompt,
      addMessage,
      updateMessage,
      replaceMessages,
      clearMessages,
      sessions,
      activeSessionId,
      createNewSession,
      renameSession,
      deleteSession,
      switchSession,
      getActiveSessionSnapshot,
      demoMode,
      setDemoMode,
    }),
    [
      model,
      temperature,
      maxTokens,
      topP,
      presencePenalty,
      frequencyPenalty,
      systemPrompt,
      messages,
      sessions,
      activeSessionId,
      demoMode,
    ]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = (): SessionContextValue => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
};
