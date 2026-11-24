import { afterEach } from 'vitest';
import { cleanup } from 'vitest-browser-react';

afterEach(cleanup);

declare global {
  var __UI_SDK_STRICT__: boolean | undefined;
}
globalThis.__UI_SDK_STRICT__ = true;
