import { withSwagger } from 'next-swagger-doc';

import { openApi as register } from './jhipster-mocks/register';

const swaggerHandler = withSwagger({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JHipster API emulation',
      version: '0.1.0',
    },
    servers: [{ url: '/api/jhipster-emulation' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    paths: {
      ...register,
    },
  },
  apiFolder: 'src/pages/api',
});

export default swaggerHandler();
