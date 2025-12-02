"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useSession } from "@/context/SessionContext";

const FEEDBACK_KEY = "ai-ui-feedback";

interface FeedbackItem {
  id: string;
  messageId: string;
  rating: "up" | "down";
  comment: string;
  createdAt: string;
}

export const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string>("");
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);

  const { messages } = useSession();
  const assistantMessages = messages.filter((m) => m.role === "assistant");

  const handleSave = () => {
    if (!rating || !selectedMessageId) {
      alert("Pick a message and rating first.");
      return;
    }
    const item: FeedbackItem = {
      id: crypto.randomUUID(),
      messageId: selectedMessageId,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(FEEDBACK_KEY);
      const existing = raw ? (JSON.parse(raw) as FeedbackItem[]) : [];
      window.localStorage.setItem(
        FEEDBACK_KEY,
        JSON.stringify([...existing, item])
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setComment("");
      setRating(null);
    }
  };

  if (assistantMessages.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setOpen(true);
          setSelectedMessageId(assistantMessages[assistantMessages.length - 1].id);
        }}
      >
        💬 Feedback
      </Button>
      <Modal
        isOpen={open}
        title="Give feedback"
        onClose={() => setOpen(false)}
      >
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Assistant message</span>
            <select
              className="rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
              value={selectedMessageId}
              onChange={(e) => setSelectedMessageId(e.target.value)}
            >
              {assistantMessages.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.content.slice(0, 50) || "(empty)"}…
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium">Rating</span>
            <Button
              size="sm"
              variant={rating === "up" ? "primary" : "outline"}
              onClick={() => setRating("up")}
            >
              👍
            </Button>
            <Button
              size="sm"
              variant={rating === "down" ? "primary" : "outline"}
              onClick={() => setRating("down")}
            >
              👎
            </Button>
          </div>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">Optional comment</span>
            <textarea
              rows={3}
              className="rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs resize-y"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike about this response?"
            />
          </label>
          <div className="flex justify-end gap-2">
            {saved && (
              <span className="text-[11px] text-green-600 dark:text-green-400 self-center">
                Saved!
              </span>
            )}
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button size="sm" onClick={handleSave}>
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
