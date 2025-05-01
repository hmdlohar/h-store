/**
 * Wraps async route handlers to automatically catch errors
 * @param {Function} fn The async route handler function
 * @returns {Function} Wrapped route handler that catches errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler; 