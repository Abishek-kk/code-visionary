// Very small in-memory rate limiter for development only
const windows = new Map();
module.exports = (limit = 60) => (req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const window = windows.get(key) || { count: 0, start: now };
  if (now - window.start > 60_000) { window.count = 0; window.start = now; }
  window.count += 1;
  windows.set(key, window);
  if (window.count > limit) return res.status(429).json({ error: 'Rate limit exceeded' });
  next();
};
