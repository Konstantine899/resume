// Seed guard (plan_project_images WU-3): every `image` in the seed must
// exist as a real file under src/shared/assets/images/projects/ — a typo or
// a rename silently breaks the showcase (CSS background, no console error).
// Path is resolved from the repo root: vitest cwd = repo root (gotcha
// resume-refactor-tools — fileURLToPath(import.meta.url) alternative is the
// test file location, one level deeper; cwd is the stable choice here).
import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { PROJECTS } from './constants';

const IMAGES_DIR = path.join(process.cwd(), 'src', 'shared', 'assets', 'images', 'projects');

describe('PROJECTS seed images', () => {
  it('every seed image points to an existing file in src/shared/assets/images/projects', () => {
    for (const project of PROJECTS) {
      expect(project.image, `${project.id}/${project.title}`).toMatch(/^\/images\/projects\//);
      const fileName = project.image.replace('/images/projects/', '');
      const filePath = path.join(IMAGES_DIR, fileName);
      expect(
        fs.existsSync(filePath),
        `${project.image} — file missing at ${filePath} (seed guard, WU-3)`
      ).toBe(true);
    }
  });

  it('the images directory holds no unreferenced leftovers', () => {
    const referenced = new Set(PROJECTS.map((p) => p.image.replace('/images/projects/', '')));
    const onDisk = fs.readdirSync(IMAGES_DIR);
    for (const file of onDisk) {
      expect(referenced.has(file), `orphan file in images dir: ${file}`).toBe(true);
    }
  });
});
