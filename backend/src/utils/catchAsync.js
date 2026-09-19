// Wraps an async route handler so any rejected promise is forwarded to
// Express's error handler instead of crashing the server.
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
