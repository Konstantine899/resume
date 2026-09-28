// src/shared/ui/Slot/ui/Slot.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Slot } from './Slot';

const meta: Meta<typeof Slot> = {
  title: 'Shared/Slot',
  component: Slot,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {},
      options: {
        runOnly: ['WCAG 2A', 'WCAG 2AA'],
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Slot {...args} data-testid="slot-default">
      <button type="button" className="child-btn">
        Child button
      </button>
    </Slot>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const child = await canvas.findByText('Child button');
    expect(child.tagName).toBe('BUTTON');
  },
};

export const ClassNameMerge: Story = {
  render: () => (
    <Slot className="parent-class" data-testid="slot-class">
      <span className="child-class">Merged class</span>
    </Slot>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = await canvas.findByText('Merged class');
    expect(element).toHaveClass('parent-class');
    expect(element).toHaveClass('child-class');
  },
};

export const OverrideIdAndTestId: Story = {
  render: () => (
    <Slot id="parent-id" data-testid="parent-testid">
      <span id="child-id" data-testid="child-testid">
        Overridden id/testid
      </span>
    </Slot>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = await canvas.findByText('Overridden id/testid');
    expect(element).toHaveAttribute('id', 'parent-id');
    expect(element).toHaveAttribute('data-testid', 'parent-testid');
  },
};

export const DataAttrs: Story = {
  render: () => (
    <Slot dataAttrs={{ 'data-size': 'xl', 'data-theme': 'dark' }} data-testid="slot-attrs">
      <span>With data attrs</span>
    </Slot>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = await canvas.findByText('With data attrs');
    expect(element).toHaveAttribute('data-size', 'xl');
    expect(element).toHaveAttribute('data-theme', 'dark');
  },
};

export const RestProps: Story = {
  render: () => (
    <Slot role="navigation" aria-label="slot-region" data-testid="slot-rest">
      <nav>Rest props</nav>
    </Slot>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = await canvas.findByText('Rest props');
    expect(element).toHaveAttribute('role', 'navigation');
    expect(element).toHaveAttribute('aria-label', 'slot-region');
  },
};
