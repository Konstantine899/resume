import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Slot } from './Slot';

/**
 * Slot не создаёт свой DOM-узел, а клонирует единственного дочернего ReactElement
 * с merged className, id, data-testid и ref.
 */
const meta: Meta<typeof Slot> = {
  title: 'shared/Slot',
  component: Slot,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Slot — компонент для прозрачного рендеринга. Не создаёт свой DOM-узел, а клонирует дочерний элемент с merged props.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Slot>;

/**
 * Базовое использование — Slot пробрасывает data-testid на span
 */
export const Default: Story = {
  render: () => (
    <Slot data-testid="slot-default">
      <span>Текст внутри span через Slot</span>
    </Slot>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('slot-default');
    await expect(el.tagName).toBe('SPAN');
    await expect(el).toHaveTextContent('Текст внутри span через Slot');
  },
};

/**
 * Merged className — родительский className добавляется к дочернему
 */
export const WithClassName: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--foreground-muted)' }}>
        Дочерний элемент получает оба класса: родительский и свой:
      </p>
      <Slot className="parent-class" data-testid="slot-class">
        <span
          className="child-class"
          style={{ padding: '8px', background: 'var(--card-bg)', borderRadius: '4px' }}
        >
          Текст с parent-class и child-class
        </span>
      </Slot>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('slot-class');
    await expect(el).toHaveClass('parent-class');
    await expect(el).toHaveClass('child-class');
  },
};

/**
 * Проброс id
 */
export const WithId: Story = {
  render: () => (
    <Slot id="slot-id-example" data-testid="slot-id">
      <span>Элемент с id="slot-id-example"</span>
    </Slot>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('slot-id');
    await expect(el).toHaveAttribute('id', 'slot-id-example');
  },
};

/**
 * Проброс data-testid — переопределяет дочерний
 */
export const WithDataTestId: Story = {
  render: () => (
    <Slot data-testid="overridden-testid">
      <span data-testid="original-testid">
        Оригинальный data-testid переопределён на "overridden-testid"
      </span>
    </Slot>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('overridden-testid');
    await expect(el).toHaveTextContent('Оригинальный data-testid переопределён');
  },
};

/**
 * Slot с button — демонстрация проброса на интерактивные элементы
 */
export const WithButton: Story = {
  render: () => (
    <Slot className="slot-button" data-testid="slot-button">
      <button
        style={{
          padding: '8px 16px',
          border: '2px solid var(--primary)',
          borderRadius: '8px',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        Кнопка со стилями через Slot
      </button>
    </Slot>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('slot-button');
    await expect(el.tagName).toBe('BUTTON');
    await expect(el).toHaveClass('slot-button');
  },
};

/**
 * Slot с div — демонстрация проброса на блочные элементы
 */
export const WithDiv: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--foreground-muted)' }}>
        Slot с div и merged className:
      </p>
      <Slot className="slot-div" data-testid="slot-div">
        <div
          style={{
            padding: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
          }}
        >
          Блочный элемент с className от Slot
        </div>
      </Slot>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('slot-div');
    await expect(el.tagName).toBe('DIV');
    await expect(el).toHaveClass('slot-div');
  },
};

/**
 * Slot с label — демонстрация для форм
 */
export const WithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Slot className="slot-label" data-testid="slot-label">
        <label style={{ cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked /> Label с className через Slot
        </label>
      </Slot>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('slot-label');
    await expect(el.tagName).toBe('LABEL');
    await expect(el).toHaveClass('slot-label');
  },
};
