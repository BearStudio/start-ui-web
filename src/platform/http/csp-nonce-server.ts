import { randomBytes } from 'node:crypto';

export const createCspNonce = () => randomBytes(18).toString('base64');
