import { NextResponse } from "next/server";

export async function GET() {
  // Simulate latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  const models = [
    { id: "gpt-4.1-mini", name: "GPT 4.1 Mini", description: "Fast, cheap" },
    { id: "gpt-4.1", name: "GPT 4.1", description: "Balanced quality" },
    { id: "gpt-o1", name: "o1 Reasoning", description: "Deliberative" },
  ];

  return NextResponse.json(models);
}
