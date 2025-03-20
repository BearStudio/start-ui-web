import { createAPIFileRoute } from '@tanstack/react-start/api';

import { APIRoute as BaseAPIRoute } from './rest.$';

export const APIRoute = createAPIFileRoute('/api/rest')(BaseAPIRoute.methods);
