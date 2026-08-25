import { Card } from '@/shared/ui/Card';
import { expect, within, fireEvent, fn } from 'storybook/test';
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
          'conditional click behavior, escape dismiss, custom z-index, transition control, ' +
          'animation presets, scroll lock, and portal rendering.',
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
    onEscapeKeyDown: {
      action: 'escape',
      description: 'Called when Escape key is pressed. Fires before onKeyDown.',
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
    zIndex: {
      control: 'number',
      description: 'Custom z-index for the overlay',
    },
    transitionDuration: {
      control: 'number',
      description: 'Transition duration in seconds (default 0.2)',
    },
    unmountOnExit: {
      control: 'boolean',
      description: 'Unmount overlay DOM when visible=false',
    },
    animation: {
      control: 'select',
      options: ['fade', 'scale', 'slide'],
      description: 'CSS animation preset',
    },
    preventScroll: {
      control: 'boolean',
      description: 'Lock body scroll when overlay is visible',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = canvas.getByTestId('overlay');
    expect(overlay).toHaveAttribute('data-visible', 'true');
    expect(overlay).not.toHaveAttribute('data-blur');
    expect(overlay).not.toHaveAttribute('data-dark');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = canvas.getByTestId('overlay');
    expect(overlay).toHaveAttribute('data-blur');
    expect(overlay).not.toHaveAttribute('data-dark');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = canvas.getByTestId('overlay');
    expect(overlay).toHaveAttribute('data-dark');
    expect(overlay).not.toHaveAttribute('data-blur');
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
        story: 'Click handler attached. The overlay shows `cursor: pointer` via CSS class.',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = canvas.getByTestId('overlay');
    expect(overlay).toHaveAttribute('data-visible', 'false');
  },
};

/** Overlay with escape key dismiss (OVR-01). */
export const EscapeDismiss: Story = {
  args: {
    ...Default.args,
    onEscapeKeyDown: fn(),
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description: {
        story:
          'Press Escape to trigger `onEscapeKeyDown`. Fires before `onKeyDown`. ' +
          'Use for keyboard-accessible modal dismissal.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const overlay = canvas.getByTestId('overlay');
    overlay.focus();
    await fireEvent.keyDown(overlay, { key: 'Escape' });
    expect(args.onEscapeKeyDown).toHaveBeenCalledTimes(1);
  },
};

/** Overlay with custom z-index (OVR-02). */
export const CustomZIndex: Story = {
  args: {
    ...Default.args,
    zIndex: 2000,
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description: {
        story: 'Custom z-index of 2000 applied via inline style. Overrides the default 1000.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = canvas.getByTestId('overlay');
    expect(overlay.style.zIndex).toBe('2000');
  },
};

/** Overlay with custom transition duration (OVR-04). */
export const SlowTransition: Story = {
  args: {
    ...Default.args,
    transitionDuration: 0.8,
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description: {
        story:
          'Slow 0.8s fade transition. Toggle `visible` in the Canvas tab to see the effect. ' +
          'The `--overlay-duration` CSS variable controls the speed.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = canvas.getByTestId('overlay');
    expect(overlay.style.getPropertyValue('--overlay-duration')).toBe('0.8s');
  },
};

/** Overlay with scale animation preset (OVR-10). */
export const ScaleAnimation: Story = {
  args: {
    ...Default.args,
    animation: 'scale',
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description: {
        story:
          'Scale animation preset — overlay scales from 0.95 to 1.0 on enter. ' +
          'Uses `data-animation="scale"` attribute for CSS targeting.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = canvas.getByTestId('overlay');
    expect(overlay).toHaveAttribute('data-animation', 'scale');
  },
};

/** Overlay with slide animation preset (OVR-10). */
export const SlideAnimation: Story = {
  args: {
    ...Default.args,
    animation: 'slide',
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description: {
        story:
          'Slide animation preset — overlay slides from -10px to 0 on enter. ' +
          'Uses `data-animation="slide"` attribute for CSS targeting.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = canvas.getByTestId('overlay');
    expect(overlay).toHaveAttribute('data-animation', 'slide');
  },
};

/** Overlay with unmountOnExit (OVR-03). */
export const UnmountOnExit: Story = {
  args: {
    ...Default.args,
    unmountOnExit: true,
    visible: false,
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description: {
        story:
          'With `unmountOnExit`, the overlay DOM node is removed when `visible=false`. ' +
          'Toggle `visible` to see mount/unmount behavior.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByTestId('overlay')).not.toBeInTheDocument();
  },
};

/** Overlay with body scroll lock (OVR-08). */
export const ScrollLock: Story = {
  args: {
    ...Default.args,
    preventScroll: true,
  },
  render: OverlayContainer,
  parameters: {
    docs: {
      description:
        'Locks body scroll when overlay is visible (`document.body.style.overflow = hidden`). ' +
        'Restored when overlay closes.',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = canvas.getByTestId('overlay');
    expect(overlay).toHaveAttribute('data-visible', 'true');
  },
};
