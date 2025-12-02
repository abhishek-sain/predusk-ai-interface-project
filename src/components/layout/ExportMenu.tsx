"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/context/SessionContext";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, Text, StyleSheet, pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  heading: { fontSize: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 12, marginTop: 8, marginBottom: 4 },
  messageRole: { fontSize: 10, marginTop: 4, marginBottom: 1 },
  messageText: { fontSize: 10, marginBottom: 4 },
});

const ExportDoc = ({
  title,
  model,
  messages,
  systemPrompt,
}: {
  title: string;
  model: string | null;
  messages: { role: string; content: string }[];
  systemPrompt: string;
}) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.heading}>{title || "Chat export"}</Text>
      {model && <Text>Model: {model}</Text>}
      {systemPrompt && (
        <>
          <Text style={styles.sectionTitle}>System prompt</Text>
          <Text style={styles.messageText}>{systemPrompt}</Text>
        </>
      )}
      <Text style={styles.sectionTitle}>Messages</Text>
      {messages.map((m, idx) => (
        <Text key={idx}>
          <Text style={styles.messageRole}>[{m.role}] </Text>
          <Text style={styles.messageText}>{m.content}</Text>
        </Text>
      ))}
    </Page>
  </Document>
);

export const ExportMenu = () => {
  const [open, setOpen] = useState(false);
  const { getActiveSessionSnapshot } = useSession();

  const snapshot = getActiveSessionSnapshot();

  const asMarkdown = useMemo(() => {
    if (!snapshot) return "";
    const lines: string[] = [];
    lines.push(`# ${snapshot.title || "Chat export"}`);
    if (snapshot.model) lines.push(`\n_Model: \`${snapshot.model}\`_`);
    if (snapshot.systemPrompt) {
      lines.push(`\n## System prompt\n\n${snapshot.systemPrompt}\n`);
    }
    lines.push(`\n## Messages\n`);
    snapshot.messages.forEach((m) => {
      lines.push(`### ${m.role.toUpperCase()}\n`);
      lines.push(`${m.content}\n`);
    });
    return lines.join("\n");
  }, [snapshot]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard.");
    } catch {
      alert("Copy failed.");
    }
  };

  const downloadFile = (content: string | Blob, filename: string) => {
    const blob =
      content instanceof Blob ? content : new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    if (!snapshot) return;
    const blob = await pdf(
      <ExportDoc
        title={snapshot.title}
        model={snapshot.model}
        systemPrompt={snapshot.systemPrompt}
        messages={snapshot.messages}
      />
    ).toBlob();
    downloadFile(blob, `${snapshot.title || "chat"}.pdf`);
  };

  if (!snapshot) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        ⤓ Export
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 mt-1 w-44 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg z-20 text-xs"
          >
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={() => {
                downloadFile(asMarkdown, `${snapshot.title || "chat"}.md`);
                setOpen(false);
              }}
            >
              Export as Markdown
            </button>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={async () => {
                await handleExportPdf();
                setOpen(false);
              }}
            >
              Export as PDF
            </button>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={async () => {
                const plain = snapshot.messages
                  .map((m) => `[${m.role}] ${m.content}`)
                  .join("\n\n");
                await copyToClipboard(plain);
                setOpen(false);
              }}
            >
              Copy all as text
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
