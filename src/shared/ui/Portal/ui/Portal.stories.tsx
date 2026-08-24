import { expect, waitFor } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Portal } from './Portal';

const meta = {
  title: 'Shared/Portal',
  component: Portal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Teleports children into a DOM node outside the parent hierarchy (default: `document.body`). ' +
          'Accepts an optional `element` prop for a custom container.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'Content to teleport into the target container.',
    },
    element: {
      control: false,
      description: 'Target DOM element. Defaults to `document.body`.',
    },
  },
} satisfies Meta<typeof Portal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Renders children in `document.body` by default. */
export const Default: Story = {
  args: {
    children: (
      <div
        style={{
          padding: '1rem',
          background: 'var(--bg-color, #f0f0f0)',
          borderRadius: '8px',
          maxWidth: '300px',
        }}
      >
        <p style={{ margin: 0, color: 'var(--foreground, #333)' }}>
          This content is rendered in <code>document.body</code> via Portal.
        </p>
      </div>
    ),
  },
  play: async () => {
    await waitFor(() => {
      expect(document.body.textContent).toContain('rendered in');
    });
    expect(document.body.textContent).toContain('document.body');
  },
};

/** Renders children inside a custom DOM element. */
export const CustomElement: Story = {
  args: {
    children: (
      <div
        style={{
          padding: '1rem',
          background: 'var(--accent-color, #007bff)',
          color: '#fff',
          borderRadius: '8px',
          maxWidth: '300px',
        }}
      >
        <p style={{ margin: 0 }}>This content is rendered in a custom container element.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'In a real scenario, create a div, append it to the DOM, ' +
          'and pass it as `element`. The children will render inside that div.',
      },
    },
  },
  play: async () => {
    await waitFor(() => {
      expect(document.body.textContent).toContain('custom container element');
    });
  },
};
