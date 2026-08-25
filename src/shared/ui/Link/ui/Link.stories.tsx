// src/shared/ui/Link/ui/Link.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import type { MouseEvent, ReactNode } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { GitHubIcon, LinkedInIcon } from '@/shared/ui/Icon';
import { Container } from '@/shared/ui/Container';
import { Section } from '@/shared/ui/Section';
import { Popover } from '@/shared/ui/Popover';
import { Link } from '../ui/Link';
import styles from './Link.module.scss';

const meta = {
  title: 'Shared/Link',
  component: Link,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'gradient'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    underline: {
      control: 'select',
      options: ['always', 'hover', 'never'],
    },
    href: {
      control: 'text',
    },
    external: {
      control: 'boolean',
    },
    showExternalIcon: {
      control: 'boolean',
    },
    unstyled: {
      control: 'boolean',
    },
    withLift: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Link по умолчанию */
export const Default: Story = {
  args: {
    href: '#',
    children: 'Click me',
    variant: 'primary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Click me' });
    await expect(link).toHaveAttribute('href', '#');
    await expect(link).toHaveAttribute('data-variant', 'primary');
  },
};

/** Разные варианты */
export const Variants: Story = {
  args: {
    href: '#',
    children: 'Link',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Link {...args} variant="primary" data-testid="variant-primary">
        Primary Link
      </Link>
      <Link {...args} variant="secondary" data-testid="variant-secondary">
        Secondary Link
      </Link>
      <Link {...args} variant="ghost" data-testid="variant-ghost">
        Ghost Link
      </Link>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('variant-primary')).toHaveClass(styles.primary ?? '');
    await expect(canvas.getByTestId('variant-secondary')).toHaveClass(styles.secondary ?? '');
    await expect(canvas.getByTestId('variant-ghost')).toHaveClass(styles.ghost ?? '');
  },
};

/** All-variant table (включая gradient) */
export const AllVariants: Story = {
  args: {
    href: '#',
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: '16px' }}>
      <Link href="#" variant="primary" data-testid="av-primary">
        Primary Link
      </Link>
      <Link href="#" variant="secondary" data-testid="av-secondary">
        Secondary Link
      </Link>
      <Link href="#" variant="ghost" data-testid="av-ghost">
        Ghost Link
      </Link>
      <Link href="#" variant="gradient" data-testid="av-gradient">
        Gradient Link
      </Link>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('av-primary')).toHaveClass(styles.primary ?? '');
    await expect(canvas.getByTestId('av-secondary')).toHaveClass(styles.secondary ?? '');
    await expect(canvas.getByTestId('av-ghost')).toHaveClass(styles.ghost ?? '');
    await expect(canvas.getByTestId('av-gradient')).toHaveClass(styles.gradient ?? '');
  },
};

/** Разные размеры */
export const Sizes: Story = {
  args: {
    href: '#',
    children: 'Link',
    variant: 'primary',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Link {...args} size="sm" data-testid="size-sm">
        Small Link
      </Link>
      <Link {...args} size="md" data-testid="size-md">
        Medium Link
      </Link>
      <Link {...args} size="lg" data-testid="size-lg">
        Large Link
      </Link>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('size-sm')).toHaveClass(styles.sm ?? '');
    await expect(canvas.getByTestId('size-md')).toHaveClass(styles.md ?? '');
    await expect(canvas.getByTestId('size-lg')).toHaveClass(styles.lg ?? '');
  },
};

/** Внешняя ссылка */
export const External: Story = {
  args: {
    href: 'https://github.com',
    children: 'GitHub',
    external: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /GitHub/ });
    await expect(link).toHaveAttribute('target', '_blank');
    const rel = link.getAttribute('rel');
    await expect(rel).toContain('noopener');
    await expect(rel).toContain('noreferrer');
  },
};

/** Ссылка с иконкой слева */
export const WithLeftIcon: Story = {
  args: {
    href: 'mailto:example@example.com',
    children: 'Send Email',
    icon: <Mail size={16} />,
  },
};

/** Ссылка с иконкой справа */
export const WithRightIcon: Story = {
  args: {
    href: '#',
    children: 'Learn More',
    iconRight: <ArrowRight size={16} />,
  },
};

/** Разные варианты подчеркивания */
export const UnderlineVariants: Story = {
  args: {
    href: '#',
    children: 'Link with underline',
    variant: 'primary',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Link {...args} underline="always" data-testid="ul-always">
        Always Underlined
      </Link>
      <Link {...args} underline="hover" data-testid="ul-hover">
        Underline on Hover
      </Link>
      <Link {...args} underline="never" data-testid="ul-never">
        Never Underlined
      </Link>
    </div>
  ),
};

/** С кастомной внешней иконкой */
export const CustomExternalIcon: Story = {
  args: {
    href: 'https://github.com',
    children: 'GitHub Profile',
    external: true,
    externalIcon: GitHubIcon,
  },
};

/** Gradient variant */
export const Gradient: Story = {
  args: {
    href: '#',
    children: 'Gradient Link',
    variant: 'gradient',
    size: 'lg',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Gradient Link' });
    await expect(link).toHaveClass(styles.gradient ?? '');
    // Computed background resolves the --gradient-text var (LNK-06 / PAR-06)
    expect(getComputedStyle(link).backgroundImage).toContain('linear-gradient');
  },
};

