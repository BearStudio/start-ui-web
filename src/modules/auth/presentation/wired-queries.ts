import { type AuthQueryFacade, createAuthQueries } from './queries';
import { authServerFunctions } from '../server';

export const authQueries = createAuthQueries({
  currentSession: authServerFunctions.currentSession,
} satisfies AuthQueryFacade);
