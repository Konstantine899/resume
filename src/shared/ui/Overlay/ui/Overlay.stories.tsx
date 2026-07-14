import { Card } from '@/shared/ui/Card';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Overlay } from './Overlay';

const meta = {
  title: 'Shared/Overlay',
  component: Overlay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Background scrim (overlay/backdrop). Used with modals, popovers, and dropdowns. ' +
          'Supports blur and dark variants, fade-in/out animation via the `visible` prop, ' +
          'and conditional click behavior.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'Content rendered above the scrim (e.g. modal panel)',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler. Overlay gets `cursor: pointer` only when set.',
    },
    onKeyDown: {
      action: 'keydown',
      description: 'Keyboard event handler forwarded to the overlay div.',
    },
    blur: {
      control: 'boolean',
      description: 'Apply backdrop-filter blur(4px)',
    },
    dark: {
      control: 'boolean',
      description: 'Darker scrim (80% opacity instead of 60%)',
    },
    visible: {
      control: 'boolean',
      description: 'Controls visibility with CSS opacity transition. Default `true`.',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class',
    },
  },
} satisfies Meta<typeof Overlay>;

export default meta;
type Story = StoryObj<typeof meta>;

function CardContent() {
  return (
    <Card
      style={{
        padding: '2rem',
        maxWidth: '400px',
        width: '90%',
        animation: 'scaleIn 0.3s ease-out',
      }}
    >
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--foreground)' }}>Content above overlay</h3>
      <p style={{ margin: 0, color: 'var(--foreground-muted)' }}>Click the overlay to close</p>
    </Card>
  );
}

function OverlayContainer(args: object) {
  return (
    <div style={{ position: 'relative', minHeight: '400px' }}>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--foreground)', marginBottom: '1rem' }}>Page content</h2>
        <p style={{ color: 'var(--foreground-muted)' }}>This content is dimmed by the overlay</p>
      </div>

      <Overlay {...args} />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
        }}
      >
        {(args as { children?: React.ReactNode }).children}
      </div>
    </div>
  );
}

/** Default overlay with 60% black scrim. */
export const Default: Story = {
  args: {
    children: <CardContent />,
    blur: false,
    dark: false,
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description: {
        story: 'Base overlay with 60% black scrim. No blur, no dark variant.',
      },
    },
  },
};

/** Overlay with backdrop-filter blur. */
export const WithBlur: Story = {
  args: {
    ...Default.args,
    blur: true,
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description: {
        story: 'Overlay with backdrop-filter blur(4px) on the scrim.',
      },
    },
  },
};

/** Darker overlay variant (80% scrim). */
export const DarkOverlay: Story = {
  args: {
    ...Default.args,
    dark: true,
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description: {
        story: 'Darker overlay variant with 80% black scrim.',
      },
    },
  },
};

/** Overlay with click-to-close handler. */
export const Clickable: Story = {
  args: {
    ...Default.args,
    onClick: () => alert('Overlay clicked! Close modal'),
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description: {
        story: 'Click handler attached. The overlay shows `cursor: pointer`.',
      },
    },
  },
};

/** Overlay with visible=false (hidden state, opacity 0). */
export const Hidden: Story = {
  args: {
    ...Default.args,
    visible: false,
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description: {
        story:
          'Overlay with `visible={false}` — opacity is 0 via CSS transition. ' +
          'Toggle the `visible` control in the Canvas tab to see the fade animation.',
      },
    },
  },
};
