import type { Meta, StoryObj } from '@storybook/react-vite';
import avatar1 from '../Avatar/assets/avatar003.jpg';
import { AvatarAbout } from './AvatarAbout';

const meta: Meta<typeof AvatarAbout> = {
  title: 'Shared/Avatar/About',
  component: AvatarAbout,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          { id: 'image-alt', enabled: true },
          { id: 'aria-allowed-attr', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Image URL',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for accessibility and initials',
      table: {
        defaultValue: { summary: 'Required' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Avatar size',
      table: {
        defaultValue: { summary: "'lg'" },
      },
    },
    maxInitials: {
      control: 'number',
      description: 'Maximum number of initials to display',
      table: {
        defaultValue: { summary: '2' },
      },
    },
    showSkeleton: {
      control: 'boolean',
      description: 'Show skeleton loading state',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarAbout>;

export const Default: Story = {
  args: {
    alt: 'Avatar',
    size: 'lg',
    maxInitials: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default AvatarAbout with fallback initials.',
      },
    },
  },
};

export const WithImage: Story = {
  args: {
    src: avatar1,
    alt: 'User Avatar',
    size: 'lg',
    maxInitials: 2,
    showSkeleton: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'AvatarAbout with image source and gradient border.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-lg, 24px)', alignItems: 'center' }}>
      <AvatarAbout alt="SM" size="sm" maxInitials={2} />
      <AvatarAbout alt="MD" size="md" maxInitials={2} />
      <AvatarAbout alt="LG" size="lg" maxInitials={2} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All AvatarAbout sizes: sm (100px), md (200px), lg (300px).',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    alt: 'Loading...',
    size: 'lg',
    maxInitials: 2,
    showSkeleton: true,
    forceLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'AvatarAbout with skeleton loading state. Shows ripple animation while image is loading.',
      },
    },
  },
};

export const WithoutSkeleton: Story = {
  args: {
    alt: 'No Skeleton',
    size: 'lg',
    maxInitials: 2,
    showSkeleton: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'AvatarAbout with skeleton disabled. Shows fallback immediately if no src.',
      },
    },
  },
};

export const Error: Story = {
  args: {
    src: 'invalid-url.jpg',
    alt: 'Error State',
    size: 'lg',
    maxInitials: 2,
    showSkeleton: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'AvatarAbout with invalid image URL. Shows fallback (initials) after image fails to load.',
      },
    },
  },
};

export const SingleInitial: Story = {
  args: {
    alt: 'Konstantin',
    size: 'lg',
    maxInitials: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'AvatarAbout with single initial (maxInitials=1).',
      },
    },
  },
};

export const ThemeVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-lg, 24px)', alignItems: 'center' }}>
      <div style={{ padding: '16px', background: '#fff', borderRadius: '8px' }}>
        <p style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Light Theme</p>
        <AvatarAbout alt="Konstantine" size="lg" src={avatar1} />
      </div>
      <div style={{ padding: '16px', background: '#1a1a1a', borderRadius: '8px' }}>
        <p style={{ marginBottom: '8px', fontSize: '14px', color: '#999' }}>Dark Theme</p>
        <AvatarAbout alt="Konstantine" size="lg" src={avatar1} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'AvatarAbout in light and dark themes with CSS variables (--card-bg, --foreground).',
      },
    },
  },
};

export const WithGradientBorder: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-lg, 24px)', alignItems: 'center' }}>
      <AvatarAbout alt="Loading State" size="lg" forceLoading showSkeleton />
      <AvatarAbout alt="Error State" size="lg" src="invalid.jpg" showSkeleton={false} />
      <AvatarAbout alt="Image Loaded" size="lg" src={avatar1} showSkeleton={false} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'AvatarAbout with gradient border visible in all states (loading, error, loaded). Uses avatar-circle mixin.',
      },
    },
  },
};

export const ResponsiveSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <AvatarAbout alt="SM" size="sm" />
        <span style={{ fontSize: '14px', color: '#666' }}>sm — 100px (3rem)</span>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <AvatarAbout alt="MD" size="md" />
        <span style={{ fontSize: '14px', color: '#666' }}>md — 200px (5rem)</span>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <AvatarAbout alt="LG" size="lg" />
        <span style={{ fontSize: '14px', color: '#666' }}>lg — 300px (8rem)</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'AvatarAbout responsive sizes with labels. Proportional padding: sm=2px, md=4px, lg=6px.',
      },
    },
  },
};
