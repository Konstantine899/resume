/**
 * Story template — plan §4.5.3 (Storybook 10 / CSF3, gate-verified).
 *
 * No `ComponentStory` / `ComponentMeta` / `Template.bind` — those are the
 * Storybook 6 API and do not exist in SB 10 (plan R4). The story is picked up
 * automatically by the stories glob configured in `.storybook/main.ts`.
 *
 * @param {{ name: string, storyTitle: string }} names
 * @returns {string}
 */
export function storyTemplate(names) {
  const { name, storyTitle } = names;
  return `import type { Meta, StoryObj } from '@storybook/react-vite';
import { ${name} } from './${name}';

const meta = {
  title: '${storyTitle}',
  component: ${name},
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
`;
}
