// ============================================
// Home Page
// ============================================

import React from 'react';
import { Sidebar } from '@/widgets/Sidebar';
import { Hero } from '@/features/Hero';
import { MyWork } from '@/features/MyWork';
import { WorkHistory } from '@/features/WorkHistory';
import { About } from '@/features/About';
import { Skills } from '@/features/Skills';
import { Contact } from '@/features/Contact';
import styles from '../styles/HomePage.module.scss';

/**
 * Home Page Component
 * 
 * Main page that composes all widgets and features.
 * Follows FSD architecture - pages layer composes widgets and features.
 */
export const HomePage: React.FC = () => {
  return (
    <div className={styles.homePage}>
      <Sidebar />
      
      <main className={styles.mainContent}>
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