// NOTE: This backend is optional. The frontend (TanStack Start)
// handles AI calls via server functions in src/lib/.
// Use this server only if deploying frontend as a pure static build.
const express = require('express');
const cors = require('cors');
const { PORT, FRONTEND_URL } =
  require('./src/config/env');
const routes = require('./src/routes');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
];

if (FRONTEND_URL) {
  FRONTEND_URL.split(',').forEach(url => {
    const trimmed = url.trim();
    if (trimmed) allowedOrigins.push(trimmed);
  });
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) || 
                      /^https?:\/\/localhost:\d+$/.test(origin) ||
                      /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }

    console.warn(`CORS request from unlisted origin: ${origin}`);
    return callback(null, true);
  },
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
