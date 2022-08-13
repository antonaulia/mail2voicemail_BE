require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = YAML.load('./swagger.yaml');

// database
const { sequelize } = require('./database');

// configs
const corsConfig = require('./configs/cors');

const usersRouter = require('./routes/users');
const companyRouter = require('./routes/companies');
const authRouter = require('./routes/auth');
const EmailRouter = require('./routes/emails');
const AttachmentRouter = require('./routes/attachments');

const app = express();

// test database connection and create database
(async () => {
  await sequelize.authenticate();
  await sequelize.sync();
})();

// cors middleware
app.use(cors(corsConfig));
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// API docs router
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// regular router
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/company', companyRouter);
app.use('/api/email', EmailRouter);
app.use('/api/attachment', AttachmentRouter);

// handle 404
app.all('*', (_, res) => {
  res.status(404).json({ meta: { message: '404 Route not found' } });
});

module.exports = app;
