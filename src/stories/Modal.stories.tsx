import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const BasicModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal isOpen={open} title="Settings" onClose={() => setOpen(false)}>
          This is a reusable modal component. Press Escape or click ✕ to close.
        </Modal>
      </div>
    );
  },
};
