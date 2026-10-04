/**
 * `ui/` step of the slice generator — plan §2.3.3 (component directly in
 * `ui/`, like Contact/Skills/WorkHistory; the `ui/<Name>/` folder is reserved
 * for sub-components such as `Skills/ui/SkillItem/`).
 *
 * Files: `<Name>.tsx`, `<Name>.test.tsx` (mandatory — coverage thresholds,
 * plan R8), `<Name>.stories.tsx`, `<Name>.module.scss`.
 */
import path from 'node:path';
import { componentTemplate } from './templates/component.mjs';
import { componentTestTemplate } from './templates/component-test.mjs';
import { storyTemplate } from './templates/story.mjs';
import { styleTemplate } from './templates/style.mjs';

/**
 * @param {{ name: string, camel: string, kebab: string, storyTitle: string }} names
 * @returns {{ relPath: string, content: string }[]}
 */
export function uiFiles(names) {
  const { name } = names;
  return [
    { relPath: `ui/${name}.tsx`, content: componentTemplate(names) },
    { relPath: `ui/${name}.test.tsx`, content: componentTestTemplate(names) },
    { relPath: `ui/${name}.stories.tsx`, content: storyTemplate(names) },
    { relPath: `ui/${name}.module.scss`, content: styleTemplate(names) },
  ];
}

/**
 * Write the `ui/` files into the staging directory.
 * @param {string} stagingDir absolute path of the staging directory
 * @param {{ name: string, camel: string, kebab: string, storyTitle: string }} names
 * @param {(absPath: string, content: string) => Promise<void>} writeFileWx
 */
export async function createUI(stagingDir, names, writeFileWx) {
  for (const file of uiFiles(names)) {
    await writeFileWx(path.join(stagingDir, file.relPath), file.content);
  }
}
