export const CSP_NONCE_PLACEHOLDER = '__START_UI_CSP_NONCE__';

const CSP_NONCE_META_SELECTOR = 'meta[property="csp-nonce"]';

export const replaceCspNoncePlaceholder = (value: string, nonce: string) =>
  value.replaceAll(CSP_NONCE_PLACEHOLDER, nonce);

export async function replaceCspNoncePlaceholderInHtmlResponse(
  response: Response,
  nonce: string
) {
  if (!shouldReplaceCspNoncePlaceholder(response)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.delete('Content-Length');

  return new Response(
    replaceCspNoncePlaceholder(await response.text(), nonce),
    {
      headers,
      status: response.status,
      statusText: response.statusText,
    }
  );
}

export function readCspNonceFromMeta() {
  if (typeof document === 'undefined') return undefined;

  const element = document.querySelector(CSP_NONCE_META_SELECTOR);
  if (!element) return undefined;

  const nonce =
    'nonce' in element && typeof element.nonce === 'string'
      ? element.nonce
      : undefined;
  const attributeNonce = element.getAttribute('nonce') ?? undefined;
  const contentNonce =
    element instanceof HTMLMetaElement ? element.content : undefined;

  return nonce || attributeNonce || contentNonce;
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
