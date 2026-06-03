const express = require('express');
const cors = require('cors');
const { PORT, FRONTEND_URL } =
  require('./src/config/env');
const routes = require('./src/routes');

const app = express();

app.use(cors({
  origin: FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '50kb' }));

app.use('/api', routes);

app.get('/', (req, res) =>
  res.json({ status: 'ok', service: 'algovision' })
);

app.use(require('./src/middleware/errorHandler'));

app.listen(PORT, () =>
  console.log(
    `AlgoVision backend running on port ${PORT}`
  )
);
