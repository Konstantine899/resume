import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarAbout } from './AvatarAbout';

const meta: Meta<typeof AvatarAbout> = {
  title: 'Shared/UI/Avatar/About',
  component: AvatarAbout,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'URL изображения',
    },
    alt: {
      control: 'text',
      description: 'Альтернативный текст (для инициалов)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Размер аватара',
    },
    maxInitials: {
      control: 'number',
      description: 'Максимальное количество инициалов',
    },
    className: {
      control: 'text',
      description: 'Дополнительные CSS классы',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarAbout>;

export const Default: Story = {
  args: {
    alt: 'Konstantin Atroshchenko',
    size: 'lg',
    maxInitials: 2,
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'User Avatar',
    size: 'lg',
    maxInitials: 2,
  },
};

export const Small: Story = {
  args: {
    alt: 'KA',
    size: 'sm',
    maxInitials: 2,
  },
};

export const Medium: Story = {
  args: {
    alt: 'KA',
    size: 'md',
    maxInitials: 2,
  },
};

export const Large: Story = {
  args: {
    alt: 'Konstantin Atroshchenko',
    size: 'lg',
    maxInitials: 2,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <AvatarAbout alt="SM" size="sm" maxInitials={2} />
      <AvatarAbout alt="MD" size="md" maxInitials={2} />
      <AvatarAbout alt="LG" size="lg" maxInitials={2} />
    </div>
  ),
};

export const SingleInitial: Story = {
  args: {
    alt: 'Konstantin',
    size: 'lg',
    maxInitials: 1,
  },
};

export const WithFallback: Story = {
  args: {
    src: 'invalid-url.jpg',
    alt: 'Konstantin Atroshchenko',
    size: 'lg',
    maxInitials: 2,
  },
};
