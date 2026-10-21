// ============================================
// Technology catalog seed — verbatim move of TECH_ICONS (SPEC D3)
// ============================================
//
// The 14 records are byte-identical to the old entities/Project dictionary
// (same keys, same URLs, same invertInDark flags) — NO data migration.
// `seedTechnologies()` returns a FRESH DEEP COPY: RTK auto-freezes state,
// and without the copy the store would freeze the shared constant's nested
// objects too (same reasoning as AdminMyWork's createProjectsSeed).

import type { Technology } from '../types/types';

export const TECHNOLOGIES_SEED: Technology[] = [
  // Frontend
  {
    key: 'react',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    invertInDark: true,
  },
  {
    key: 'nextjs',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    invertInDark: true,
  },
  {
    key: 'typescript',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  },
  {
    key: 'javascript',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  },

  // Styling
  {
    key: 'tailwind',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
  },
  {
    key: 'css',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
  },
  {
    key: 'html',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  },
  {
    key: 'sass',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg',
  },

  // Backend
  {
    key: 'nodejs',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  },
  {
    key: 'python',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  },
  {
    key: 'postgresql',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  },

  // Tools & Libraries
  {
    key: 'redux',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg',
  },
  {
    key: 'framer',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/framermotion/framermotion-original.svg',
    invertInDark: true,
  },
  {
    key: 'd3js',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/d3js/d3js-original.svg',
    invertInDark: true,
  },
];

/** Fresh deep copy of the seed — the ONLY form the store may touch. */
export const seedTechnologies = (): Technology[] =>
  TECHNOLOGIES_SEED.map((tech): Technology => JSON.parse(JSON.stringify(tech)));
