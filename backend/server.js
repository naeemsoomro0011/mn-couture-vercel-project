require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const seedDefaults = require('./src/utils/seedDefaults');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDefaults();

  app.listen(PORT, () => {
    console.log(`🚀 MN Couture API running on http://localhost:${PORT}`);
  });
};

// Was a bare `startServer()` before, relying on connectDB()'s own
// process.exit(1). connectDB() now throws instead (see src/config/db.js -
// needed so the same function stays safe to call from the Vercel
// serverless entry point too), so the exit-on-failure behavior for a
// normal server is handled here instead.
startServer().catch((err) => {
  console.error('[Server] Failed to start:', err.message);
  process.exit(1);
});
