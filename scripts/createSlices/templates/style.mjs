/**
 * Style template — plan §4.5.4 (gate-verified).
 *
 * The inner comment is mandatory: an empty block is a stylelint
 * `block-no-empty` error and an empty file is `no-empty-source`. The camel
 * class matches `selector-class-pattern ^[a-z][\w-]*$`. No `@use`, no raw
 * hex — design tokens go through `var(--…)`.
 *
 * @param {{ camel: string }} names
 * @returns {string}
 */
export function styleTemplate(names) {
  return `.${names.camel} {
  /* styles go here */
}
`;
}
