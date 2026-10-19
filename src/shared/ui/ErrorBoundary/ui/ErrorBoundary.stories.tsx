// src/shared/ui/ErrorBoundary/ui/ErrorBoundary.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ErrorBoundary } from './ErrorBoundary';

const meta = {
  title: 'Shared/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    // Fixtures, not translations: the kit boundary owns no copy — the
    // consumer supplies the fallback node (usually through t()).
    children: <p>Protected content renders without errors.</p>,
  },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Child that throws during RENDER — the boundary catches it. The throw
 * happens at render time (never at module scope), so loading the story
 * itself is safe; React's console.error noise is expected (the unit test
 * uses the same pattern).
 */
const Boom = () => {
  throw new Error('Storybook render crash');
};

/** Children render normally — the boundary stays transparent. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Protected content renders without errors.')).toBeVisible();
  },
};

/** Static ReactNode fallback replaces the crashed subtree. */
export const FallbackCustom: Story = {
  args: {
    children: <Boom />,
    fallback: <p>Something went wrong. Please try again.</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Something went wrong. Please try again.')).toBeVisible();
    await expect(canvas.queryByText('Protected content renders without errors.')).toBeNull();
  },
};

/** Function fallback receives the caught error and renders its message. */
export const ErrorFallback: Story = {
  args: {
    children: <Boom />,
    fallback: (error) => <p>Caught: {error.message}</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Caught: Storybook render crash')).toBeVisible();
    await expect(canvas.queryByText('Protected content renders without errors.')).toBeNull();
  },
};
