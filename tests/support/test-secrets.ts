import { randomBytes } from 'node:crypto';

const DEFAULT_RANDOM_BYTES = 18;
const SHORT_RANDOM_BYTES = 4;
const STRONG_RANDOM_BYTES = 24;

const normalizeLabelPart = (value: string) => {
  let normalized = '';
  let needsSeparator = false;

  for (const char of value.toLowerCase()) {
    const code = char.charCodeAt(0);
    const isDigit = code >= 48 && code <= 57;
    const isLowercaseLetter = code >= 97 && code <= 122;

    if (isDigit || isLowercaseLetter) {
      if (needsSeparator && normalized) normalized += '-';
      normalized += char;
      needsSeparator = false;
      continue;
    }

    needsSeparator = Boolean(normalized);
  }

  return normalized;
};

export function makeTestSecret(
  label = 'value',
  byteLength = DEFAULT_RANDOM_BYTES
) {
  const normalizedLabel = normalizeLabelPart(label);
  const randomPart = randomBytes(byteLength).toString('base64url');

  return [normalizedLabel, randomPart].filter(Boolean).join('-');
}

export const makeShortTestSecret = (label?: string) =>
  makeTestSecret(label, SHORT_RANDOM_BYTES);

export const makeStrongTestSecret = (label?: string) =>
  makeTestSecret(label, STRONG_RANDOM_BYTES);
