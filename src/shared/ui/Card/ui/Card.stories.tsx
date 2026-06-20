import type { Meta, StoryObj } from '@storybook/react-vite';
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

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3>Default Card</h3>
        <p>This is a standard card component</p>
      </div>
    ),
    variant: 'default',
    size: 'default',
  },
};

export const Project: Story = {
  render: () => (
    <ProjectCard
      title="Dragonfly"
      description="Dragonfly — полностью вертикально интегрированная компания по производству каннабиса, управляющая продуктом от семени до продажи, первая медицинская каннабис-компания в Юте!"
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
        {
          name: 'Figma',
          url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
        },
      ]}
      link="https://dragonflyprocessing.com"
    />
  ),
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
        'Спроектировал систему обработки данных в реальном времени',
      ]}
      techStack={['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL', 'Redis']}
    />
  ),
};

export const Contact: Story = {
  render: () => (
    <ContactCard title="Контакты" icon={<Mail />}>
      <p>
        Я всегда открыт для обсуждения новых проектов, творческих идей или возможностей стать частью
        вашего видения.
      </p>
    </ContactCard>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <Card variant="default">
        <p>Default</p>
      </Card>
      <ProjectCard title="Project" description="Project description" techIcons={[]} />
      <WorkHistoryCard
        title="Work History"
        company="Company"
        achievements={['Achievement 1']}
        techStack={['React']}
      />
      <Card variant="skill">
        <p>Skill</p>
      </Card>
      <Card variant="about">
        <p>About</p>
      </Card>
      <ContactCard title="Contact" />
    </div>
  ),
};
