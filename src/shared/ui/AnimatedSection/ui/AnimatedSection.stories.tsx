import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from '@storybook/test';
import { AnimatedSection } from './AnimatedSection';

const meta: Meta<typeof AnimatedSection> = {
  title: 'Shared/AnimatedSection',
  component: AnimatedSection,
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
  argTypes: {
    animation: {
      control: 'select',
      options: ['fadeIn', 'fadeUp', 'fadeDown', 'slideInLeft', 'slideInRight', 'scaleIn', 'none'],
      description: 'Animation type',
    },
    trigger: {
      control: 'select',
      options: ['onMount', 'onScroll', 'onHover', 'manual'],
      description: 'Animation trigger',
    },
    delay: {
      control: 'number',
      min: 0,
      max: 2000,
      step: 100,
      description: 'Delay before animation starts (ms)',
    },
    duration: {
      control: 'number',
      min: 100,
      max: 2000,
      step: 100,
      description: 'Animation duration (ms)',
    },
    threshold: {
      control: 'number',
      min: 0,
      max: 1,
      step: 0.1,
      description: 'Intersection threshold (0-1)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultContent = (
  <div
    style={{
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      color: 'white',
      textAlign: 'center',
    }}
  >
    <h3>Animated Content</h3>
    <p>This section will animate when triggered</p>
  </div>
);

// ============================================
// Animation Types
// ============================================

export const FadeUp: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeUp',
    trigger: 'onMount',
  },
  parameters: {
    docs: {
      description: {
        story: 'Fade in from bottom (default animation).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByTestId('animated-section');

    // Wait for animation to complete (700ms default duration)
    await waitFor(() => {
      expect(section).toHaveAttribute('data-state', 'visible');
    });
  },
};

export const FadeIn: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeIn',
    trigger: 'onMount',
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple fade in animation.',
      },
    },
  },
};

export const FadeDown: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeDown',
    trigger: 'onMount',
  },
  parameters: {
    docs: {
      description: {
        story: 'Fade in from top.',
      },
    },
  },
};

export const ScaleIn: Story = {
  args: {
    children: defaultContent,
    animation: 'scaleIn',
    trigger: 'onMount',
  },
  parameters: {
    docs: {
      description: {
        story: 'Scale in from small to normal size.',
      },
    },
  },
};

export const SlideInLeft: Story = {
  args: {
    children: defaultContent,
    animation: 'slideInLeft',
    trigger: 'onMount',
  },
  parameters: {
    docs: {
      description: {
        story: 'Slide in from left side.',
      },
    },
  },
};

export const SlideInRight: Story = {
  args: {
    children: defaultContent,
    animation: 'slideInRight',
    trigger: 'onMount',
  },
  parameters: {
    docs: {
      description: {
        story: 'Slide in from right side.',
      },
    },
  },
};

// ============================================
// Triggers
// ============================================

export const OnMount: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeUp',
    trigger: 'onMount',
  },
  parameters: {
    docs: {
      description: {
        story: 'Animates immediately when component mounts.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByTestId('animated-section');

    // Verify initial state is hidden
    expect(section).toHaveAttribute('data-state', 'hidden');

    // Wait for animation to complete
    await waitFor(() => {
      expect(section).toHaveAttribute('data-state', 'visible');
    });
  },
};

export const OnScroll: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeUp',
    trigger: 'onScroll',
    threshold: 0.1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Animates when scrolled into view. Scroll the page to trigger.',
      },
    },
  },
};

export const OnHover: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeUp',
    trigger: 'onHover',
  },
  parameters: {
    docs: {
      description: {
        story: 'Animates on mouse hover. Hover over the content to trigger.',
      },
    },
  },
};

export const Manual: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeUp',
    trigger: 'manual',
    animate: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Manual control via animate prop. Set animate={true} to trigger.',
      },
    },
  },
};

// ============================================
// Timing
// ============================================

export const WithDelay: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeUp',
    trigger: 'onMount',
    delay: 500,
  },
  parameters: {
    docs: {
      description: {
        story: 'Animates after 500ms delay.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByTestId('animated-section');

    // Initial state is hidden before delay elapses
    expect(section).toHaveAttribute('data-state', 'hidden');

    // Wait for delay (500ms) + animation duration (700ms)
    // Use increased timeout for the waitFor
    await waitFor(
      () => {
        expect(section).toHaveAttribute('data-state', 'visible');
      },
      { timeout: 2000 }
    );
  },
};

export const WithDuration: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeUp',
    trigger: 'onMount',
    duration: 1500,
  },
  parameters: {
    docs: {
      description: {
        story: 'Animates over 1500ms (slower animation).',
      },
    },
  },
};

