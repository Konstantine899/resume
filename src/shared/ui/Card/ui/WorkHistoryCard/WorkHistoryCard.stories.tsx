import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { WorkHistoryCard } from './WorkHistoryCard';

const meta = {
  title: 'Shared/Card/WorkHistoryCard',
  component: WorkHistoryCard,
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
    title: { control: 'text', description: 'Job title' },
    company: { control: 'text', description: 'Company name' },
    period: { control: 'text', description: 'Work period' },
    periodBadge: { control: 'text', description: 'Badge text (e.g. Current)' },
    location: { control: 'text', description: 'Work location' },
  },
} satisfies Meta<typeof WorkHistoryCard>;

export default meta;
type Story = StoryObj<typeof WorkHistoryCard>;

export const Default: Story = {
  args: {
    title: 'Senior Full-Stack Developer',
    company: 'Tech Corp International',
    period: '2022 — Present',
    periodBadge: 'Current',
    location: 'Remote',
    achievements: [
      'Led development of microservice architecture for 1M+ users',
      'Mentored a team of 5 junior developers',
      'Implemented CI/CD pipelines reducing deployment time by 60%',
    ],
    techStack: ['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL'],
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Senior Full-Stack Developer')).toBeInTheDocument();
    expect(canvas.getByText('Tech Corp International')).toBeInTheDocument();
    expect(canvas.getByText('2022 — Present')).toBeInTheDocument();
    expect(canvas.getByText('Current')).toBeInTheDocument();
    expect(canvas.getByText('Remote')).toBeInTheDocument();
    expect(canvas.getByText(/microservice architecture/i)).toBeInTheDocument();
    expect(canvas.getByText('React')).toBeInTheDocument();
    expect(canvas.getByText('PostgreSQL')).toBeInTheDocument();
    const badges = canvasElement.querySelectorAll('[class*="techBadge"]');
    expect(badges).toHaveLength(5);
  },
};

export const MultipleAchievements: Story = {
  args: {
    title: 'Full-Stack Engineer',
    company: 'Product Company',
    period: '2019 — 2022',
    achievements: [
      'Scaled backend to handle 10x traffic growth',
      'Introduced automated testing cutting regressions by 40%',
      'Shipped 20+ features end-to-end',
      'Led migration from monolith to microservices',
      'Hired and onboarded 3 engineers',
    ],
    techStack: ['Go', 'PostgreSQL', 'Kubernetes'],
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Full-Stack Engineer')).toBeInTheDocument();
    const listItems = canvasElement.querySelectorAll('[class*="achievements"] li');
    expect(listItems).toHaveLength(5);
    expect(canvas.getByText(/10x traffic/i)).toBeInTheDocument();
  },
};
