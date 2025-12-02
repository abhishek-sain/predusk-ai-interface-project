import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "@/components/ui/Slider";
import { useState } from "react";

const meta: Meta<typeof Slider> = {
  title: "UI/Slider",
  component: Slider,
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const TemperatureSlider: Story = {
  render: () => {
    const [value, setValue] = useState(0.7);
    return (
      <Slider
        label={`Temperature (${value.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        helperText="Adjust the creativity of the model."
      />
    );
  },
};
