import { memo } from 'react';
import { SkillsInner } from './SkillsInner';

/**
 * Компонент Skills отображает технологический стек разработчика в виде сетки категорий
 * @param props - Пропсы компонента
 * @param props.className - Дополнительные CSS-классы
 * @param props.data-testid - Test ID для тестирования
 * @returns React компонент секции навыков
 */
export const Skills = memo(SkillsInner);
Skills.displayName = 'Skills';
