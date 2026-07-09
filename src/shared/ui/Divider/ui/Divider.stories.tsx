// src/shared/ui/Divider/ui/Divider.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { Divider } from './Divider';

const meta = {
  title: 'Shared/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Divider** — компонент для визуального разделения контента.

## Варианты использования:

- **horizontal** — горизонтальный разделитель (по умолчанию)
- **vertical** — вертикальный разделитель

## Стили линий:

- **solid** — сплошная линия
- **dashed** — пунктирная линия
- **dotted** — точечная линия

## Accessibility:

- \`role="separator"\` — объявляет элемент как разделитель
- \`aria-orientation\` — указывает ориентацию (horizontal/vertical)

## Примеры:

\`\`\`tsx
<Divider />
<Divider orientation="vertical" />
<Divider variant="dashed" thickness={2} />
\`\`\`
        `,
      },
    },
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Ориентация разделителя',
    },
    variant: {
      control: 'radio',
      options: ['solid', 'dashed', 'dotted'],
      description: 'Стиль линии',
    },
    thickness: {
      control: 'range',
      min: 1,
      max: 10,
      step: 1,
      description: 'Толщина линии (px)',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Полная ширина (для horizontal)',
    },
    fullHeight: {
      control: 'boolean',
      description: 'Полная высота (для vertical)',
    },
  },
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    thickness: 1,
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Helper Components
// ============================================

const Container = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: '20px',
      backgroundColor: 'var(--background)',
      borderRadius: '8px',
    }}
  >
    {children}
  </div>
);

const HorizontalContainer = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{children}</div>
);

const VerticalContainer = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '100px' }}>
    {children}
  </div>
);

// ============================================
// Basic Variants
// ============================================

export const Solid: Story = {
  render: () => (
    <Container>
      <Divider variant="solid" />
    </Container>
  ),
};

export const Dashed: Story = {
  render: () => (
    <Container>
      <Divider variant="dashed" />
    </Container>
  ),
};

export const Dotted: Story = {
  render: () => (
    <Container>
      <Divider variant="dotted" />
    </Container>
  ),
};

// ============================================
// Orientation
// ============================================

export const Horizontal: Story = {
  render: () => (
    <Container>
      <Divider orientation="horizontal" />
    </Container>
  ),
};

export const Vertical: Story = {
  render: () => (
    <VerticalContainer>
      <span>Left</span>
      <Divider orientation="vertical" fullHeight />
      <span>Right</span>
    </VerticalContainer>
  ),
};

// ============================================
// Thickness
// ============================================

export const Thickness1px: Story = {
  render: () => (
    <Container>
      <Divider thickness={1} />
    </Container>
  ),
};

export const Thickness2px: Story = {
  render: () => (
    <Container>
      <Divider thickness={2} />
    </Container>
  ),
};

export const Thickness5px: Story = {
  render: () => (
    <Container>
      <Divider thickness={5} />
    </Container>
  ),
};

// ============================================
// Combined Examples
// ============================================

export const AllVariants: Story = {
  render: () => (
    <HorizontalContainer>
      <Container>
        <h4>Solid</h4>
        <Divider variant="solid" />
      </Container>
      <Container>
        <h4>Dashed</h4>
        <Divider variant="dashed" />
      </Container>
      <Container>
        <h4>Dotted</h4>
        <Divider variant="dotted" />
      </Container>
    </HorizontalContainer>
  ),
};

export const AllThicknesses: Story = {
  render: () => (
    <HorizontalContainer>
      <Container>
        <h4>1px</h4>
        <Divider thickness={1} />
      </Container>
      <Container>
        <h4>2px</h4>
        <Divider thickness={2} />
      </Container>
      <Container>
        <h4>3px</h4>
        <Divider thickness={3} />
      </Container>
      <Container>
        <h4>5px</h4>
        <Divider thickness={5} />
      </Container>
      <Container>
        <h4>10px</h4>
        <Divider thickness={10} />
      </Container>
    </HorizontalContainer>
  ),
};

export const ContentSeparation: Story = {
  render: () => (
    <Container>
      <div style={{ marginBottom: '16px' }}>
        <h3>Section 1</h3>
        <p>Content above divider</p>
      </div>
      <Divider />
      <div style={{ marginTop: '16px' }}>
        <h3>Section 2</h3>
        <p>Content below divider</p>
      </div>
    </Container>
  ),
};

export const VerticalLayout: Story = {
  render: () => (
    <VerticalContainer>
      <div style={{ textAlign: 'center' }}>
        <strong>Item 1</strong>
      </div>
      <Divider orientation="vertical" fullHeight variant="solid" />
      <div style={{ textAlign: 'center' }}>
        <strong>Item 2</strong>
      </div>
      <Divider orientation="vertical" fullHeight variant="dashed" />
      <div style={{ textAlign: 'center' }}>
        <strong>Item 3</strong>
      </div>
    </VerticalContainer>
  ),
};

// ============================================
// Interaction Tests
// ============================================

export const Interactive: Story = {
  render: () => (
    <HorizontalContainer>
      <Container>
        <Divider data-testid="divider-horizontal" />
      </Container>
      <VerticalContainer>
        <Divider orientation="vertical" fullHeight data-testid="divider-vertical" />
      </VerticalContainer>
      <Container>
        <Divider variant="dashed" thickness={2} data-testid="divider-dashed" />
      </Container>
    </HorizontalContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Verify horizontal divider
    const horizontalDivider = canvas.getByTestId('divider-horizontal');
    expect(horizontalDivider).toBeInTheDocument();
    expect(horizontalDivider).toHaveAttribute('role', 'separator');
    expect(horizontalDivider).toHaveAttribute('aria-orientation', 'horizontal');

    // Test 2: Verify vertical divider
    const verticalDivider = canvas.getByTestId('divider-vertical');
    expect(verticalDivider).toBeInTheDocument();
    expect(verticalDivider).toHaveAttribute('aria-orientation', 'vertical');

    // Test 3: Verify dashed variant
    const dashedDivider = canvas.getByTestId('divider-dashed');
    expect(dashedDivider).toHaveClass(/dashed/);

    // Test 4: Verify thickness
    expect(dashedDivider).toHaveStyle({ height: '2px' });
  },
};
