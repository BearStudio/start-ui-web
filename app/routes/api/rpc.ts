import { createAPIFileRoute } from '@tanstack/react-start/api';

import { APIRoute as BaseAPIRoute } from './rpc.$';

export const APIRoute = createAPIFileRoute('/api/rpc')(BaseAPIRoute.methods);
