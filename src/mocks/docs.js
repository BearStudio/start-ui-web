const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi/buildOpenapi.json');

const app = express();
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(3005, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening at http://localhost:3005`);
});
