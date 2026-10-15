import { Code } from '@/shared/ui/Code';
import React from 'react';
import SkillsCode from './SkillsCode/SkillsCode';
import styles from './Skills/Skills.module.scss';

export interface SkillsCodeWrapperProps {
  /** Localized role, passed down to the hook-free `SkillsCode` snippet */
  role: string;
  /** Localized focus line, passed down to the hook-free `SkillsCode` snippet */
  focus: string;
  /** Copy result callback — wired to the shared toast channel by the parent */
  onCopyResult: (success: boolean) => void;
}

/**
 * Presentational wrapper for the `developer.ts` snippet at the top of Skills.
 *
 * Layout + surface styling live in `Skills.module.scss`: the outer
 * `.codeBlockWrapper` owns width and spacing, `.codeBlock` owns the surface
 * skin passed down to `Code`.
 *
 * MUST stay hook-free. It renders `Code`, and `Code` calls its function
 * children as plain functions inside a `useMemo` (`useCopyCode` →
 * `extractTextFromNode`). A hook anywhere under `Code` — in this wrapper or in
 * `SkillsCode` — is executed from inside another hook's callback, React throws
 * "Do not call Hooks inside useMemo", and the whole tree unmounts. So every
 * localized value and the toast callback arrive as props; the owning section
 * (`SkillsInner`) is the only place allowed to call `useLanguage`/`useToast`.
 */
export const SkillsCodeWrapper: React.FC<SkillsCodeWrapperProps> = ({
  role,
  focus,
  onCopyResult,
}) => (
  <div className={styles.codeBlockWrapper}>
    <Code
      variant="block"
      title="developer.ts"
      language="TypeScript"
      copyable
      showLineNumbers
      className={styles.codeBlock}
      onCopyResult={onCopyResult}
    >
      <SkillsCode role={role} focus={focus} />
    </Code>
  </div>
);
