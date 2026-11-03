// src/shared/ui/Section/ui/Section.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from '@/shared/ui/Heading';
import { Section } from './Section';

const meta = {
  title: 'Shared/Section',
  component: Section,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Vertical padding scale (default md)',
    },
    as: {
      control: 'select',
      options: ['section', 'div', 'article', 'aside', 'main', 'nav'],
      description: 'Semantic root element (default section)',
    },
  },
  args: {
    // Fixtures, not translations: kit Section owns no i18n.
    children: <p>Section content with the default md size.</p>,
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default `<section>` element with size="md" — vertical padding only. */
export const Default: Story = {};

/** The canonical composition: a kit Heading inside the section. */
export const WithHeading: Story = {
  args: {
    children: (
      <>
        <Heading level={2}>About this section</Heading>
        <p>Sections only add vertical padding — pair them with Container for horizontal layout.</p>
      </>
    ),
  },
};
