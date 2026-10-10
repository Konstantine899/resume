// src/shared/ui/EmptyState/ui/EmptyState/EmptyState.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Shared/EmptyState/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    // Fixtures, not translations: kit EmptyState has no i18n of its own
    // (plan A2) — real strings arrive from consumers through t().
    title: 'No categories yet',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('No categories yet')).toBeVisible();
    // No optional slots → no <p>/<button> scaffolding.
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const WithDescription: Story = {
  args: {
    description: 'Skills are grouped by category. Add the first one to get started.',
  },
};

export const WithAction: Story = {
  args: {
    description: 'Positions appear here once you add them.',
    action: (
      <Button variant="primary" size="sm" onClick={fn()}>
        Add position
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);

    await user.click(canvas.getByRole('button', { name: 'Add position' }));
  },
};

export const AlignLeft: Story = {
  args: {
    align: 'left',
    description: 'Left-aligned variant for full-width list slots.',
    action: (
      <Button variant="secondary" size="sm" onClick={fn()}>
        Retry
      </Button>
    ),
  },
};

export const Compact: Story = {
  args: {
    compact: true,
    description: 'Tighter padding for dashboard cards.',
  },
};

export const Russian: Story = {
  args: {
    // ru fixtures prove the component does not own copy (plan A2).
    title: 'Категорий навыков пока нет',
    description: 'Навыки группируются по категориям — добавьте первую.',
    action: (
      <Button variant="primary" size="sm" onClick={fn()}>
        Добавить
      </Button>
    ),
  },
};

export const NarrowViewport: Story = {
  args: {
    description: 'Wraps comfortably on a 390px viewport.',
    action: (
      <Button variant="primary" size="sm" onClick={fn()}>
        Add
      </Button>
    ),
  },
  parameters: {
    // SPEC: exact 390px — Storybook's built-in `mobile1` is 320px.
    viewport: {
      viewports: {
        narrow390: {
          name: 'Narrow 390px',
          styles: { width: '390px', height: '844px' },
        },
      },
      defaultViewport: 'narrow390',
    },
  },
};
