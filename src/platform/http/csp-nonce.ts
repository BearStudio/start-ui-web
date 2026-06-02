export const CSP_NONCE_PLACEHOLDER = '__START_UI_CSP_NONCE__';

const CSP_NONCE_META_SELECTOR = 'meta[property="csp-nonce"]';
const CSP_NONCE_GLOBAL_KEY = '__nonce__';
const CSP_NONCE_BRIDGE_INSTALLED_KEY = '__startUiCspNonceBridgeInstalled';
const STYLE_OPEN_TAG_PREFIX = '<style';
const STYLE_OPEN_TAG_PATTERN = /<style\b([^>]*)>/gi;
const NONCE_ATTRIBUTE_PATTERN = /\snonce\s*=/i;

declare global {
  interface Window {
    __nonce__?: string;
    __startUiCspNonceBridgeInstalled?: boolean;
  }
}

export const replaceCspNoncePlaceholder = (value: string, nonce: string) =>
  value.replaceAll(CSP_NONCE_PLACEHOLDER, nonce);

const escapeHtmlAttribute = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const addNonceToStyleTags = (value: string, nonce: string) =>
  value.replace(STYLE_OPEN_TAG_PATTERN, (tag, attributes: string) =>
    NONCE_ATTRIBUTE_PATTERN.test(attributes)
      ? tag
      : `<style nonce="${escapeHtmlAttribute(nonce)}"${attributes}>`
  );

const rewriteHtmlNonceMarkers = (value: string, nonce: string) =>
  addNonceToStyleTags(replaceCspNoncePlaceholder(value, nonce), nonce);

export const createCspNonceBridgeScript = (nonce: string) => `
(function(nonceKey, installedKey, nonce) {
  var win = window;
  win[nonceKey] = nonce;
  if (win[installedKey]) return;
  win[installedKey] = true;
  if (typeof Document === "undefined") return;

  var prototype = Document.prototype;
  var createElement = prototype.createElement;
  prototype.createElement = function(tagName, options) {
    var element = createElement.call(this, tagName, options);
    if (
      typeof tagName === "string" &&
      tagName.toLowerCase() === "style" &&
      !element.getAttribute("nonce")
    ) {
      element.setAttribute("nonce", win[nonceKey] || nonce);
    }
    return element;
  };
})(${JSON.stringify(CSP_NONCE_GLOBAL_KEY)}, ${JSON.stringify(
  CSP_NONCE_BRIDGE_INSTALLED_KEY
)}, ${JSON.stringify(nonce)});
`;

export async function replaceCspNoncePlaceholderInHtmlResponse(
  response: Response,
  nonce: string
) {
  const body = response.body;

  if (!body || !shouldReplaceCspNoncePlaceholder(response)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete('Content-Length');

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let bufferedText = '';

  const transformStream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      bufferedText += decoder.decode(chunk, { stream: true });

      const { output, remaining } = replaceBufferedCspNoncePlaceholders(
        bufferedText,
        nonce
      );
      bufferedText = remaining;

      if (output) {
        controller.enqueue(encoder.encode(output));
      }
    },
    flush(controller) {
      bufferedText += decoder.decode();

      if (bufferedText) {
        controller.enqueue(
          encoder.encode(rewriteHtmlNonceMarkers(bufferedText, nonce))
        );
      }
    },
  });

  return new Response(body.pipeThrough(transformStream), {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export function readCspNonceFromMeta() {
  if (typeof document === 'undefined') return undefined;

  const element = document.querySelector(CSP_NONCE_META_SELECTOR);
  if (!element) return undefined;

  return (
    element.getAttribute('content') ||
    (isElementWithNonceProperty(element) ? element.nonce : undefined) ||
    element.getAttribute('nonce') ||
    undefined
  );
}

function shouldReplaceCspNoncePlaceholder(response: Response) {
  if (!response.body) return false;
  if (response.status === 204 || response.status === 304) return false;
  if (response.headers.has('Content-Encoding')) return false;

  return response.headers
    .get('Content-Type')
    ?.toLowerCase()
    .includes('text/html');
}

function replaceBufferedCspNoncePlaceholders(value: string, nonce: string) {
  const searchableLength = getSearchableHtmlLength(value);
  const output = rewriteHtmlNonceMarkers(
    value.slice(0, searchableLength),
    nonce
  );

  return {
    output,
    remaining: value.slice(searchableLength),
  };
}

function getSearchableHtmlLength(value: string) {
  const placeholderTailLength = getPrefixTailLength(
    value,
    CSP_NONCE_PLACEHOLDER
  );
  const stylePrefixTailLength = getPrefixTailLength(
    value.toLowerCase(),
    STYLE_OPEN_TAG_PREFIX
  );
  const searchableLength = Math.max(
    0,
    value.length - Math.max(placeholderTailLength, stylePrefixTailLength)
  );
  const searchableValue = value.slice(0, searchableLength);
  const lastStyleOpenTagStart = searchableValue
    .toLowerCase()
    .lastIndexOf(STYLE_OPEN_TAG_PREFIX);

  if (
    lastStyleOpenTagStart >= 0 &&
    searchableValue.indexOf('>', lastStyleOpenTagStart) === -1
  ) {
    return lastStyleOpenTagStart;
  }

  return searchableLength;
}

function getPrefixTailLength(value: string, prefix: string) {
  const maxTailLength = Math.min(value.length, prefix.length - 1);

  for (let length = maxTailLength; length > 0; length--) {
    if (value.endsWith(prefix.slice(0, length))) {
      return length;
    }
  }

  return 0;
}

function isElementWithNonceProperty(
  element: Element
): element is Element & { nonce: string } {
  return 'nonce' in element && typeof element.nonce === 'string';
}
