const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const HttpError = require('./middlewares/httpError');

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  if (req.body === null || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next(new HttpError(400, 'El cuerpo de la solicitud debe ser un objeto JSON.'));
  }
  return next();
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
