// src/shared/ui/Popover/ui/Popover.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import { Popover } from './Popover';

const meta = {
  title: 'Shared/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'center'],
      description: 'Popover placement relative to the trigger',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'auto'],
      description: 'Popover size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the popover',
    },
    closeOnContentClick: {
      control: 'boolean',
      description: 'Close when the content is clicked',
    },
    closeOnClickOutside: {
      control: 'boolean',
      description: 'Close on clicks outside the popover',
    },
    closeOnEsc: {
      control: 'boolean',
      description: 'Close on Escape',
    },
    offset: {
      control: 'number',
      description: 'Offset from the trigger (px)',
    },
    autoAdjust: {
      control: 'boolean',
      description: 'Reposition automatically when leaving the viewport',
    },
  },
  args: {
    // Fixtures, not translations: kit Popover owns no i18n — real strings
    // arrive from consumers through t().
    content: 'Popover content: details about the project.',
    // ariaLabel feeds both the trigger and the dialog — an OPEN popover must
    // carry a dialog name for axe `aria-dialog-name`.
    ariaLabel: 'Project details',
    title: 'Project details',
    children: 'Project details',
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Opens via the Trigger: the click reveals the Content in a Portal.
 * Deliberately left OPEN after play — the axe gate scans the final DOM
 * state, dialog included.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Project details' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Project details' });
    await expect(dialog).toHaveTextContent('Popover content: details about the project.');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

/** Pre-click state: trigger only, no dialog in the DOM. */
export const Closed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Project details' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(screen.queryByRole('dialog')).toBeNull();
  },
};

const POSITIONS = [
  { position: 'top', label: 'Top' },
  { position: 'bottom', label: 'Bottom' },
  { position: 'left', label: 'Left' },
  { position: 'right', label: 'Right' },
  { position: 'center', label: 'Center' },
] as const;

/**
 * All 5 positions. Each trigger carries the requested position in
 * `data-position` (auto-adjust has not run before opening), while the
 * center popover is the one opened for verification — its position is
 * deterministic on any viewport.
 */
export const Placement: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
      }}
    >
      {POSITIONS.map(({ position, label }) => (
        <Popover
          key={position}
          position={position}
          ariaLabel={`${label} placement`}
          content={`${label} placement content`}
        >
          {`${label} placement`}
        </Popover>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const { position, label } of POSITIONS) {
      const trigger = canvas.getByRole('button', { name: `${label} placement` });
      await expect(trigger).toHaveAttribute('data-position', position);
    }

    await userEvent.click(canvas.getByRole('button', { name: 'Center placement' }));
    const dialog = await screen.findByRole('dialog', { name: 'Center placement' });
    await expect(dialog).toHaveTextContent('Center placement content');

    await userEvent.keyboard('{Escape}');
    await expect(screen.queryByRole('dialog')).toBeNull();
  },
};
