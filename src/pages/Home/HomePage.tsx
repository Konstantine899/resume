// ============================================
// Home Page
// ============================================
import { About } from '@/features/About';
import { Contact } from '@/features/Contact/Contact';
import { Hero } from '@/features/Hero';
import { MyWork } from '@/features/MyWork';
import { Skills } from '@/features/Skills';
import { WorkHistory } from '@/features/WorkHistory';
import { Sidebar } from '@/widgets/Sidebar';
import React from 'react';
import styles from './HomePage.module.scss';

/**
 * Home Page Component
 * Composes all widgets and features following FSD architecture.
 */
export const HomePage: React.FC = () => {
  return (
    <div className={styles.homePage}>
      {/* Skip link for accessibility */}
      <a href="#main-content" className={styles.skipToMain}>
        Skip to main content
      </a>

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
  );
};

HomePage.displayName = 'HomePage';
export default HomePage;
