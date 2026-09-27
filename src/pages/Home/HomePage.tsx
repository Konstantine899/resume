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
import { Sidebar } from '@/widgets/Sidebar';
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

      {/* Sticky top navigation (issue #138, T1). Rendered outside .homePage:
          that container is a row flex (Sidebar spacer + main), so an in-flow
          Nav there would become a horizontal flex item instead of a
          full-width top bar. */}
      <Nav />

      <div className={styles.homePage}>
        {/* Sidebar (includes desktopSpacer internally) */}
        <Sidebar />

        {/* Main Content */}
        <main id="main-content" className={styles.mainContent}>
          <Hero />
          <MyWork />
          <WorkHistory />
          <About />
          <Skills />
          <Contact />
        </main>
      </div>
    </>
  );
};

HomePage.displayName = 'HomePage';
export default HomePage;
