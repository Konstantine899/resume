import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarHero } from './AvatarHero';

const meta: Meta<typeof AvatarHero> = {
  title: 'Shared/UI/Avatar/Hero',
  component: AvatarHero,
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
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Размер аватара',
    },
    showGlow: {
      control: 'boolean',
      description: 'Показать пульсирующее свечение',
    },
    showRing: {
      control: 'boolean',
      description: 'Показать декоративное кольцо',
    },
    className: {
      control: 'text',
      description: 'Дополнительные CSS классы',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarHero>;

export const Default: Story = {
  args: {
    alt: 'Konstantin Atroshchenko',
    size: 'xl',
    showGlow: true,
    showRing: true,
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'Hero Avatar',
    size: 'xl',
    showGlow: true,
    showRing: true,
  },
};

export const WithGlowOnly: Story = {
  args: {
    alt: 'Hero with Glow',
    size: 'xl',
    showGlow: true,
    showRing: false,
  },
};

export const WithRingOnly: Story = {
  args: {
    alt: 'Hero with Ring',
    size: 'xl',
    showGlow: false,
    showRing: true,
  },
};

export const WithoutEffects: Story = {
  args: {
    alt: 'Hero without Effects',
    size: 'xl',
    showGlow: false,
    showRing: false,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <AvatarHero alt="SM" size="sm" showGlow showRing />
      <AvatarHero alt="MD" size="md" showGlow showRing />
      <AvatarHero alt="LG" size="lg" showGlow showRing />
      <AvatarHero alt="XL" size="xl" showGlow showRing />
    </div>
  ),
};

export const AllSizesWithImages: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <AvatarHero src="https://i.pravatar.cc/150?img=1" alt="SM" size="sm" showGlow showRing />
      <AvatarHero src="https://i.pravatar.cc/150?img=2" alt="MD" size="md" showGlow showRing />
      <AvatarHero src="https://i.pravatar.cc/150?img=3" alt="LG" size="lg" showGlow showRing />
      <AvatarHero src="https://i.pravatar.cc/150?img=4" alt="XL" size="xl" showGlow showRing />
    </div>
  ),
};
