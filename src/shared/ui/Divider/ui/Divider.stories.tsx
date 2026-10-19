// src/shared/ui/Divider/ui/Divider.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta = {
  title: 'Shared/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Line direction (children require horizontal)',
    },
    variant: {
      control: 'select',
      options: ['solid', 'dashed', 'dotted'],
      description: 'Line style',
    },
    thickness: {
      control: 'number',
      description: 'Line thickness in px (1–10)',
    },
  },
  args: {
    orientation: 'horizontal',
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

// The story decorator sizes content shrink-to-fit, so a bare `width: 100%`
// divider would collapse to 0 — the horizontal line needs a fixed-width
// wrapper (vertical needs a definite parent height for `height: 100%`).

/** Horizontal line (default: solid, 1px). */
export const Default: Story = {
  render: (args) => (
    <div style={{ width: '400px' }}>
      <Divider {...args} />
    </div>
  ),
};

/** Vertical line: height comes from the parent row. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '3rem' }}>
      <span>Left</span>
      <Divider {...args} />
      <span>Right</span>
    </div>
  ),
};

/** Text divider: children become a label between two line segments. */
export const WithLabel: Story = {
  args: { children: 'Section label' },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <Divider {...args} />
    </div>
  ),
};
