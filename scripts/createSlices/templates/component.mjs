/**
 * Component template — plan §4.5.1 (rev.4, gate-verified).
 *
 * Rules enforced by content: `classNames` from the ONLY allowed path
 * (`@/shared/lib/utils/classNames`, plan §2.7), props imported from
 * `../../model/types/types` (component sits in `ui/<Name>/`, REQ-T2), no i18n/text (none generated, plan §2.6), no `console`,
 * no `any`, no unused imports (`memo` only — `ReactNode` lives in Props).
 *
 * @param {{ name: string, camel: string, kebab: string }} names
 * @param {{ skeleton?: boolean }} [options] skeleton = Plan-files extra
 *   (REQ-G16): the body carries a `// TODO(spec):` marker pointing at the spec
 *   — burned when the component is implemented.
 * @returns {string}
 */
export function componentTemplate(names, { skeleton = false } = {}) {
  const { name, camel, kebab } = names;
  const marker = skeleton ? '  // TODO(spec): implement per ../../spec/SPEC.md\n' : '';
  return `import { memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import styles from './${name}.module.scss';
import type { ${name}Props } from '../../model/types/types';

export const ${name} = memo(function ${name}({ className, children, 'data-testid': testId = '${kebab}' }: ${name}Props) {
${marker}  return (
    <div className={classNames(styles.${camel}, {}, [className])} data-testid={testId}>
      {children}
    </div>
  );
});
`;
}
