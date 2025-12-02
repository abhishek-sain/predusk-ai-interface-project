"use client";

import { Message } from "@/context/SessionContext";
import clsx from "clsx";
import { Button } from "./Button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatBubbleProps {
  message: Message;
  onCopy: (content: string) => void;
  onDownloadJson: (msg: Message) => void;
  isLastAssistant?: boolean;
  onRegenerateLast?: () => void;
}

export const ChatBubble = ({
  message,
  onCopy,
  onDownloadJson,
  isLastAssistant,
  onRegenerateLast,
}: ChatBubbleProps) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  const body =
    !isUser && !isSystem ? (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            if (inline || !match) {
              return (
                <code
                  className={clsx(
                    "px-1 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-[11px]",
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  borderRadius: "0.75rem",
                  fontSize: "0.75rem",
                  padding: "0.75rem",
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {message.content}
      </ReactMarkdown>
    ) : (
      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
    );

  return (
    <div
      className={clsx(
        "flex gap-2 mb-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "max-w-[90%] sm:max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm border",
          isSystem
            ? "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-50"
            : isUser
            ? "bg-indigo-600 text-white border-indigo-500"
            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800"
        )}
      >
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-[11px] uppercase tracking-wide opacity-80">
            {isSystem ? "System" : isUser ? "You" : "Assistant"}
          </span>
          <span className="text-[10px] opacity-60">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {body}
        </div>
        {!isUser && !isSystem && (
          <div className="flex flex-wrap gap-2 mt-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(message.content)}
            >
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownloadJson(message)}
            >
              JSON
            </Button>
            {isLastAssistant && onRegenerateLast && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerateLast}
                aria-label="Regenerate last response"
              >
                Regenerate
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
