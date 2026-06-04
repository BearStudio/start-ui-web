import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createCspNonceBridgeScript,
  CSP_NONCE_PLACEHOLDER,
  readCspNonceFromMeta,
  replaceCspNoncePlaceholderInHtmlResponse,
} from '@/platform/http/csp-nonce';
import {
  appendVaryHeader,
  applySecurityHeaders,
  buildContentSecurityPolicy,
  getSecurityHeaders,
} from '@/platform/http/security-headers';

const directiveValue = (policy: string, directiveName: string) =>
  policy
    .split('; ')
    .find((directive) => directive.startsWith(`${directiveName} `));

const cspHashSources = (directive: string | undefined) =>
  directive?.match(/'sha256-[^']+'/g) ?? [];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('security headers', () => {
  it('builds an enforced CSP with configured image and connection origins', () => {
    const policy = buildContentSecurityPolicy({
      baseUrl: 'https://app.example',
      isProduction: true,
      s3BucketPublicUrl: 'https://assets.example/books',
    });

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("form-action 'self'");
    expect(directiveValue(policy, 'script-src')).toBe("script-src 'self'");
    expect(policy).toContain("script-src-attr 'none'");
    expect(directiveValue(policy, 'style-src')).toBe(
      "style-src 'self' 'unsafe-inline'"
    );
    expect(policy).toContain("style-src-attr 'unsafe-inline'");
    expect(policy).toContain(
      "img-src 'self' data: blob: https://assets.example https://raw.githubusercontent.com"
    );
    expect(policy).toContain("connect-src 'self' https://assets.example");
    expect(policy).not.toContain('sentry.io');
    expect(policy).toContain("font-src 'self' data:");
    expect(policy).toContain("manifest-src 'self'");
    expect(policy).toContain("media-src 'self' blob:");
    expect(policy).toContain("worker-src 'self' blob:");
    expect(policy).toContain("frame-src 'none'");
    expect(policy).toContain('upgrade-insecure-requests');
  });

  it('adds a CSP nonce for script and style elements when provided', () => {
    const policy = buildContentSecurityPolicy({
      cspNonce: 'test-nonce',
    });

    expect(directiveValue(policy, 'script-src')).toBe(
      "script-src 'self' 'nonce-test-nonce'"
    );
    expect(directiveValue(policy, 'style-src')).toBe(
      "style-src 'self' 'nonce-test-nonce'"
    );
    expect(directiveValue(policy, 'style-src-attr')).toBe(
      "style-src-attr 'unsafe-inline'"
    );
  });

  it('can allow Playwright screenshot styles outside production only', () => {
    const testPolicy = buildContentSecurityPolicy({
      allowPlaywrightScreenshotStyles: true,
      cspNonce: 'test-nonce',
      isProduction: false,
    });
    const productionPolicy = buildContentSecurityPolicy({
      allowPlaywrightScreenshotStyles: true,
      cspNonce: 'test-nonce',
      isProduction: true,
    });

    expect(
      cspHashSources(directiveValue(testPolicy, 'style-src'))
    ).toHaveLength(2);
    expect(
      cspHashSources(directiveValue(productionPolicy, 'style-src'))
    ).toHaveLength(0);
  });

  it('can relax script and style sources for the local test dev server only', () => {
    const testPolicy = buildContentSecurityPolicy({
      allowDevServerCspRelaxations: true,
      cspNonce: 'test-nonce',
      isProduction: false,
    });
    const productionPolicy = buildContentSecurityPolicy({
      allowDevServerCspRelaxations: true,
      cspNonce: 'test-nonce',
      isProduction: true,
    });

    expect(directiveValue(testPolicy, 'script-src')).toBe(
      "script-src 'self' 'nonce-test-nonce' 'unsafe-eval'"
    );
    expect(directiveValue(testPolicy, 'style-src')).toBe(
      "style-src 'self' 'nonce-test-nonce' 'unsafe-inline'"
    );
    expect(directiveValue(testPolicy, 'style-src-elem')).toBe(
      "style-src-elem 'self' 'unsafe-inline'"
    );
    expect(directiveValue(productionPolicy, 'script-src')).toBe(
      "script-src 'self' 'nonce-test-nonce'"
    );
    expect(directiveValue(productionPolicy, 'style-src')).toBe(
      "style-src 'self' 'nonce-test-nonce'"
    );
    expect(directiveValue(productionPolicy, 'style-src-elem')).toBeUndefined();
  });

  it('does not add HTTPS upgrade directives outside production HTTPS', () => {
    expect(
      buildContentSecurityPolicy({
        baseUrl: 'http://localhost:3000',
        isProduction: true,
      })
    ).not.toContain('upgrade-insecure-requests');
    expect(
      buildContentSecurityPolicy({
        baseUrl: 'https://app.example',
        isProduction: false,
      })
    ).not.toContain('upgrade-insecure-requests');
  });

  it('returns security headers without report-only CSP', () => {
    const headers = getSecurityHeaders({
      isProduction: true,
    });

    expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
    expect(headers['Content-Security-Policy-Report-Only']).toBeUndefined();
    expect(headers['Cross-Origin-Opener-Policy']).toBe(
      'same-origin-allow-popups'
    );
    expect(headers['Cross-Origin-Resource-Policy']).toBe('same-origin');
    expect(headers['Origin-Agent-Cluster']).toBe('?1');
    expect(headers['Strict-Transport-Security']).toBe(
      'max-age=63072000; includeSubDomains; preload'
    );
  });

  it('applies security headers and removes stale report-only CSP', () => {
    const response = new Response('ok', {
      headers: {
        'Content-Security-Policy-Report-Only': "default-src 'none'",
      },
    });

    applySecurityHeaders(response);

    expect(response.headers.get('Content-Security-Policy')).toContain(
      "default-src 'self'"
    );
    expect(response.headers.get('Content-Security-Policy-Report-Only')).toBe(
      null
    );
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('appends Vary values without losing existing values or adding duplicates', () => {
    const response = new Response('ok', {
      headers: {
        Vary: 'Cookie, origin',
      },
    });

    appendVaryHeader(response, ['Origin', 'Sec-Fetch-Site', 'Referer']);

    expect(response.headers.get('Vary')).toBe(
      'Cookie, origin, Sec-Fetch-Site, Referer'
    );
  });

  it('keeps wildcard Vary as the only value', () => {
    const response = new Response('ok', {
      headers: {
        Vary: 'Cookie, *',
      },
    });

    appendVaryHeader(response, ['Origin']);

    expect(response.headers.get('Vary')).toBe('*');
  });

  it('replaces Vite CSP nonce placeholders in HTML responses', async () => {
    const response = new Response(
      `<meta property="csp-nonce" content="${CSP_NONCE_PLACEHOLDER}" nonce="${CSP_NONCE_PLACEHOLDER}"><script nonce="${CSP_NONCE_PLACEHOLDER}"></script>`,
      {
        headers: {
          'Content-Length': '999',
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    );

    const replaced = await replaceCspNoncePlaceholderInHtmlResponse(
      response,
      'request-nonce'
    );

    await expect(replaced.text()).resolves.toBe(
      '<meta property="csp-nonce" content="request-nonce" nonce="request-nonce"><script nonce="request-nonce"></script>'
    );
    expect(replaced.headers.get('Content-Length')).toBe(null);
    expect(replaced.headers.get('Content-Type')).toBe(
      'text/html; charset=utf-8'
    );
  });

  it('adds the request nonce to SSR style tags without replacing existing style nonces', async () => {
    const response = new Response(
      '<style>.base-ui-disable-scrollbar{scrollbar-width:none}</style><style data-test="x" nonce="existing-nonce">.already{color:red}</style>',
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );

    const replaced = await replaceCspNoncePlaceholderInHtmlResponse(
      response,
      'request-nonce'
    );

    await expect(replaced.text()).resolves.toBe(
      '<style nonce="request-nonce">.base-ui-disable-scrollbar{scrollbar-width:none}</style><style data-test="x" nonce="existing-nonce">.already{color:red}</style>'
    );
  });

  it('does not replace Vite CSP nonce placeholders in non-HTML responses', async () => {
    const response = new Response(
      JSON.stringify({ nonce: CSP_NONCE_PLACEHOLDER }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const replaced = await replaceCspNoncePlaceholderInHtmlResponse(
      response,
      'request-nonce'
    );

    expect(replaced).toBe(response);
    await expect(replaced.text()).resolves.toBe(
      JSON.stringify({ nonce: CSP_NONCE_PLACEHOLDER })
    );
  });

  it('replaces split Vite CSP nonce placeholders without reading the whole response first', async () => {
    const response = new Response(
      streamTextChunks([
        `<script nonce="${CSP_NONCE_PLACEHOLDER.slice(0, 8)}`,
        CSP_NONCE_PLACEHOLDER.slice(8, 19),
        `${CSP_NONCE_PLACEHOLDER.slice(19)}"></script>`,
      ]),
      {
        headers: {
          'Content-Length': '999',
          'Content-Type': 'text/html',
        },
      }
    );
    const textSpy = vi.spyOn(response, 'text');

    const replaced = await replaceCspNoncePlaceholderInHtmlResponse(
      response,
      'request-nonce'
    );

    expect(textSpy).not.toHaveBeenCalled();
    expect(replaced.headers.get('Content-Length')).toBe(null);
    await expect(replaced.text()).resolves.toBe(
      '<script nonce="request-nonce"></script>'
    );
  });

  it('streams rewritten script chunks before the HTML response closes', async () => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
    const response = new Response(
      new ReadableStream<Uint8Array>({
        start(streamController) {
          controller = streamController;
        },
      }),
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
    const replaced = await replaceCspNoncePlaceholderInHtmlResponse(
      response,
      'request-nonce'
    );
    const reader = replaced.body?.getReader();

    controller?.enqueue(
      encoder.encode(
        `${'x'.repeat(80)}<script nonce="${CSP_NONCE_PLACEHOLDER}"></script>${'y'.repeat(80)}`
      )
    );

    const firstChunk = await reader?.read();
    expect(firstChunk?.done).toBe(false);
    expect(decoder.decode(firstChunk?.value)).toContain(
      '<script nonce="request-nonce"></script>'
    );

    controller?.close();
    reader?.releaseLock();
  });

  it('nonces style tags whose opening tag is split across streamed chunks', async () => {
    const response = new Response(
      streamTextChunks(['<sty', 'le data-test="x"', '>.a{color:red}</style>']),
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );

    const replaced = await replaceCspNoncePlaceholderInHtmlResponse(
      response,
      'request-nonce'
    );

    await expect(replaced.text()).resolves.toBe(
      '<style nonce="request-nonce" data-test="x">.a{color:red}</style>'
    );
  });

  it('nonces uppercase style opening tags split across streamed chunks', async () => {
    const response = new Response(
      streamTextChunks(['<ST', 'YLE data-test="x"', '>.a{color:red}</STYLE>']),
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );

    const replaced = await replaceCspNoncePlaceholderInHtmlResponse(
      response,
      'request-nonce'
    );

    await expect(replaced.text()).resolves.toBe(
      '<style nonce="request-nonce" data-test="x">.a{color:red}</STYLE>'
    );
  });

  it('preserves an existing style nonce when its opening tag is split across streamed chunks', async () => {
    const response = new Response(
      streamTextChunks([
        '<sty',
        'le nonce="existing-nonce" data-test="x"',
        '>.a{color:red}</style>',
      ]),
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );

    const replaced = await replaceCspNoncePlaceholderInHtmlResponse(
      response,
      'request-nonce'
    );

    await expect(replaced.text()).resolves.toBe(
      '<style nonce="existing-nonce" data-test="x">.a{color:red}</style>'
    );
  });

  it('does not buffer a complete client entry script while waiting for response close', async () => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
    const response = new Response(
      new ReadableStream<Uint8Array>({
        start(streamController) {
          controller = streamController;
        },
      }),
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
    const replaced = await replaceCspNoncePlaceholderInHtmlResponse(
      response,
      'request-nonce'
    );
    const reader = replaced.body?.getReader();

    controller?.enqueue(
      encoder.encode(
        '<script type="module" async src="/@id/virtual:tanstack-start-dev-client-entry" nonce="request-nonce"></script>'
      )
    );

    const firstChunk = await reader?.read();
    expect(firstChunk?.done).toBe(false);
    expect(decoder.decode(firstChunk?.value)).toContain(
      '<script type="module" async src="/@id/virtual:tanstack-start-dev-client-entry" nonce="request-nonce"></script>'
    );

    controller?.close();
    reader?.releaseLock();
  });

  it('reads the CSP nonce from meta content before browser-hidden nonce attributes', () => {
    const getAttribute = vi
      .fn<(name: string) => string>()
      .mockReturnValueOnce('request-nonce')
      .mockReturnValueOnce('');
    const querySelector = vi.fn(() => ({
      getAttribute,
      nonce: '',
    }));
    vi.stubGlobal('document', { querySelector });

    expect(readCspNonceFromMeta()).toBe('request-nonce');
    expect(querySelector).toHaveBeenCalledWith('meta[property="csp-nonce"]');
    expect(getAttribute).toHaveBeenNthCalledWith(1, 'content');
  });

  it('falls back to nonce property and nonce attribute when meta content is empty', () => {
    const attributeValues = new Map([
      ['content', ''],
      ['nonce', 'attribute-nonce'],
    ]);
    const getAttribute = vi.fn((name: string) => attributeValues.get(name));
    const querySelector = vi.fn(() => ({
      getAttribute,
      nonce: 'property-nonce',
    }));
    vi.stubGlobal('document', { querySelector });

    expect(readCspNonceFromMeta()).toBe('property-nonce');
    expect(getAttribute).toHaveBeenNthCalledWith(1, 'content');
    expect(getAttribute).not.toHaveBeenCalledWith('nonce');

    querySelector.mockReturnValueOnce({
      getAttribute,
      nonce: '',
    });

    expect(readCspNonceFromMeta()).toBe('attribute-nonce');
  });

  it('creates a bridge script that exposes the nonce and nonces dynamic style elements', () => {
    type FakeElement = {
      getAttribute: (name: string) => string | undefined;
      setAttribute: (name: string, value: string) => void;
    };
    class FakeDocument {
      createElement() {
        const attributes = new Map<string, string>();

        return {
          getAttribute: (name: string) => attributes.get(name),
          setAttribute: (name: string, value: string) => {
            attributes.set(name, value);
          },
        };
      }
    }
    const fakeWindow = {};
    vi.stubGlobal('window', fakeWindow);
    vi.stubGlobal('Document', FakeDocument);

    new Function(createCspNonceBridgeScript('bridge-nonce'))();

    const document = new FakeDocument() as unknown as Document;
    const styleElement = document.createElement(
      'style'
    ) as unknown as FakeElement;
    const divElement = document.createElement('div') as unknown as FakeElement;

    expect(window.__nonce__).toBe('bridge-nonce');
    expect(window.__startUiCspNonceBridgeInstalled).toBe(true);
    expect(styleElement.getAttribute('nonce')).toBe('bridge-nonce');
    expect(divElement.getAttribute('nonce')).toBeUndefined();
  });
});

function streamTextChunks(chunks: string[]) {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
}
