// ============================================
// Home Page
// ============================================
import { selectAboutContent } from '@/features/AdminAbout/model/selectors';
import { About } from '@/features/About';
import { Contact } from '@/features/Contact';
import { LiveClock } from '@/features/LiveClock';
import { MyWork } from '@/features/MyWork';
import { Skills } from '@/features/Skills';
import { WorkHistory } from '@/features/WorkHistory';
import { Nav } from '@/widgets/Nav';
import { Link } from '@/shared/ui/Link';
import React from 'react';
import { useSelector } from 'react-redux';
import styles from './HomePage.module.scss';

/**
 * Home Page Component
 * Composes all widgets and features following FSD architecture.
 */
export const HomePage: React.FC = () => {
  // WU-2 read-path (Design C): pages is the ONLY layer that reads the
  // AboutContent slice — the vitrina receives it as a prop and keeps its
  // store-free fallback (bare tests render without a Provider).
  const aboutContent = useSelector(selectAboutContent);

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
        {/* Main Content — recruiter-audit order: About → Skills → featured
            Work → Experience → Contact. About leads with the value
            proposition, Skills follows with the craft proof. NAV_ITEMS uses
            the same order (the standalone "home" anchor was dropped, so nav
            anchors and render order are one list, not two). */}
        <main id="main-content" className={styles.mainContent}>
          <About content={aboutContent} />
          <Skills />
          <MyWork />
          <WorkHistory />
          <Contact />
          {/* Temporary test feature (issue #161) — deleted after the first
              spec-workflow cycle completes. No nav anchor by design. */}
          <LiveClock />
        </main>
      </div>
    </>
  );
};

HomePage.displayName = 'HomePage';
export default HomePage;
