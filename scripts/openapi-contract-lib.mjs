/**
 * Shared helpers for the OpenAPI snapshot / contract scripts.
 *
 * Environment:
 *   OPENAPI_URL / OPENAPI_SNAPSHOT_URL / OPENAPI_SPEC_URL  - source spec URL
 *   OPENAPI_SNAPSHOT / OPENAPI_SNAPSHOT_PATH / ...         - snapshot file path
 *   OPENAPI_ACTUAL / OPENAPI_ACTUAL_PATH                  - override for the live spec (check only)
 *   SLICE_ROOT                                           - repo root override (compat with other scripts)
 *
 * CLI flags:
 *   --root=<dir>, --url=<url>, --snapshot=<path>, --output=<path>, --actual=<path>
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_OPENAPI_URL = 'http://localhost:3000/openapi.json';
export const DEFAULT_SNAPSHOT_RELATIVE = 'src/shared/api/openapi.json';

/**
 * Resolve the repository root, honoring `--root=` and `SLICE_ROOT`.
 * @param {string[]} [argv]
 * @returns {string}
 */
export function resolveRoot(argv = process.argv.slice(2)) {
  const ROOT_FLAG = '--root=';
  const flag = argv.find((arg) => arg.startsWith(ROOT_FLAG));
  const fromFlag = flag ? flag.slice(ROOT_FLAG.length) : '';
  if (fromFlag) return path.resolve(fromFlag);
  if (process.env.SLICE_ROOT) return path.resolve(process.env.SLICE_ROOT);
  if (process.env.OPENAPI_ROOT) return path.resolve(process.env.OPENAPI_ROOT);
  if (process.env.CONTRACT_ROOT) return path.resolve(process.env.CONTRACT_ROOT);
  // scripts/ -> repo root
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(moduleDir, '..');
}

// Scripts live in scripts/, so default root is parent of scripts dir, not cwd.
// The above would yield scripts/.. = repo root. Keep a cwd fallback for direct tests.
function normalizeRoot(root) {
  // Ensure we never accidentally point at `scripts` itself when invoked unusually.
  return path.resolve(root);
}

/**
 * Read a CLI flag value, supporting `--name=value` and `--name value`.
 * @param {string[]} argv
 * @param {string} name
 * @returns {string | undefined}
 */
export function getArg(argv, name) {
  const eqFlag = argv.find((arg) => arg.startsWith(`--${name}=`));
  if (eqFlag) return eqFlag.slice(name.length + 3);
  const idx = argv.indexOf(`--${name}`);
  if (idx !== -1 && idx + 1 < argv.length && !String(argv[idx + 1]).startsWith('--')) {
    return argv[idx + 1];
  }
  return undefined;
}

/**
 * Source URL for the OpenAPI document.
 * @param {string[]} [argv]
 * @returns {string}
 */
export function resolveOpenApiUrl(argv = process.argv.slice(2)) {
  const explicit =
    getArg(argv, 'url') ||
    process.env.OPENAPI_URL ||
    process.env.OPENAPI_SNAPSHOT_URL ||
    process.env.OPENAPI_SPEC_URL;
  if (explicit) return explicit;

  const base = process.env.OPENAPI_BASE_URL || process.env.API_URL || process.env.API_BASE_URL;
  if (base) {
    const trimmed = base.replace(/\/+$/, '');
    return trimmed.endsWith('/openapi.json') ? trimmed : `${trimmed}/openapi.json`;
  }

  return DEFAULT_OPENAPI_URL;
}

/**
 * Absolute path of the checked-in snapshot file.
 * @param {string[]} [argv]
 * @returns {string}
 */
export function resolveSnapshotPath(argv = process.argv.slice(2)) {
  const explicit =
    getArg(argv, 'snapshot') ||
    getArg(argv, 'output') ||
    process.env.OPENAPI_SNAPSHOT ||
    process.env.OPENAPI_SNAPSHOT_PATH ||
    process.env.OPENAPI_SNAPSHOT_FILE ||
    process.env.OPENAPI_FILE ||
    process.env.SNAPSHOT_PATH;

  const root = resolveRoot(argv);
  if (explicit) {
    return path.isAbsolute(explicit) ? explicit : path.resolve(root, explicit);
  }
  return path.resolve(root, DEFAULT_SNAPSHOT_RELATIVE);
}

