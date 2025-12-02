// src/app/api/templates/route.ts
import { NextResponse } from "next/server";

interface Template {
  id: string;
  name: string;
  content: string;
}

const templates: Template[] = [
  {
    id: "system-helper",
    name: "Helpful assistant",
    content: "You are a helpful AI assistant. Answer clearly and concisely.",
  },
  {
    id: "code-review",
    name: "Code review",
    content:
      "Review the following code, point out issues, and suggest improvements.",
  },
  {
    id: "ux-copy",
    name: "UX copywriter",
    content:
      "You write concise, friendly UX copy. Propose 3 variants for the following text.",
  },
];

export async function GET() {
  // optional: simulate latency
  await new Promise((resolve) => setTimeout(resolve, 400));

  // IMPORTANT: always return JSON
  return NextResponse.json(templates);
}
