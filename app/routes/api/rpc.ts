import { createAPIFileRoute } from '@tanstack/start/api';

import { APIRoute as BaseAPIRoute } from './rpc.$';

export const APIRoute = createAPIFileRoute('/api/rpc')(BaseAPIRoute.methods);
