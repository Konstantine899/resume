// ============================================
// Home Page
// ============================================
import { About } from '@/features/About';
import { Contact } from '@/features/Contact';
import { Hero } from '@/features/Hero';
import { MyWork } from '@/features/MyWork';
import { Skills } from '@/features/Skills';
import { WorkHistory } from '@/features/WorkHistory';
import { Nav } from '@/widgets/Nav';
import { Link } from '@/shared/ui/Link';
import React from 'react';
import styles from './HomePage.module.scss';

/**
 * Home Page Component
 * Composes all widgets and features following FSD architecture.
 */
export const HomePage: React.FC = () => {
  return (
    <>
      {/* Skip link for accessibility — R6: the single skip link lives here,
          as the first focusable element. Nav must not add a second one. */}
      <Link
        href="#main-content"
        unstyled
        variant="ghost"
        underline="never"
        className={styles.skipToMain}
      >
        Skip to main content
      </Link>

      {/* Sticky top navigation (issue #138). Rendered outside .homePage so it
          stays a full-width top bar and keeps its own stacking context. It is
          in normal flow (position: sticky), so main content starts below it —
          no spacer offset is needed (the old Sidebar desktopSpacer is gone). */}
      <Nav />

      <div className={styles.homePage}>
        {/* Main Content — recruiter-audit order: Hero → About → Skills →
            featured Work → Experience → Contact. NAV_ITEMS keeps its own
            order (nav anchors ≠ render order — flagged as a known mismatch). */}
        <main id="main-content" className={styles.mainContent}>
          <Hero />
          <About />
          <Skills />
          <MyWork />
          <WorkHistory />
          <Contact />
        </main>
      </div>
    </>
  );
};

HomePage.displayName = 'HomePage';
export default HomePage;
