// .storybook/preview.tsx
import { ToastProvider } from '@/shared/lib/contexts/ToastContext';
import type { Preview } from '@storybook/react-vite';
import { I18nProvider } from '../src/app/providers/I18nProvider';
import { ThemeProvider } from '../src/app/providers/ThemeProvider';
import '../src/shared/styles/globals/index.scss';

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
