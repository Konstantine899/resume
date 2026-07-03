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
      const { container } = render(<Card variant="skill">Skill Card</Card>);
      expect(container.firstChild).toHaveClass(/skill/);
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
      expect(img).toHaveAttribute('width', '200');
      expect(img).toHaveAttribute('height', '150');
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

  it('forwards HTML img attributes', () => {
    render(<CardImage src="/test.jpg" alt="Test" className="test-img" />);
    const img = screen.getByAltText('Test');
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveClass('test-img');
  });
});
