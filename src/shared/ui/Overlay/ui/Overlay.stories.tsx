// src/shared/ui/Overlay/ui/Overlay.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Overlay } from './Overlay';

const meta = {
  title: 'Shared/Overlay',
  component: Overlay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    visible: {
      control: 'boolean',
      description: 'Visibility through the opacity transition',
    },
    blur: {
      control: 'boolean',
      description: 'backdrop-filter: blur(4px)',
    },
    dark: {
      control: 'boolean',
      description: 'Darker scrim (rgba 0.8 instead of 0.6)',
    },
    animation: {
      control: 'select',
      options: ['fade', 'scale', 'slide'],
      description: 'Animation preset (data-animation)',
    },
    unmountOnExit: {
      control: 'boolean',
      description: 'Unmount the node when hidden instead of fading it out',
    },
    preventScroll: {
      control: 'boolean',
      description: 'Lock body scroll while visible',
    },
  },
} satisfies Meta<typeof Overlay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default visible state: a full-viewport scrim. Childless it renders as
 * `role="presentation"` + `aria-hidden="true"` — nothing to expose and
 * nothing focusable inside.
 */
export const Default: Story = {};

/**
 * Hidden state: opacity 0 with `data-visible="false"`. The node stays
 * mounted — `unmountOnExit` defaults to false.
 */
export const Closed: Story = {
  args: { visible: false },
};
