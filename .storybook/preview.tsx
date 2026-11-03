// .storybook/preview.tsx
import { ToastProvider } from '@/shared/lib/contexts/ToastContext';
import type { Preview } from '@storybook/react-vite';
import { I18nProvider } from '../src/app/providers/I18nProvider';
import { ThemeProvider } from '../src/app/providers/ThemeProvider';
import { loadRu } from '../src/shared/lib/i18n/config/i18n';
import '../src/app/styles/globals/index.scss';

// Lazy ru locale (issue #298): the app loads ru.json on demand, but every
// story must see it — play functions await i18n.changeLanguage('ru') and
// assert ru copy. Top-level await in the preview entry runs before any
// story renders (vite's browser targets support TLA), so the switch is
// instant and race-free.
await loadRu();

const withProviders = (Story: React.ComponentType, context: { globals: { theme?: string } }) => {
  const theme = context.globals?.theme || 'dark';

  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <div
            data-theme={theme}
            style={{
              background: 'var(--background)',
              color: 'var(--text-primary)',
              minHeight: '100vh',
              minWidth: '100vw',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ padding: '2rem' }}>
              <Story />
            </div>
          </div>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
    docs: {
      description: {
        component: 'Компоненты UI Kit для портфолио',
      },
    },
    backgrounds: {
      disable: true,
    },
    layout: 'centered',
  },
  decorators: [withProviders],
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
        ],
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
