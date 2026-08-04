import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { ProjectCard } from './ProjectCard';

const meta = {
  title: 'Shared/Card/ProjectCard',
  component: ProjectCard,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Project title' },
    description: { control: 'text', description: 'Project description' },
    backgroundImage: { control: 'text', description: 'Background image URL' },
    link: { control: 'text', description: 'External project link' },
    linkLabel: { control: 'text', description: 'Link label' },
    builtUsingLabel: { control: 'text', description: 'Tech section label' },
  },
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof ProjectCard>;

export const WithBackgroundImage: Story = {
  args: {
    title: 'Dragonfly',
    description:
      'A fully vertically integrated cannabis production company with a focus on quality and sustainability.',
    backgroundImage: 'https://ext.same-assets.com/55871041/1910007590.webp',
    techIcons: [
      {
        name: 'React',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      },
      {
        name: 'Next.js',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
      },
      {
        name: 'Tailwind CSS',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
      },
      {
        name: 'Framer Motion',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/framermotion/framermotion-original.svg',
      },
    ],
    link: 'https://dragonflyprocessing.com',
    builtUsingLabel: 'Built Using',
    linkLabel: 'Visit Site',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Dragonfly')).toBeInTheDocument();
    expect(canvas.getByText(/vertically integrated/i)).toBeInTheDocument();
    const background = canvasElement.querySelector(
      '[class*="backgroundImage"]'
    ) as HTMLElement | null;
    expect(background).toBeInTheDocument();
    expect(background?.style.backgroundImage).toContain('1910007590.webp');
    const link = canvas.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://dragonflyprocessing.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(canvas.getByText('Built Using')).toBeInTheDocument();
    expect(canvas.getByText('Visit Site')).toBeInTheDocument();
    const techIcons = canvasElement.querySelectorAll('img[class*="techIcon"]');
    expect(techIcons).toHaveLength(4);
    expect(canvas.getByAltText('React')).toBeInTheDocument();
    expect(canvas.getByAltText('Framer Motion')).toBeInTheDocument();
  },
};

export const ManyTechIcons: Story = {
  args: {
    title: 'Central Valley Foods',
    description:
      'An ecommerce site for farm products, utilizing online shopping features like a cart, order form, and credit card checkout.',
    backgroundImage: 'https://ext.same-assets.com/55871041/341412428.webp',
    techIcons: [
      {
        name: 'React',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      },
      {
        name: 'JavaScript',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      },
      {
        name: 'Node.js',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
      },
      {
        name: 'Redux',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg',
      },
      {
        name: 'CSS3',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
      },
    ],
    link: 'https://centralvalleyfoods.net',
    builtUsingLabel: 'Built Using',
    linkLabel: 'Visit Site',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Central Valley Foods')).toBeInTheDocument();
    expect(canvas.getByText(/ecommerce site for farm products/i)).toBeInTheDocument();
    const background = canvasElement.querySelector(
      '[class*="backgroundImage"]'
    ) as HTMLElement | null;
    expect(background).toBeInTheDocument();
    expect(background?.style.backgroundImage).toContain('341412428.webp');
    const link = canvas.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://centralvalleyfoods.net');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const techIcons = canvasElement.querySelectorAll('img[class*="techIcon"]');
    expect(techIcons).toHaveLength(5);
    expect(canvas.getByAltText('React')).toBeInTheDocument();
    expect(canvas.getByAltText('Redux')).toBeInTheDocument();
    expect(canvas.getByText('Built Using')).toBeInTheDocument();
    expect(canvas.getByText('Visit Site')).toBeInTheDocument();
  },
};
