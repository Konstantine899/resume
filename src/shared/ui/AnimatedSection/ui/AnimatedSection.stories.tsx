// src/shared/ui/AnimatedSection/AnimatedSection.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AnimatedSection } from './AnimatedSection';

const meta = {
  title: 'Shared/UI/AnimatedSection',
  component: AnimatedSection,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    animation: {
      control: 'select',
      options: ['fadeIn', 'fadeUp', 'fadeDown', 'slideInLeft', 'slideInRight', 'scaleIn', 'none'],
    },
    trigger: {
      control: 'select',
      options: ['onMount', 'onScroll', 'onHover', 'manual'],
    },
    delay: {
      control: 'number',
      min: 0,
      max: 2000,
      step: 100,
    },
    duration: {
      control: 'number',
      min: 100,
      max: 2000,
      step: 100,
    },
  },
} satisfies Meta<typeof AnimatedSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultContent = (
  <div style={{ padding: '40px', background: '#f0f0f0' }}>Animated Content</div>
);

export const FadeUp: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeUp',
    trigger: 'onMount',
  },
};

export const FadeIn: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeIn',
    trigger: 'onMount',
  },
};

export const ScaleIn: Story = {
  args: {
    children: defaultContent,
    animation: 'scaleIn',
    trigger: 'onMount',
  },
};

export const SlideInLeft: Story = {
  args: {
    children: defaultContent,
    animation: 'slideInLeft',
    trigger: 'onMount',
  },
};

export const WithDelay: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeUp',
    trigger: 'onMount',
    delay: 500,
  },
};

export const ManualTrigger: Story = {
  args: {
    children: defaultContent,
    animation: 'fadeUp',
    trigger: 'manual',
  },
  render: (args) => {
    const [animate, setAnimate] = useState(false);

    return (
      <div>
        <button onClick={() => setAnimate(!animate)} style={{ marginBottom: '16px' }}>
          {animate ? 'Reset' : 'Trigger Animation'}
        </button>
        <AnimatedSection {...args} animate={animate}>
          {args.children}
        </AnimatedSection>
      </div>
    );
  },
};

export const AllAnimations: Story = {
  args: {
    children: defaultContent,
    trigger: 'onMount',
  },
  render: (args) => (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <AnimatedSection {...args} animation="fadeIn">
        <div style={{ padding: '20px', background: '#e0e0e0' }}>Fade In</div>
      </AnimatedSection>
      <AnimatedSection {...args} animation="fadeUp">
        <div style={{ padding: '20px', background: '#e0e0e0' }}>Fade Up</div>
      </AnimatedSection>
      <AnimatedSection {...args} animation="scaleIn">
        <div style={{ padding: '20px', background: '#e0e0e0' }}>Scale In</div>
      </AnimatedSection>
      <AnimatedSection {...args} animation="slideInLeft">
        <div style={{ padding: '20px', background: '#e0e0e0' }}>Slide Left</div>
      </AnimatedSection>
    </div>
  ),
};
