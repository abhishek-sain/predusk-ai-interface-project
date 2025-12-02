import type { Meta, StoryObj } from "@storybook/react";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Message } from "@/context/SessionContext";

const meta: Meta<typeof ChatBubble> = {
  title: "UI/ChatBubble",
  component: ChatBubble,
};

export default meta;
type Story = StoryObj<typeof ChatBubble>;

const exampleMsg: Message = {
  id: "1",
  role: "assistant",
  content: "Hello, I am your AI assistant. How can I help you today?",
  timestamp: new Date().toISOString(),
};

export const AssistantBubble: Story = {
  args: {
    message: exampleMsg,
    onCopy: (c: string) => alert("Copy: " + c.slice(0, 20) + "..."),
    onDownloadJson: (m: Message) => alert("Download JSON for " + m.id),
  },
};
