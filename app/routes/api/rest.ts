import { createAPIFileRoute } from '@tanstack/start/api';

import { APIRoute as BaseAPIRoute } from './rest.$';

export const APIRoute = createAPIFileRoute('/api/rest')(BaseAPIRoute.methods);