export const WithDelayAndDuration: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeUp',
    trigger: 'onMount',
    delay: 300,
    duration: 1000,
  },
  parameters: {
    docs: {
      description: {
        story: 'Animates after 300ms delay over 1000ms duration.',
      },
    },
  },
};

// ============================================
// Compositions
// ============================================

export const AllAnimations: Story = {
  args: {
    trigger: 'onMount',
    delay: 0,
  },
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gap: '24px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      }}
    >
      <AnimatedSection {...args} animation="fadeIn">
        <div
          style={{ padding: '20px', background: '#667eea', borderRadius: '8px', color: 'white' }}
        >
          Fade In
        </div>
      </AnimatedSection>
      <AnimatedSection {...args} animation="fadeUp">
        <div
          style={{ padding: '20px', background: '#764ba2', borderRadius: '8px', color: 'white' }}
        >
          Fade Up
        </div>
      </AnimatedSection>
      <AnimatedSection {...args} animation="scaleIn">
        <div
          style={{ padding: '20px', background: '#f093fb', borderRadius: '8px', color: 'white' }}
        >
          Scale In
        </div>
      </AnimatedSection>
      <AnimatedSection {...args} animation="slideInLeft">
        <div
          style={{ padding: '20px', background: '#f5576c', borderRadius: '8px', color: 'white' }}
        >
          Slide Left
        </div>
      </AnimatedSection>
      <AnimatedSection {...args} animation="slideInRight">
        <div
          style={{ padding: '20px', background: '#4facfe', borderRadius: '8px', color: 'white' }}
        >
          Slide Right
        </div>
      </AnimatedSection>
      <AnimatedSection {...args} animation="fadeDown">
        <div
          style={{ padding: '20px', background: '#43e97b', borderRadius: '8px', color: 'white' }}
        >
          Fade Down
        </div>
      </AnimatedSection>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All 6 animation types displayed together.',
      },
    },
  },
};

export const AllTriggers: Story = {
  args: {
    animation: 'fadeUp',
  },
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gap: '24px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      }}
    >
      <AnimatedSection {...args} trigger="onMount">
        <div
          style={{ padding: '20px', background: '#667eea', borderRadius: '8px', color: 'white' }}
        >
          On Mount
        </div>
      </AnimatedSection>
      <AnimatedSection {...args} trigger="onScroll">
        <div
          style={{ padding: '20px', background: '#764ba2', borderRadius: '8px', color: 'white' }}
        >
          On Scroll
        </div>
      </AnimatedSection>
      <AnimatedSection {...args} trigger="onHover">
        <div
          style={{ padding: '20px', background: '#f093fb', borderRadius: '8px', color: 'white' }}
        >
          On Hover
        </div>
      </AnimatedSection>
      <AnimatedSection {...args} trigger="manual" animate={true}>
        <div
          style={{ padding: '20px', background: '#f5576c', borderRadius: '8px', color: 'white' }}
        >
          Manual
        </div>
      </AnimatedSection>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All 4 trigger types displayed together.',
      },
    },
  },
};

export const StaggeredAnimation: Story = {
  args: {
    animation: 'fadeUp',
    trigger: 'onMount',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AnimatedSection {...args} delay={0}>
        <div
          style={{ padding: '20px', background: '#667eea', borderRadius: '8px', color: 'white' }}
        >
          Item 1 (0ms)
        </div>
      </AnimatedSection>
      <AnimatedSection {...args} delay={150}>
        <div
          style={{ padding: '20px', background: '#764ba2', borderRadius: '8px', color: 'white' }}
        >
          Item 2 (150ms)
        </div>
      </AnimatedSection>
      <AnimatedSection {...args} delay={300}>
        <div
          style={{ padding: '20px', background: '#f093fb', borderRadius: '8px', color: 'white' }}
        >
          Item 3 (300ms)
        </div>
      </AnimatedSection>
      <AnimatedSection {...args} delay={450}>
        <div
          style={{ padding: '20px', background: '#f5576c', borderRadius: '8px', color: 'white' }}
        >
          Item 4 (450ms)
        </div>
      </AnimatedSection>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Staggered animations with increasing delays.',
      },
    },
  },
};
