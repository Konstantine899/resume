// ============================================
// Card Component Tests
// ============================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { CardBody } from './CardBody';
import { CardFooter } from './CardFooter';
import { CardImage } from './CardImage';
import { ProjectCard } from './ProjectCard';
import { WorkHistoryCard } from './WorkHistoryCard';
import { ContactCard } from './ContactCard';
import cardDescriptionStyles from './CardDescription/CardDescription.module.scss';
import projectCardStyles from './ProjectCard/ProjectCard.module.scss';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders base card with children', () => {
      render(<Card>Test Content</Card>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild).toHaveClass(/card/);
      expect(container.firstChild).toHaveClass(/default/);
    });

    it('renders with custom variant', () => {
      render(
        <Card variant="skill" data-testid="skill-card">
          Skill Card
        </Card>
      );
      // Skill variant is wrapped in Container, so we check the Container wrapper
      const container = screen.getByTestId('skill-card').closest('[data-size="xl"]');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass(/centered/);
    });

    it('renders with size modifier', () => {
      const { container } = render(<Card size="large">Large Card</Card>);
      expect(container.firstChild).toHaveClass(/large/);
    });

    it('renders with radius modifier', () => {
      const { container } = render(<Card radius="roundedXl">Rounded Card</Card>);
      expect(container.firstChild).toHaveClass(/roundedXl/);
    });

    it('renders with fullWidth modifier', () => {
      const { container } = render(<Card fullWidth>Full Width</Card>);
      expect(container.firstChild).toHaveClass(/fullWidth/);
    });

    it('renders with noHover modifier', () => {
      const { container } = render(<Card hoverable={false}>No Hover</Card>);
      expect(container.firstChild).toHaveClass(/noHover/);
    });

    it('renders with custom className', () => {
      const { container } = render(<Card className="custom-class">Custom</Card>);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('forwards HTML attributes', () => {
      render(
        <Card data-testid="card-test" id="card-id">
          Content
        </Card>
      );
      expect(screen.getByTestId('card-test')).toHaveAttribute('id', 'card-id');
    });
  });

  describe('Composition API', () => {
    it('renders Card.Header', () => {
      render(
        <Card>
          <Card.Header>Header Content</Card.Header>
        </Card>
      );
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('renders Card.Header with border', () => {
      const { container } = render(
        <Card>
          <Card.Header withBorder>Header</Card.Header>
        </Card>
      );
      const header = container.querySelector('[class*="cardHeader"]');
      expect(header).toHaveClass(/withBorder/);
    });

    it('renders Card.Body', () => {
      render(
        <Card>
          <Card.Body>Body Content</Card.Body>
        </Card>
      );
      expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    it('renders Card.Footer', () => {
      render(
        <Card>
          <Card.Footer>Footer Content</Card.Footer>
        </Card>
      );
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('renders Card.Footer with border', () => {
      const { container } = render(
        <Card>
          <Card.Footer withBorder>Footer</Card.Footer>
        </Card>
      );
      const footer = container.querySelector('[class*="cardFooter"]');
      expect(footer).toHaveClass(/withBorder/);
    });

    it('renders Card.Image', () => {
      render(
        <Card>
          <Card.Image src="/test.jpg" alt="Test image" />
        </Card>
      );
      expect(screen.getByAltText('Test image')).toHaveAttribute('src', '/test.jpg');
    });

    it('renders Card.Image with custom objectFit', () => {
      render(
        <Card>
          <Card.Image src="/test.jpg" alt="Test" objectFit="contain" />
        </Card>
      );
      const img = screen.getByAltText('Test');
      expect(img).toHaveStyle('object-fit: contain');
    });

    it('renders complete card structure', () => {
      render(
        <Card>
          <Card.Header withBorder>Header</Card.Header>
          <Card.Body>Body</Card.Body>
          <Card.Footer withBorder>Footer</Card.Footer>
        </Card>
      );
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Body')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('renders Card.Image with dimensions', () => {
      render(
        <Card>
          <Card.Image src="/test.jpg" alt="Test" width={200} height={150} />
        </Card>
      );
      const img = screen.getByAltText('Test');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/test.jpg');
    });
  });

  describe('Accessibility', () => {
    it('has role="group" attribute', () => {
      render(<Card>Content</Card>);
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('forwards aria-label', () => {
      render(<Card aria-label="Test card">Content</Card>);
      expect(screen.getByLabelText('Test card')).toBeInTheDocument();
    });

    it('forwards aria-describedby', () => {
      render(
        <>
          <p id="description">Description text</p>
          <Card aria-describedby="description">Content</Card>
        </>
      );
      expect(screen.getByRole('group')).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('Hover Interaction', () => {
    it('applies hover styles by default', () => {
      const { container } = render(<Card>Hoverable</Card>);
      expect(container.firstChild).not.toHaveClass(/noHover/);
    });

    it('disables hover when hoverable=false', () => {
      const { container } = render(<Card hoverable={false}>Not Hoverable</Card>);
      expect(container.firstChild).toHaveClass(/noHover/);
    });
  });

  describe('Specialized Cards', () => {
    it('renders ProjectCard', () => {
      render(<ProjectCard title="Test Project" description="Description" techIcons={[]} />);
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('renders ProjectCard with external link via Link component', () => {
      render(
        <ProjectCard
          title="Test Project"
          description="Description"
          techIcons={[]}
          link="https://example.com/project"
        />
      );
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com/project');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
      expect(link).toHaveClass(projectCardStyles.link ?? '');
    });

    it('renders WorkHistoryCard', () => {
      render(
        <WorkHistoryCard
          title="Developer"
          company="Test Company"
          achievements={['Achievement 1']}
          techStack={['React']}
        />
      );
      expect(screen.getByText('Developer')).toBeInTheDocument();
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });

    it('renders ContactCard', () => {
      render(<ContactCard title="Контакты">Contact info</ContactCard>);
      expect(screen.getByText('Контакты')).toBeInTheDocument();
    });
  });

  describe('Polymorphic component prop', () => {
    it('renders as section with component="section"', () => {
      const { container } = render(<Card component="section">Section card</Card>);
      const el = container.querySelector('section');
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute('data-variant', 'default');
    });

    it('renders as article with component="article"', () => {
      const { container } = render(<Card component="article">Article card</Card>);
      const el = container.querySelector('article');
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute('data-variant', 'default');
    });

    it('renders as link with component="a" and href', () => {
      render(
        <Card component="a" href="/test">
          Link card
        </Card>
      );
      const link = screen.getByText('Link card');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('preserves Card styles when polymorphic', () => {
      const { container } = render(
        <Card component="section" variant="skill" size="large" radius="roundedXl">
          Styled section
        </Card>
      );
      const el = container.querySelector('section');
      expect(el).toHaveAttribute('data-variant', 'skill');
      expect(el).toHaveAttribute('data-size', 'large');
      expect(el).toHaveAttribute('data-radius', 'roundedXl');
      expect(el).toHaveAttribute('data-state', 'hoverable');
    });

    it('forwards data attributes with polymorphic', () => {
      const { container } = render(
        <Card component="article" data-testid="poly-card">
          Data attr
        </Card>
      );
      const el = container.querySelector('article');
      expect(el).toHaveAttribute('data-testid', 'poly-card');
    });

    it('renders as form with component="form"', () => {
      const handleSubmit = (e: React.FormEvent) => e.preventDefault();
      const { container } = render(
        <Card component="form" onSubmit={handleSubmit}>
          <button type="submit">Submit</button>
        </Card>
      );
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      const btn = form?.querySelector('button[type="submit"]');
      expect(btn).toBeInTheDocument();
    });

    it('renders as div by default', () => {
      const { container } = render(<Card>Default div</Card>);
      const el = container.firstChild as HTMLElement;
      expect(el.tagName).toBe('DIV');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<Card />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles null children', () => {
      const { container } = render(<Card>{null}</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles undefined children', () => {
      const { container } = render(<Card>{undefined}</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles multiple className values', () => {
      const { container } = render(<Card className="class1 class2 class3">Content</Card>);
      expect(container.firstChild).toHaveClass('class1');
      expect(container.firstChild).toHaveClass('class2');
      expect(container.firstChild).toHaveClass('class3');
    });
  });

  describe('Container Integration (skill/about variants)', () => {
    it('wraps skill variant in Container with size="xl"', () => {
      render(
        <Card variant="skill" data-testid="skill-card">
          Skill Content
        </Card>
      );
      // Container should render with data-size="xl"
      const container = screen.getByTestId('skill-card').closest('[data-size="xl"]');
      expect(container).toBeInTheDocument();
    });

    it('wraps about variant in Container with size="lg"', () => {
      render(
        <Card variant="about" data-testid="about-card">
          About Content
        </Card>
      );
      // Container should render with data-size="lg"
      const container = screen.getByTestId('about-card').closest('[data-size="lg"]');
      expect(container).toBeInTheDocument();
    });

    it('skill variant has centered prop on Container', () => {
      render(
        <Card variant="skill" data-testid="skill-card">
          Skill Content
        </Card>
      );
      const container = screen.getByTestId('skill-card').closest('[data-size="xl"]');
      expect(container).toHaveClass(/centered/);
    });

    it('about variant has centered prop on Container', () => {
      render(
        <Card variant="about" data-testid="about-card">
          About Content
        </Card>
      );
      const container = screen.getByTestId('about-card').closest('[data-size="lg"]');
      expect(container).toHaveClass(/centered/);
    });

    it('default variant does NOT use Container', () => {
      render(<Card data-testid="default-card">Default Content</Card>);
      const card = screen.getByTestId('default-card');
      // Should not have Container ancestor (Container has _container_* class)
      const containerAncestor = card.closest('[class*="_container_"]');
      expect(containerAncestor).not.toBeInTheDocument();
    });

    it('project variant does NOT use Container', () => {
      render(<Card.Project title="Test" description="Desc" techIcons={[]} />);
      // ProjectCard has its own layout, should not be wrapped in Container
      const projectCard = screen.getByText('Test');
      const containerAncestor = projectCard.closest('[data-size]');
      expect(containerAncestor).not.toBeInTheDocument();
    });
  });

  describe('Static Properties', () => {
    it('has Card.Header static property', () => {
      expect(Card.Header).toBeDefined();
      expect(Card.Header.displayName).toBe('CardHeader');
    });

    it('has Card.Body static property', () => {
      expect(Card.Body).toBeDefined();
      expect(Card.Body.displayName).toBe('CardBody');
    });

    it('has Card.Footer static property', () => {
      expect(Card.Footer).toBeDefined();
      expect(Card.Footer.displayName).toBe('CardFooter');
    });

    it('has Card.Image static property', () => {
      expect(Card.Image).toBeDefined();
      expect(Card.Image.displayName).toBe('CardImage');
    });

    it('has Card.Project static property', () => {
      expect(Card.Project).toBeDefined();
    });

    it('has Card.WorkHistory static property', () => {
      expect(Card.WorkHistory).toBeDefined();
    });

    it('has Card.Contact static property', () => {
      expect(Card.Contact).toBeDefined();
    });

    it('has Card.Title static property', () => {
      expect(Card.Title).toBeDefined();
      expect(Card.Title.displayName).toBe('CardTitle');
    });

    it('has Card.Description static property', () => {
      expect(Card.Description).toBeDefined();
      expect(Card.Description.displayName).toBe('CardDescription');
    });

    it('has Card.Actions static property', () => {
      expect(Card.Actions).toBeDefined();
      expect(Card.Actions.displayName).toBe('CardActions');
    });

    it('has Card.Grid static property', () => {
      expect(Card.Grid).toBeDefined();
      expect(Card.Grid.displayName).toBe('CardGrid');
    });

    it('has Card.Meta static property', () => {
      expect(Card.Meta).toBeDefined();
      expect(Card.Meta.displayName).toBe('CardMeta');
    });
  });

  describe('Compound Components', () => {
    it('renders Card.Title as h3 by default', () => {
      render(
        <Card>
          <Card.Title>Card Title</Card.Title>
        </Card>
      );
      expect(screen.getByText('Card Title').tagName).toBe('H3');
    });

    it('renders Card.Title with custom heading level', () => {
      render(
        <Card>
          <Card.Title as="h2">H2 Title</Card.Title>
        </Card>
      );
      expect(screen.getByText('H2 Title').tagName).toBe('H2');
    });

    it('renders Card.Description via Paragraph with s/muted classes', () => {
      render(
        <Card>
          <Card.Description>Description text</Card.Description>
        </Card>
      );
      // Paragraph-agnostic: content renders as a <p> carrying the cardDescription class
      const desc = screen.getByText('Description text');
      expect(desc).toBeInTheDocument();
      expect(desc.tagName).toBe('P');
      expect(desc).toHaveClass(cardDescriptionStyles.cardDescription ?? '');
      // Paragraph-backed: carries the paragraph base class and size/theme data attributes
      expect(desc).toHaveClass(/paragraph/);
      expect(desc).toHaveAttribute('data-size', 's');
      expect(desc).toHaveAttribute('data-theme', 'muted');
    });

    it('renders Card.Actions', () => {
      render(
        <Card>
          <Card.Actions>
            <button type="button">Action</button>
          </Card.Actions>
        </Card>
      );
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('renders Card.Actions with align center', () => {
      const { container } = render(
        <Card>
          <Card.Actions align="center">
            <button type="button">Center</button>
          </Card.Actions>
        </Card>
      );
      const actions = container.querySelector('[class*="alignCenter"]');
      expect(actions).toBeInTheDocument();
    });

    it('renders Card.Actions with align end', () => {
      const { container } = render(
        <Card>
          <Card.Actions align="end">
            <button type="button">End</button>
          </Card.Actions>
        </Card>
      );
      const actions = container.querySelector('[class*="alignEnd"]');
      expect(actions).toBeInTheDocument();
    });

    it('renders Card.Meta text via Paragraph with xs/tertiary classes', () => {
      render(
        <Card>
          <Card.Meta>Meta info</Card.Meta>
        </Card>
      );
      // Paragraph-agnostic: the meta text renders (wrapper keeps its flex layout)
      const metaText = screen.getByText('Meta info');
      expect(metaText).toBeInTheDocument();
      // Paragraph-backed: text carries the paragraph base class and xs/tertiary data attributes
      expect(metaText.tagName).toBe('P');
      expect(metaText).toHaveClass(/paragraph/);
      expect(metaText).toHaveAttribute('data-size', 'xs');
      expect(metaText).toHaveAttribute('data-theme', 'tertiary');
    });

    it('renders Card.Grid with default 3 columns', () => {
      const { container } = render(<Card.Grid>Grid content</Card.Grid>);
      expect(container.firstChild).toHaveClass(/cols3/);
    });

    it('renders Card.Grid with custom columns', () => {
      const { container } = render(<Card.Grid columns={2}>2 cols</Card.Grid>);
      expect(container.firstChild).toHaveClass(/cols2/);
    });

    it('renders Card.Grid with gap', () => {
      const { container } = render(<Card.Grid gap="lg">Large gap</Card.Grid>);
      expect(container.firstChild).toHaveClass(/gapLg/);
    });

    it('renders complete card with all compound components', () => {
      render(
        <Card>
          <Card.Meta>Meta</Card.Meta>
          <Card.Title>Title</Card.Title>
          <Card.Description>Description</Card.Description>
          <Card.Image src="/test.jpg" alt="Test" />
          <Card.Actions align="end">
            <button type="button">Action</button>
          </Card.Actions>
        </Card>
      );
      expect(screen.getByText('Meta')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByAltText('Test')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });
});

describe('CardHeader', () => {
  it('renders with children', () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('applies withBorder class', () => {
    const { container } = render(<CardHeader withBorder>Header</CardHeader>);
    expect(container.firstChild).toHaveClass(/withBorder/);
  });

  it('forwards HTML attributes', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});

describe('CardBody', () => {
  it('renders with children', () => {
    render(<CardBody>Body</CardBody>);
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('forwards HTML attributes', () => {
    render(<CardBody data-testid="body">Body</CardBody>);
    expect(screen.getByTestId('body')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('renders with children', () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies withBorder class', () => {
    const { container } = render(<CardFooter withBorder>Footer</CardFooter>);
    expect(container.firstChild).toHaveClass(/withBorder/);
  });

  it('forwards HTML attributes', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});

describe('CardImage', () => {
  it('renders img element', () => {
    render(<CardImage src="/test.jpg" alt="Test" />);
    const img = screen.getByAltText('Test');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.jpg');
  });

  it('uses default alt empty string', () => {
    render(<CardImage src="/test.jpg" />);
    const img = screen.getByAltText('');
    expect(img).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CardImage src="/test.jpg" alt="Test" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies custom className to container', () => {
    render(<CardImage src="/test.jpg" alt="Test" className="custom" />);
    const img = screen.getByAltText('Test');
    expect(img).toHaveAttribute('src', '/test.jpg');
  });
});
