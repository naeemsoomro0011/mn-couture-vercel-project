// Vercel serverless entry point.
//
// Unlike some Express projects, src/app.js here already exports a plain,
// self-contained Express app - it doesn't call app.listen() or touch the
// database itself (server.js does that separately for local dev). That
// makes this file very small: just connect to MongoDB once per warm
// function instance (instead of on every request), then hand the request
// straight to the existing app.
//
// Note this DB-connect step has to run *before* delegating to `app`,
// rather than as an app.use(...) added on afterwards - by the time this
// file requires app.js, all of its routes are already wired up, so an
// app.use() added here would never run early enough to gate them.

require('dotenv').config();

const connectDB = require('../src/config/db');
const seedDefaults = require('../src/utils/seedDefaults');
const app = require('../src/app');

let dbReady = null;

module.exports = (req, res) => {
  if (!dbReady) {
    dbReady = connectDB()
      .then(() => seedDefaults())
      .catch((err) => {
        // Let the NEXT request try again instead of staying broken for
        // the lifetime of this warm function instance.
        dbReady = null;
        throw err;
      });
  }

  dbReady
    .then(() => app(req, res))
    .catch((err) => {
      console.error('[api/index] DB connection failed:', err.message);
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Service temporarily unavailable, please try again.' }));
    });
};
