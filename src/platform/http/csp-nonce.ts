export const CSP_NONCE_PLACEHOLDER = '__START_UI_CSP_NONCE__';

const CSP_NONCE_META_SELECTOR = 'meta[property="csp-nonce"]';

export const replaceCspNoncePlaceholder = (value: string, nonce: string) =>
  value.replaceAll(CSP_NONCE_PLACEHOLDER, nonce);

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
          encoder.encode(replaceCspNoncePlaceholder(bufferedText, nonce))
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
  const searchableLength = Math.max(
    0,
    value.length - (CSP_NONCE_PLACEHOLDER.length - 1)
  );
  let index = 0;
  let output = '';

  while (index < searchableLength) {
    const placeholderIndex = value.indexOf(CSP_NONCE_PLACEHOLDER, index);

    if (placeholderIndex === -1 || placeholderIndex >= searchableLength) {
      output += value.slice(index, searchableLength);
      index = searchableLength;
      break;
    }

    output += value.slice(index, placeholderIndex);
    output += nonce;
    index = placeholderIndex + CSP_NONCE_PLACEHOLDER.length;
  }

  return {
    output,
    remaining: value.slice(index),
  };
}

function isElementWithNonceProperty(
  element: Element
): element is Element & { nonce: string } {
  return 'nonce' in element && typeof element.nonce === 'string';
}
