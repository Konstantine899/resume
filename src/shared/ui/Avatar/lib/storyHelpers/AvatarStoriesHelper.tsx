/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Meta } from '@storybook/react-vite';
import type { ComponentType } from 'react';
import avatar1 from '../../ui/Avatar/assets/avatar003.jpg';

// ============================================
// Shared configuration
// ============================================

export const AVATAR_A11Y = {
  config: {
    rules: [
      { id: 'image-alt', enabled: true },
      { id: 'aria-allowed-attr', enabled: true },
    ],
  },
};

// ============================================
// Meta factory
// ============================================

export function createMeta(component: ComponentType<any>, title: string): Meta<any> {
  return {
    title,
    component,
    parameters: { layout: 'centered', a11y: AVATAR_A11Y },
    tags: ['autodocs'],
  };
}

// ============================================
// Story factories
// ============================================

type StoryFactory = Record<string, unknown>;

/** Avatar with fallback initials */
export function storyDefault(args?: Record<string, unknown>): StoryFactory {
  return {
    args: args ?? {},
    parameters: {
      docs: {
        description: { story: 'Avatar with fallback initials.' },
      },
    },
  };
}

/** Avatar with image source */
export function storyWithImage(args?: Record<string, unknown>): StoryFactory {
  return {
    args: { src: avatar1, showSkeleton: false, ...args },
    parameters: {
      docs: {
        description: { story: 'Avatar with image source and effects.' },
      },
    },
  };
}

/** All avatar sizes in a row */
export function storyAllSizes(
  Component: ComponentType<any>,
  sizes: string[],
  extraProps?: Record<string, unknown>
): StoryFactory {
  return {
    render: () => (
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {sizes.map((size) => (
          <Component key={size} size={size} alt={size.toUpperCase()} {...extraProps} />
        ))}
      </div>
    ),
    parameters: {
      docs: {
        description: { story: `All avatar sizes: ${sizes.join(', ')}.` },
      },
    },
  };
}

/** Avatar in loading state with skeleton */
export function storyLoading(args?: Record<string, unknown>): StoryFactory {
  return {
    args: { showSkeleton: true, forceLoading: true, ...args },
    parameters: {
      docs: {
        description: { story: 'Avatar with skeleton loading state while image is loading.' },
      },
    },
  };
}

/** Avatar without skeleton */
export function storyWithoutSkeleton(args?: Record<string, unknown>): StoryFactory {
  return {
    args: { showSkeleton: false, ...args },
    parameters: {
      docs: {
        description: {
          story: 'Avatar with skeleton disabled. Shows fallback immediately if no src.',
        },
      },
    },
  };
}

/** Avatar with invalid image URL (error state) */
export function storyError(args?: Record<string, unknown>): StoryFactory {
  return {
    args: { src: 'invalid-url.jpg', showSkeleton: false, ...args },
    parameters: {
      docs: {
        description: {
          story: 'Avatar with invalid image URL. Shows fallback after image fails to load.',
        },
      },
    },
  };
}

/** Avatar in light and dark themes */
export function storyThemeVariants(
  Component: ComponentType<any>,
  props?: Record<string, unknown>
): StoryFactory {
  return {
    render: () => (
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ padding: '16px', background: '#fff', borderRadius: '8px' }}>
          <p style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Light Theme</p>
          <Component alt="Konstantine" {...props} />
        </div>
        <div style={{ padding: '16px', background: '#1a1a1a', borderRadius: '8px' }}>
          <p style={{ marginBottom: '8px', fontSize: '14px', color: '#999' }}>Dark Theme</p>
          <Component alt="Konstantine" {...props} />
        </div>
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Avatar in light and dark themes. Effects adapt using CSS variables.',
        },
      },
    },
  };
}

/** Avatar states: loading, error, loaded */
export function storyGradientStates(
  Component: ComponentType<any>,
  extraProps?: Record<string, unknown>
): StoryFactory {
  return {
    render: () => (
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Component alt="Loading" forceLoading={true} showSkeleton={true} {...extraProps} />
        <Component alt="Error" src="invalid.jpg" showSkeleton={false} {...extraProps} />
        <Component alt="Loaded" src={avatar1} showSkeleton={false} {...extraProps} />
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Avatar in all states: loading (skeleton), error (fallback), loaded (image).',
        },
      },
    },
  };
}

/** Responsive sizes with labels */
export function storyResponsiveSizes(
  Component: ComponentType<any>,
  sizes: Array<{ size: string; label: string }>,
  extraProps?: Record<string, unknown>
): StoryFactory {
  return {
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sizes.map(({ size, label }) => (
          <div key={size} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Component alt={size.toUpperCase()} {...extraProps} size={size} />
            <span style={{ fontSize: '14px', color: '#666' }}>{label}</span>
          </div>
        ))}
      </div>
    ),
    parameters: {
      docs: {
        description: { story: 'Responsive sizes with labels.' },
      },
    },
  };
}

// ============================================
// Component-specific factories
// ============================================

/** AvatarHero: without glow and ring */
export function storyHeroWithoutEffects(Component: ComponentType<any>): StoryFactory {
  return {
    render: () => (
      <Component alt="Hero without Effects" size="xl" showGlow={false} showRing={false} />
    ),
    parameters: {
      docs: {
        description: {
          story: 'AvatarHero without glow and ring effects (minimal variant).',
        },
      },
    },
  };
}

/** AvatarHero: effects comparison grid */
export function storyHeroEffectsComparison(
  Component: ComponentType<any>,
  src?: string
): StoryFactory {
  const renderCell = (alt: string, glow: boolean, ring: boolean, label: string) => (
    <div style={{ textAlign: 'center' }}>
      <Component alt={alt} size="lg" showGlow={glow} showRing={ring} {...(src ? { src } : {})} />
      <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>{label}</p>
    </div>
  );

  return {
    render: () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {renderCell('No Effects', false, false, 'No Effects')}
        {renderCell('Glow Only', true, false, 'Glow Only')}
        {renderCell('Ring Only', false, true, 'Ring Only')}
        {renderCell('Both Effects', true, true, 'Both Effects')}
      </div>
    ),
    parameters: {
      docs: {
        description: {
          story: 'Effects comparison: no effects, glow only, ring only, both effects.',
        },
      },
    },
  };
}

/** AvatarAbout: single initial */
export function storyAboutSingleInitial(args?: Record<string, unknown>): StoryFactory {
  return {
    args: { maxInitials: 1, ...args },
    parameters: {
      docs: {
        description: { story: 'AvatarAbout with single initial (maxInitials=1).' },
      },
    },
  };
}