/**
 * Resolve the "actual" document location (check:contract override).
 * @param {string[]} [argv]
 * @returns {string}
 */
export function resolveActualPath(argv = process.argv.slice(2)) {
  return (
    getArg(argv, 'actual') ||
    getArg(argv, 'live') ||
    process.env.OPENAPI_ACTUAL ||
    process.env.OPENAPI_ACTUAL_PATH ||
    process.env.OPENAPI_LIVE ||
    resolveOpenApiUrl(argv)
  );
}

function isFileProtocol(value) {
  return /^file:/i.test(value);
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(value);
}

/**
 * Load an OpenAPI document from a URL or a local file path.
 * @param {string} location
 * @returns {Promise<any>}
 */
export async function fetchOpenApi(location) {
  let target = location;
  if (isFileProtocol(target)) {
    target = target.replace(/^file:\/\//i, '');
    if (process.platform === 'win32' && /^\/[a-zA-Z]:/.test(target)) {
      target = target.slice(1);
    }
  }

  if (!isHttpUrl(target) && !isFileProtocol(location)) {
    // Treat as filesystem path.
    const raw = await readFile(path.resolve(target), 'utf8');
    return JSON.parse(raw);
  }

  if (isFileProtocol(location)) {
    const raw = await readFile(path.resolve(target), 'utf8');
    return JSON.parse(raw);
  }

  const response = await fetch(target);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch OpenAPI document: ${response.status} ${response.statusText} (${target})`
    );
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      `OpenAPI response is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Write a snapshot as pretty JSON.
 * @param {string} filePath
 * @param {any} document
 * @returns {Promise<void>}
 */
export async function writeSnapshot(filePath, document) {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
}

/**
 * Stable canonical serialization (key order independent).
 * @param {any} value
 * @returns {string}
 */
export function canonicalize(value) {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = sortKeys(value[key]);
    }
    return out;
  }
  return value;
}

/**
 * Structural diff between two OpenAPI documents.
 * @param {any} expected
 * @param {any} actual
 * @param {string} [basePath]
 * @returns {string[]}
 */
export function diffOpenApi(expected, actual, basePath = '') {
  const result = [];
  diff(expected, actual, basePath, result);
  return result;
}

function diff(expected, actual, currentPath, result) {
  const pathLabel = currentPath || '(root)';

  if (expected === actual) return;

  const expectedType = typeOf(expected);
  const actualType = typeOf(actual);
  if (expectedType !== actualType) {
    result.push(`${pathLabel}: type changed (${expectedType} -> ${actualType})`);
    return;
  }

  if (expectedType !== 'object' && expectedType !== 'array') {
    if (expected !== actual) {
      result.push(`${pathLabel}: ${JSON.stringify(expected)} -> ${JSON.stringify(actual)}`);
    }
    return;
  }

  if (Array.isArray(expected)) {
    const max = Math.max(expected.length, actual.length);
    for (let i = 0; i < max; i++) {
      const itemPath = `${pathLabel}[${i}]`;
      if (i >= expected.length) {
        result.push(`${itemPath}: added ${summarize(actual[i])}`);
      } else if (i >= actual.length) {
        result.push(`${itemPath}: removed ${summarize(expected[i])}`);
      } else {
        diff(expected[i], actual[i], itemPath, result);
      }
    }
    return;
  }

  const keys = new Set([...Object.keys(expected || {}), ...Object.keys(actual || {})]);
  for (const key of [...keys].sort()) {
    const childPath = currentPath ? `${currentPath}.${key}` : key;
    if (!(key in (expected || {}))) {
      result.push(`${childPath}: added ${summarize(actual[key])}`);
    } else if (!(key in (actual || {}))) {
      result.push(`${childPath}: removed ${summarize(expected[key])}`);
    } else {
      diff(expected[key], actual[key], childPath, result);
    }
  }
}

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function summarize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `array(${value.length})`;
  const keys = Object.keys(value);
  return `object{${keys.slice(0, 5).join(', ')}${keys.length > 5 ? ', ...' : ''}}`;
}

/**
 * Root resolution helper retained for legacy compat; resolves to repo root.
 * @returns {string}
 */
export function defaultRoot() {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  return normalizeRoot(path.resolve(moduleDir, '..'));
}
