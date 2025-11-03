require('dotenv').config();
require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const userRoutes = require('./routes/userRoutes');
const foodRoutes = require('./routes/foodRoutes');
const mealRoutes = require('./routes/mealRoutes');
const progressRoutes = require('./routes/progressRoutes');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Defaults for environment variables for ease of testing / execução em memória
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/users', userRoutes);
app.use('/foods', foodRoutes);
app.use('/meals', mealRoutes);
app.use('/progress', progressRoutes);

// Error handler
// next is required by Express to recognize this as an error-handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const HttpError = require('./errors/HttpError');
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  // unexpected errors
  // log full error in non-production
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Erro Interno do Servidor', stack: err.stack });
  }
  return res.status(500).json({ error: 'Erro Interno do Servidor' });
});

// Start server only when executed directly. Tests can import the app without starting the server.
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('Servidor rodando na porta', port));
}

module.exports = app;
