// ============================================
// Home Page
// ============================================
import { selectAboutContent } from '@/features/AdminAbout/model/selectors';
// Deep import, NOT the AdminContact barrel (resume-lazy-rhf-chunk): the
// barrel will export the WU-3 editor form and must stay lazy-only.
import { selectContactContent } from '@/features/AdminContact/model/selectors';
// WorkHistory CRUD WU-4: same Design C pattern — pages reads the adminJobs
// slice, WorkHistory stays store-free and receives the sorted list as a prop.
import { selectSortedJobs } from '@/features/AdminJobs/model/selectors';
// Projects CRUD WU-3: deep import for the same lazy-barrel reason — the
// AdminMyWork barrel will export the WU-4 RHF editor form.
import { selectAllProjects } from '@/features/AdminMyWork/model/selectors';
// Skills CRUD WU-4: deep import, pages is the only layer that reads the
// adminSkills slice — the vitrina stays store-free (Design C / R-5).
import { selectSkillsData } from '@/features/AdminSkills/model/selectors';
import { About } from '@/features/About';
import { Contact } from '@/features/Contact';
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
  // AboutContent/ContactContent slices — the vitrinas receive them as
  // props and keep their store-free fallback (bare tests render without
  // a Provider).
  const aboutContent = useSelector(selectAboutContent);
  const contactContent = useSelector(selectContactContent);
  // MyWork pagination (spec src/features/MyWork, owner 2026-10-08): pages
  // reads the slice, MyWork stays store-free and receives ALL projects.
  const allProjects = useSelector(selectAllProjects);
  // Skills CRUD WU-4 (Design C): pages reads the adminSkills slice; the
  // Skills vitrina falls back to the entity seed without a Provider.
  const skillsContent = useSelector(selectSkillsData);
  // WorkHistory CRUD WU-4 (Design C): pages reads the adminJobs slice; the
  // WorkHistory vitrina falls back to the entity seed without a Provider.
  const jobsContent = useSelector(selectSortedJobs);

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
          <Skills content={skillsContent} />
          <MyWork content={allProjects} />
          <WorkHistory content={jobsContent} />
          <Contact content={contactContent} />
        </main>
      </div>
    </>
  );
};

HomePage.displayName = 'HomePage';
export default HomePage;
