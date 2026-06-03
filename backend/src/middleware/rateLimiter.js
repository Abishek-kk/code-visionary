// Memory-safe, proxy-aware in-memory rate limiter for production and development
const windows = new Map();
const WINDOW_MS = 60_000; // 1 minute

// Periodically clean up expired entries to prevent memory leaks (runs every 5 minutes)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, window] of windows.entries()) {
    if (now - window.start > WINDOW_MS) {
      windows.delete(key);
    }
  }
}, 300_000);

if (cleanupInterval && typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

module.exports = (limit = 30) => (req, res, next) => {
  // Get actual client IP from standard proxy headers first
  const key = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
              req.socket.remoteAddress || 
              req.ip || 
              'unknown';
              
  const now = Date.now();
  const window = windows.get(key) || { count: 0, start: now };
  
  if (now - window.start > WINDOW_MS) {
    window.count = 0;
    window.start = now;
  }
  
  window.count += 1;
  windows.set(key, window);
  
  if (window.count > limit) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait a minute and try again.' });
  }
  
  next();
};
