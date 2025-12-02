"use client";

import { useSession } from "@/context/SessionContext";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isMobile, onClose }: SidebarProps) => {
  const {
    sessions,
    activeSessionId,
    switchSession,
    createNewSession,
    renameSession,
    deleteSession,
  } = useSession();

  const handleNewChat = () => {
    createNewSession();
    if (onClose) onClose();
  };

  const handleSessionActivate = (id: string) => {
    switchSession(id);
    if (isMobile && onClose) onClose();
  };

  return (
    <aside
      className={clsx(
        "flex flex-col h-full bg-gray-50/80 dark:bg-slate-950/60 border-r border-gray-200 dark:border-slate-800",
        isMobile && "w-full max-w-xs"
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          Conversations
        </span>
        <Button size="sm" variant="outline" onClick={handleNewChat}>
          + New
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {sessions.map((s) => (
          <div
            key={s.id}
            role="button"
            tabIndex={0}
            className={clsx(
              "w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs text-left border transition outline-none",
              s.id === activeSessionId
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                : "border-transparent hover:bg-gray-100 dark:hover:bg-slate-900"
            )}
            onClick={() => handleSessionActivate(s.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSessionActivate(s.id);
              }
            }}
          >
            <span className="truncate">{s.title || "Untitled chat"}</span>
            <span className="flex-shrink-0 flex gap-1">
              <button
                type="button"
                className="text-[11px] opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  const name = window.prompt("Rename chat", s.title);
                  if (name) renameSession(s.id, name);
                }}
              >
                ✎
              </button>
              <button
                type="button"
                className="text-[11px] opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      "Delete this conversation? This cannot be undone."
                    )
                  ) {
                    deleteSession(s.id);
                  }
                }}
              >
                🗑
              </button>
            </span>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="text-[11px] text-gray-500 dark:text-slate-400 px-1 py-2">
            No conversations yet. Start a new chat!
          </p>
        )}
      </div>
    </aside>
  );
};
