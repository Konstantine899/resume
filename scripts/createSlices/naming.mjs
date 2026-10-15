/**
 * Naming helpers for the slice generator (plan §2.3.1 / REQ-G3).
 *
 * The CLI argument is a PascalCase slice name; every other artifact name is
 * derived from it deterministically:
 *
 * | Artifact                    | Rule                       | Example (`ContactForm`) |
 * | --------------------------- | -------------------------- | ----------------------- |
 * | directory / component       | argument as-is             | `ContactForm`           |
 * | RTK name, store key, file   | `arg[0].toLowerCase()+…`   | `contactForm`           |
 * | SCSS class                  | camelCase                  | `.contactForm`          |
 * | story title                 | `<LayerPascal>/<Name>`     | `Features/ContactForm`  |
 * | `data-testid` (default)     | kebab                      | `contact-form`          |
 *
 * The kebab rule `replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()` keeps
 * digits intact: `Contact2` → `contact2`, `OAuthClient2` → `oauth-client2`.
 */

/**
 * PascalCase → camelCase (first character only, per plan §2.3.1).
 * @param {string} name
 * @returns {string}
 */
export function toCamel(name) {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

/**
 * PascalCase → kebab-case (default `data-testid`).
 * @param {string} name
 * @returns {string}
 */
export function toKebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * `features` → `Features` (story-title layer segment).
 * @param {string} layer
 * @returns {string}
 */
export function toLayerPascal(layer) {
  return layer.charAt(0).toUpperCase() + layer.slice(1);
}

/**
 * Derive every name the templates need from `<Layer> <SliceName>`.
 * @param {string} layer FSD layer (must come from the SSOT generatorLayers)
 * @param {string} sliceName PascalCase slice name from the CLI
 * @param {boolean} [withSlice] whether the redux slice files are generated
 * @returns {{
 *   layer: string,
 *   name: string,
 *   camel: string,
 *   kebab: string,
 *   layerPascal: string,
 *   storyTitle: string,
 *   withSlice: boolean,
 * }}
 */
export function deriveNames(layer, sliceName, withSlice = false) {
  const camel = toCamel(sliceName);
  const kebab = toKebab(sliceName);
  const layerPascal = toLayerPascal(layer);
  return {
    layer,
    name: sliceName,
    camel,
    kebab,
    layerPascal,
    storyTitle: `${layerPascal}/${sliceName}`,
    withSlice,
  };
}