/** With lift effect */
export const WithLift: Story = {
  args: {
    href: '#',
    children: 'Link with Lift',
    variant: 'primary',
    withLift: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Link with Lift' })).toHaveClass(
      styles.withLift ?? ''
    );
  },
};

/** All features combined */
export const FullyFeatured: Story = {
  args: {
    href: 'https://github.com',
    children: 'Fully Featured Link',
    variant: 'primary',
    size: 'lg',
    external: true,
    icon: <GitHubIcon size={16} />,
    withLift: true,
    underline: 'hover',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /Fully Featured/ });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveClass(styles.lg ?? '');
    await expect(link).toHaveClass(styles.withLift ?? '');
  },
};

/** Internal link with onClick */
export const InternalLink: Story = {
  args: {
    href: '/about',
    children: 'Internal Link',
    variant: 'secondary',
    onClick: (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      // Internal navigation handler
    },
  },
};

/** Dark theme - все варианты */
export const DarkTheme: Story = {
  args: {
    href: '#',
    children: 'Link',
  },
  render: () => (
    <div style={{ background: '#292726', padding: '32px', borderRadius: '8px' }}>
      <h3 style={{ color: '#e8e6e3', marginBottom: '24px' }}>🌙 Dark Theme</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="#" variant="primary" size="lg">
            Primary
          </Link>
          <Link href="#" variant="secondary" size="lg">
            Secondary
          </Link>
          <Link href="#" variant="ghost" size="lg">
            Ghost
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="#" variant="primary" size="sm">
            Small
          </Link>
          <Link href="#" variant="primary" size="md">
            Medium
          </Link>
          <Link href="#" variant="primary" size="lg">
            Large
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="https://github.com" external>
            External
          </Link>
          <Link href="#" icon={<Mail size={16} />}>
            With Icon
          </Link>
          <Link href="#" iconRight={<ArrowRight size={16} />}>
            With Right Icon
          </Link>
        </div>
      </div>
    </div>
  ),
};

/** Light theme - все варианты */
export const LightTheme: Story = {
  args: {
    href: '#',
    children: 'Link',
  },
  render: () => (
    <div style={{ background: '#f5f3f0', padding: '32px', borderRadius: '8px' }}>
      <h3 style={{ color: '#1a1716', marginBottom: '24px' }}>☀️ Light Theme</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="#" variant="primary" size="lg">
            Primary
          </Link>
          <Link href="#" variant="secondary" size="lg">
            Secondary
          </Link>
          <Link href="#" variant="ghost" size="lg">
            Ghost
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="#" variant="primary" size="sm">
            Small
          </Link>
          <Link href="#" variant="primary" size="md">
            Medium
          </Link>
          <Link href="#" variant="primary" size="lg">
            Large
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="https://github.com" external>
            External
          </Link>
          <Link href="#" icon={<Mail size={16} />}>
            With Icon
          </Link>
          <Link href="#" iconRight={<ArrowRight size={16} />}>
            With Right Icon
          </Link>
        </div>
      </div>
    </div>
  ),
};

/** Skeleton loading state */
export const Skeleton: Story = {
  args: {
    href: '#',
    children: 'Profile Link',
    variant: 'primary',
    skeleton: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Skeleton loading state for navigation links. Use while the link data is loading.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Self-nulling assertion: throw if the skeleton placeholder is absent
    // (do NOT silently skip when `skeleton` is not present).
    const skeleton = canvasElement.querySelector<HTMLElement>('[data-skeleton="true"]');
    expect(skeleton).not.toBeNull();
    const skeletonEl = skeleton as HTMLElement;
    await expect(skeletonEl).toHaveAttribute('aria-disabled', 'true');
    await expect(skeletonEl).toHaveAttribute('data-skeleton', 'true');
  },
};

/** Skeleton в разных размерах */
export const SkeletonSizes: Story = {
  args: { href: '#' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ marginBottom: '4px', fontSize: '12px', color: '#888' }}>sm</div>
        <Link href="#" size="sm" skeleton>
          Small Link
        </Link>
      </div>
      <div>
        <div style={{ marginBottom: '4px', fontSize: '12px', color: '#888' }}>md</div>
        <Link href="#" size="md" skeleton>
          Medium Link
        </Link>
      </div>
      <div>
        <div style={{ marginBottom: '4px', fontSize: '12px', color: '#888' }}>lg</div>
        <Link href="#" size="lg" skeleton>
          Large Link
        </Link>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton link в трёх размерах — подстраивается под font-size через height:1em.',
      },
    },
  },
};

/** External vs internal comparison (LNK-19) */
export const ExternalVsInternal: Story = {
  args: { href: '#' },
  render: () => (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <Link href="https://github.com" external data-testid="ext-vs-int-external">
        External Link
      </Link>
      <Link href="/about" data-testid="ext-vs-int-internal">
        Internal Link
      </Link>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const external = canvas.getByTestId('ext-vs-int-external');
    const internal = canvas.getByTestId('ext-vs-int-internal');
    await expect(external).toHaveAttribute('target', '_blank');
    const rel = external.getAttribute('rel');
    await expect(rel).toContain('noopener');
    await expect(rel).toContain('noreferrer');
    await expect(internal).not.toHaveAttribute('target', '_blank');
  },
};

