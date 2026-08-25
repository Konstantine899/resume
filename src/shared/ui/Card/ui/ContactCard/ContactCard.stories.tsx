import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Mail } from 'lucide-react';
import { ContactCard } from './ContactCard';

const meta = {
  title: 'Shared/Card/ContactCard',
  component: ContactCard,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Contact title' },
    children: { control: 'text', description: 'Contact content' },
    className: { control: 'text', description: 'Additional CSS class' },
  },
} satisfies Meta<typeof ContactCard>;

export default meta;
type Story = StoryObj<typeof ContactCard>;

export const Default: Story = {
  args: {
    title: 'Contact Me',
    icon: <Mail size={40} />,
    children: 'I\u2019m always open to discussing new projects, creative ideas, or opportunities.',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Contact Me')).toBeInTheDocument();
    expect(canvas.getByText(/always open/i)).toBeInTheDocument();
    const iconWrapper = canvasElement.querySelector('[class*="iconWrapper"]');
    expect(iconWrapper).toBeInTheDocument();
  },
};
