import { tsRestFetchApi } from '@ts-rest/core';
import { initQueryClient } from '@ts-rest/react-query';

import { AUTH_TOKEN_KEY } from '@/features/auth/AuthContext';
import { isBrowser } from '@/lib/ssr';

import { contract } from './contract';

export const client = initQueryClient(contract, {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  baseHeaders: {
    'Content-Type': 'application/json',
  },
  api: async (args) => {
    const token = isBrowser ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (token) {
      args.headers['Authorization'] = `Bearer ${token}`;
    }
    return tsRestFetchApi(args);
  },
});
