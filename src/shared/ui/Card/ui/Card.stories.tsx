// src/shared/ui/Card/Card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'Shared/UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'project', 'workHistory', 'skill', 'about', 'codeBlock'],
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
  args: {
    children: (
      <div>
        <h3>Project Card</h3>
        <p>Portfolio project with gradient overlay</p>
      </div>
    ),
    variant: 'project',
    backgroundImage: 'https://via.placeholder.com/400x300',
  },
};

export const WorkHistory: Story = {
  args: {
    children: (
      <div>
        <h3>Senior Developer</h3>
        <p>Company Name • 2020-2024</p>
        <ul>
          <li>Developed features</li>
          <li>Led team</li>
        </ul>
      </div>
    ),
    variant: 'workHistory',
  },
};

export const AllVariants: Story = {
  args: {
    children: <p>Card Variant</p>,
  },
  render: () => (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <Card variant="default">
        <p>Default</p>
      </Card>
      <Card variant="project">
        <p>Project</p>
      </Card>
      <Card variant="workHistory">
        <p>Work History</p>
      </Card>
      <Card variant="skill">
        <p>Skill</p>
      </Card>
      <Card variant="about">
        <p>About</p>
      </Card>
      <Card variant="codeBlock">
        <p>Code Block</p>
      </Card>
    </div>
  ),
};
