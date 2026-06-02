const express = require('express');
const cors = require('cors');
const { PORT } = require('./src/config/env');
const routes = require('./src/routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

// Health
app.get('/', (req, res) => res.json({ status: 'ok' }));

// Error handler (fallback)
app.use(require('./src/middleware/errorHandler'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
