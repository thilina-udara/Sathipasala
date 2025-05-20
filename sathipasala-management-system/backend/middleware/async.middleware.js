/**
 * Async handler to wrap async controller functions
 * Eliminates need for try-catch blocks in controller functions
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