// Stand-in for a router link used by the polymorphic custom-component story.
interface RouterLinkProps {
  className?: string;
  href?: string;
  children?: ReactNode;
}
const RouterLink = ({ className, href, children }: RouterLinkProps) => (
  <a href={href} className={className} data-testid="poly-custom-link">
    {children}
  </a>
);

/** Полиморфный `component` — кастомный компонент (LNK-19) */
export const CustomComponent: Story = {
  args: { href: '#' },
  render: () => (
    <Link
      component={RouterLink}
      href="/profile"
      variant="primary"
      size="lg"
      className="merged-class"
    >
      Custom Router Link
    </Link>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByTestId('poly-custom-link');
    await expect(link).toHaveClass(styles.link ?? '');
    await expect(link).toHaveClass(styles.primary ?? '');
    await expect(link).toHaveClass('merged-class');
    await expect(link).toHaveAttribute('href', '/profile');
  },
};

/** Link inside a Section — Section adds semantic wrapper and vertical rhythm (LNK-11) */
export const LinkInSection: Story = {
  args: { href: '#' },
  render: () => (
    <Section data-testid="link-section">
      <Link href="#contact" variant="primary" size="lg" data-testid="link-in-section">
        Jump to Contact
      </Link>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('link-section')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Jump to Contact' })).toHaveAttribute(
      'href',
      '#contact'
    );
  },
};

/** Link inside `Container` — container constrains width, Link typography stays (LNK-11) */
export const LinkInContainer: Story = {
  args: { href: '#' },
  render: () => (
    <Container size="md" data-testid="link-container">
      <Link href="/about" variant="secondary" data-testid="link-in-container">
        Read About Me
      </Link>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('link-container')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Read About Me' })).toHaveAttribute(
      'href',
      '/about'
    );
  },
};

/** Link inside a `Popover` content — real composition surface (LNK-11) */
export const LinkInPopover: Story = {
  args: { href: '#' },
  render: () => (
    <Popover
      content={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/profile" size="sm">
            Profile
          </Link>
          <Link href="/settings" size="sm">
            Settings
          </Link>
        </div>
      }
      position="bottom"
      data-testid="link-popover"
    >
      <button type="button">Open Menu</button>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Open Menu'));
    // Popover content renders in a portal — query via screen, not the story canvas
    await expect(await screen.findByRole('link', { name: 'Profile' })).toHaveAttribute(
      'href',
      '/profile'
    );
    await expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings'
    );
  },
};

/** Real-world: sidebar navigation header (SidebarHeader pattern — ghost, underline never) (LNK-12) */
export const SidebarNavHeader: Story = {
  args: { href: '#' },
  render: () => (
    <nav
      data-testid="sidebar-nav-header"
      aria-label="Primary navigation"
      style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '200px' }}
    >
      <Link href="#home" variant="ghost" underline="never">
        Home
      </Link>
      <Link href="#skills" variant="ghost" underline="never">
        Skills
      </Link>
      <Link href="#work" variant="ghost" underline="never">
        My Work
      </Link>
      <Link href="#contact" variant="ghost" underline="never">
        Contact
      </Link>
    </nav>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('sidebar-nav-header')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#home');
    await expect(canvas.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact');
  },
};

/** Real-world Hero-style CTA link (primary, lg) (LNK-12) */
export const HeroCta: Story = {
  args: { href: '#' },
  render: () => (
    <div data-testid="hero-cta" style={{ display: 'flex', gap: '12px' }}>
      <Link href="#contact" variant="primary" size="lg" iconRight={<ArrowRight size={20} />}>
        View Resume
      </Link>
      <Link href="#projects" variant="secondary" size="lg">
        See Projects
      </Link>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('hero-cta')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /View Resume/ })).toHaveAttribute(
      'href',
      '#contact'
    );
    await expect(canvas.getByRole('link', { name: /See Projects/ })).toHaveAttribute(
      'href',
      '#projects'
    );
  },
};

/** Real-world footer link group — external social links (LNK-12) */
export const FooterLinkGroup: Story = {
  args: { href: '#' },
  render: () => (
    <footer data-testid="footer-group" style={{ display: 'flex', gap: '24px' }}>
      <Link href="https://github.com" external size="sm" icon={<GitHubIcon size={14} />}>
        GitHub
      </Link>
      <Link href="https://www.linkedin.com" external size="sm" icon={<LinkedInIcon size={14} />}>
        LinkedIn
      </Link>
      <Link href="mailto:hello@example.com" external size="sm" icon={<Mail size={14} />}>
        Email
      </Link>
    </footer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole('link');
    await expect(links.length).toBe(3);
    for (const link of links) {
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = link.getAttribute('rel');
      await expect(rel).toContain('noopener');
      await expect(rel).toContain('noreferrer');
    }
  },
};
