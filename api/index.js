// Vercel serverless entrypoint: re-export the Express app as the handler.
const app = require('../app');

module.exports = app;
