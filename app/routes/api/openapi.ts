import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod';
import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';

import { router } from '@/server/router';

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export const APIRoute = createAPIFileRoute('/api/openapi')({
  GET: async () => {
    const spec = await generator.generate(router, {
      info: {
        title: 'Planet API',
        version: '1.0.0',
      },
    });

    return json(spec);
  },
});
