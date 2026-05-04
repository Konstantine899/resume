import type { Preview } from '@storybook/react-vite';
import { I18nProvider } from '../src/app/providers/I18nProvider';
import { ThemeProvider } from '../src/app/providers/ThemeProvider';
import { ToastProvider } from '../src/app/providers/ToastProvider';
import '../src/shared/styles/globals/index.scss';

// Декоратор для переключения темы
const withProviders = (Story: any, context: any) => {
  const theme = context.globals.theme || 'dark';

  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <div data-theme={theme} style={{ padding: '2rem' }}>
            <Story />
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
      test: 'todo',
    },
    backgrounds: {
      disable: true,
    },
  },
  decorators: [withProviders],
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
      },
    },
  },
};

export default preview;
