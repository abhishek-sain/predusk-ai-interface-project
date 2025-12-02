"use client";

import { ReactNode, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Sidebar as SessionSidebar } from "@/components/layout/Sidebar";
import { ExportMenu } from "@/components/layout/ExportMenu";
import { FeedbackButton } from "@/components/layout/FeedbackButton";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/context/SessionContext";
import LZString from "lz-string";
import { motion, AnimatePresence } from "framer-motion";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { getActiveSessionSnapshot } = useSession();

  const childArray = Array.isArray(children)
    ? (children as ReactNode[])
    : [children];
  const leftPanel = childArray[0] ?? null;
  const mainPanel = childArray[1] ?? null;

  const handleShare = async () => {
    const snapshot = getActiveSessionSnapshot();
    if (!snapshot) return;
    try {
      const json = JSON.stringify(snapshot);
      const compressed = LZString.compressToEncodedURIComponent(json);
      const url = new URL(window.location.href);
      url.searchParams.set("share", compressed);
      await navigator.clipboard.writeText(url.toString());
      alert("Shareable link copied to clipboard.");
    } catch {
      alert("Failed to copy share link.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex md:hidden items-center justify-center rounded-md border border-gray-200 dark:border-slate-700 px-2 py-1 text-sm"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open conversations sidebar"
          >
            ☰
          </button>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 text-white font-semibold">
            AI
          </span>
          <div className="flex flex-col">
            <span className="font-semibold text-sm sm:text-base">
              AI Interface Prototype
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              Model selector • Prompt editor • Chat
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            aria-label="Share this chat"
          >
            🔗 Share
          </Button>
          <ExportMenu />
          <FeedbackButton />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex w-64 lg:w-72 border-r border-gray-200 dark:border-slate-800">
          <SessionSidebar />
        </div>
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {leftPanel}
          {mainPanel}
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 flex md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <motion.div
              className="bg-gray-50 dark:bg-slate-950 h-full w-72 max-w-full shadow-xl"
              initial={{ x: -40 }}
              animate={{ x: 0 }}
              exit={{ x: -40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SessionSidebar
                isMobile
                onClose={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
