import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { Card } from './Card';
import { ProjectCard } from './ProjectCard';
import { WorkHistoryCard } from './WorkHistoryCard';
import { ContactCard } from './ContactCard';
import { Mail } from 'lucide-react';

const meta = {
  title: 'Shared/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Project: Story = {
  render: () => (
    <ProjectCard
      title="Dragonfly"
      description="Dragonfly — полностью вертикально интегрированная компания по производству каннабиса"
      backgroundImage="https://via.placeholder.com/600x400"
      techIcons={[
        {
          name: 'React',
          url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        },
        {
          name: 'Next.js',
          url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
        },
        {
          name: 'Tailwind',
          url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
        },
      ]}
      link="https://dragonflyprocessing.com"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Dragonfly')).toBeInTheDocument();
    expect(canvas.getByText(/полностью вертикально/i)).toBeInTheDocument();
    const link = canvas.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://dragonflyprocessing.com');
    expect(link).toHaveAttribute('target', '_blank');
  },
};

export const WorkHistory: Story = {
  render: () => (
    <WorkHistoryCard
      title="Senior Full-Stack Developer"
      company="Tech Corp International"
      period="2022 — Present"
      periodBadge="Настоящее время"
      location="Remote"
      achievements={[
        'Руководил разработкой микросервисной архитектуры для 1M+ пользователей',
        'Наставлял команду из 5 junior разработчиков',
        'Внедрил CI/CD пайплайны, сократив время деплоя на 60%',
      ]}
      techStack={['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL']}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Senior Full-Stack Developer')).toBeInTheDocument();
    expect(canvas.getByText('Tech Corp International')).toBeInTheDocument();
    expect(canvas.getByText('Настоящее время')).toBeInTheDocument();
    expect(canvas.getByText('React')).toBeInTheDocument();
    expect(canvas.getByText('Node.js')).toBeInTheDocument();
    expect(canvas.getByText(/микросервисной/i)).toBeInTheDocument();
  },
};

export const Contact: Story = {
  render: () => (
    <ContactCard title="Контакты" icon={<Mail size={40} />}>
      <p>
        Я всегда открыт для обсуждения новых проектов, творческих идей или возможностей стать частью
        вашего видения.
      </p>
    </ContactCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Контакты')).toBeInTheDocument();
    expect(canvas.getByText(/всегда открыт/i)).toBeInTheDocument();
  },
};
