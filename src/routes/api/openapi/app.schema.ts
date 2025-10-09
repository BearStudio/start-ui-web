import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';

import { envClient } from '@/env/client';
import { router } from '@/server/router';

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export const Route = createFileRoute('/api/openapi/app/schema')({
  server: {
    handlers: {
      GET: async () => {
        const spec = await generator.generate(router, {
          info: {
            title: 'Application API',
            version: '1.0.0',
            description: `API Reference for the application.<br /><br /><a href="${envClient.VITE_BASE_URL}/api/openapi/auth">Go the <strong>Auth API</strong> documentation</a>`,
          },
          servers: [
            {
              url: `${envClient.VITE_BASE_URL}/api/rest`,
            },
          ],
          security: [
            {
              apiKeyCookie: [],
              bearerAuth: [],
            },
          ],
          components: {
            securitySchemes: {
              apiKeyCookie: {
                type: 'apiKey',
                in: 'cookie',
                name: 'apiKeyCookie',
                description: 'API Key authentication via cookie',
              },
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                description: 'Bearer token authentication',
              },
            },
          },
        });

        return json(spec);
      },
    },
  },
});
