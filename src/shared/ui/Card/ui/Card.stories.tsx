import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { CardImage } from './CardImage';
import { ProjectCard } from './ProjectCard';
import { WorkHistoryCard } from './WorkHistoryCard';
import { ContactCard } from './ContactCard';
import { Mail, Briefcase } from 'lucide-react';

const meta = {
  title: 'Shared/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Универсальный компонент карточки с поддержкой различных вариантов и composition API.

## Особенности
- **Composition API**: Card.Header, Card.Body, Card.Footer, Card.Image
- **Варианты**: default, project, workHistory, skill, about, codeBlock, contact
- **Размеры**: compact, default, large
- **Accessibility**: role="group", aria-* атрибуты
- **Hover эффекты**: настраиваемые

## Использование

\`\`\`tsx
// Базовое использование
<Card variant="default">Контент</Card>

// Composition API
<Card>
  <Card.Header withBorder>Заголовок</Card.Header>
  <Card.Body>Основной контент</Card.Body>
  <Card.Footer withBorder>Подвал</Card.Footer>
</Card>

// Специализированные карточки
<ProjectCard title="Project" description="Desc" techIcons={[]} />
<WorkHistoryCard title="Job" company="Company" achievements={[]} />
<ContactCard title="Контакты" icon={<Mail />} />
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'skill', 'about', 'codeBlock'],
    },
    size: {
      control: 'select',
      options: ['compact', 'default', 'large'],
    },
    radius: {
      control: 'select',
      options: ['rounded', 'roundedXl', 'rounded2xl'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Base Card Stories
// ============================================

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3>Default Card</h3>
        <p>This is a standard card component with default styling</p>
      </div>
    ),
    variant: 'default',
    size: 'default',
  },
};

export const Compact: Story = {
  args: {
    children: <p>Compact card with minimal padding</p>,
    size: 'compact',
  },
};

export const Large: Story = {
  args: {
    children: (
      <div>
        <h3>Large Card</h3>
        <p>Large card with extra padding for Hero and About sections</p>
      </div>
    ),
    size: 'large',
  },
};

export const WithRadius: Story = {
  args: {
    children: <p>Card with rounded corners</p>,
    radius: 'roundedXl',
  },
};

export const FullWidth: Story = {
  args: {
    children: <p>Full width card</p>,
    fullWidth: true,
  },
};

export const NotHoverable: Story = {
  args: {
    children: <p>Card without hover effects</p>,
    hoverable: false,
  },
};

// ============================================
// Composition API Stories
// ============================================

export const CompositionBasic: Story = {
  render: () => (
    <Card>
      <Card.Header>Header Content</Card.Header>
      <Card.Body>
        <p>Main content goes here. This is the body of the card.</p>
      </Card.Body>
      <Card.Footer>Footer Content</Card.Footer>
    </Card>
  ),
};

export const CompositionWithBorders: Story = {
  render: () => (
    <Card>
      <Card.Header withBorder>Header with Border</Card.Header>
      <Card.Body>
        <p>Body content with separated header and footer</p>
      </Card.Body>
      <Card.Footer withBorder>Footer with Border</Card.Footer>
    </Card>
  ),
};

export const CompositionWithImage: Story = {
  render: () => (
    <Card>
      <CardImage src="https://via.placeholder.com/400x200" alt="Card header image" />
      <Card.Header withBorder>Card with Image</Card.Header>
      <Card.Body>
        <p>This card includes an image at the top</p>
      </Card.Body>
    </Card>
  ),
};

export const CompositionComplex: Story = {
  render: () => (
    <Card>
      <CardImage src="https://via.placeholder.com/400x200" alt="Cover" />
      <Card.Header withBorder>
        <h3>Complex Card Layout</h3>
      </Card.Header>
      <Card.Body>
        <p>Multiple sections with proper spacing and borders</p>
        <ul>
          <li>Image at top</li>
          <li>Header with border</li>
          <li>Body content</li>
          <li>Footer with actions</li>
        </ul>
      </Card.Body>
      <Card.Footer withBorder>
        <button style={{ padding: '8px 16px' }}>Action</button>
      </Card.Footer>
    </Card>
  ),
};

// ============================================
// Specialized Card Stories
// ============================================

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
};

export const Skill: Story = {
  render: () => (
    <Card variant="skill">
      <h3>Technical Skills</h3>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
        {['React', 'TypeScript', 'Node.js', 'Python', 'AWS'].map((skill) => (
          <span
            key={skill}
            style={{
              padding: '8px 16px',
              background: 'rgb(244 179 119 / 0.1)',
              border: '1px solid rgb(244 179 119 / 0.3)',
              borderRadius: '9999px',
              color: '#f4b377',
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </Card>
  ),
};

export const About: Story = {
  render: () => (
    <Card variant="about">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Briefcase size={48} color="#f4b377" />
        <h3 style={{ marginTop: '16px' }}>About Me</h3>
        <p style={{ maxWidth: '400px', marginTop: '8px' }}>
          Passionate full-stack developer with 5+ years of experience building scalable web
          applications.
        </p>
      </div>
    </Card>
  ),
};

export const CodeBlock: Story = {
  render: () => (
    <Card variant="codeBlock">
      <pre style={{ margin: 0 }}>
        <code>{`const greet = (name: string) => {
  return \`Hello, \${name}!\`;
};

console.log(greet('World'));`}</code>
      </pre>
    </Card>
  ),
};

// ============================================
// All Variants Grid
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <Card variant="default">
        <p>Default</p>
      </Card>
      <Card variant="skill">
        <p>Skill</p>
      </Card>
      <Card variant="about">
        <p>About</p>
      </Card>
      <Card variant="codeBlock">
        <code>Code Block</code>
      </Card>
      <ProjectCard title="Project" description="Project description" techIcons={[]} />
      <ContactCard title="Contact" icon={<Mail />} />
    </div>
  ),
};

// ============================================
// Accessibility Story
// ============================================

export const Accessibility: Story = {
  render: () => (
    <Card aria-label="Example accessible card" aria-describedby="card-description">
      <Card.Header>Accessible Card</Card.Header>
      <Card.Body>
        <p id="card-description">
          This card demonstrates proper accessibility attributes including aria-label and
          aria-describedby.
        </p>
      </Card.Body>
      <Card.Footer>
        <button type="button" aria-label="Learn more">
          Learn More
        </button>
      </Card.Footer>
    </Card>
  ),
};

// ============================================
// Interaction Test Story
// ============================================

export const Interactive: Story = {
  render: () => (
    <Card>
      <Card.Header withBorder>Interactive Card</Card.Header>
      <Card.Body>
        <p>Click the button to see interaction</p>
        <button
          type="button"
          onClick={() => alert('Button clicked!')}
          style={{ padding: '8px 16px', marginTop: '16px' }}
        >
          Click Me
        </button>
      </Card.Body>
    </Card>
  ),
  parameters: {
    interaction: {
      type: 'click',
      element: 'button',
    },
  },
};
