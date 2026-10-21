import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import portraitSrc from '@/shared/assets/Firefly_RemoveBackground.webp';
import { Avatar } from './Avatar';
import { createMeta } from './Avatar.storiesHelper';

const meta: Meta<typeof Avatar> = {
  // NOTE: the `title` must ALSO be a literal here — the SB10 indexer parses
  // stories files statically and falls back to file-path autotitle when it
  // cannot read the title out of the meta (spread-only titles are ignored).
  ...createMeta(Avatar, 'Shared/Avatar/Avatar'),
  title: 'Shared/Avatar/Avatar',
  argTypes: {
    src: { control: 'text', description: 'Image URL' },
    alt: {
      control: 'text',
      description: 'Alternative text for accessibility and initials ("" = decorative portrait)',
      table: { defaultValue: { summary: "'Avatar placeholder'" } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Avatar size (skipped for the fill-container portrait variant)',
      table: { defaultValue: { summary: "'md'" } },
    },
    variant: {
      control: 'select',
      options: ['circle', 'square', 'portrait'],
      description:
        'Avatar shape. `portrait` is chrome-less fill-container for cut-out portraits ' +
        '(transparent/contain, no border-radius, no size mixin — the layout class owns the box)',
      table: { defaultValue: { summary: "'circle'" } },
    },
    showSkeleton: {
      control: 'boolean',
      description: 'Show skeleton loading state',
      table: { defaultValue: { summary: 'true' } },
    },
    className: { control: 'text', description: 'Additional CSS classes' },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: { alt: 'Konstantine', variant: 'circle' },
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[role="img"]');
    expect(avatar?.getAttribute('data-variant')).toBe('circle');
    expect(avatar?.getAttribute('aria-label')).toBe('Konstantine');
    // Fallback initials render when there is no src.
    expect(canvasElement.textContent).toContain('K');
  },
};

/**
 * D14 portrait variant — the same rendering the About vitrina uses: transparent
 * container, object-fit contain, fill-container. The consumer owns the box
 * (vitrina passes its layout className); this story reproduces that sizing
 * with an inline-style wrapper.
 */
export const Portrait: Story = {
  render: () => (
    <div style={{ width: '320px', aspectRatio: '3 / 4' }}>
      <Avatar
        variant="portrait"
        src={portraitSrc}
        alt=""
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[data-variant="portrait"]');
    expect(avatar).not.toBeNull();
    // D14 mapping: the inner Image stays transparent/contain/full.
    const image = canvasElement.querySelector('figure[data-variant="transparent"]');
    expect(image).not.toBeNull();
    expect(image?.className ?? '').toContain('objectFitContain');
    expect(image?.className ?? '').toContain('sizeFull');
    // Decorative portrait: empty alt, no fixed inline px size on the image box.
    const img = avatar?.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('');
    expect(image instanceof HTMLElement ? image.style.width : '').toBeFalsy();
  },
};
