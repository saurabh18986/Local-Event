const passport = require('passport');

/**
 * Protect routes — requires a valid JWT Bearer token.
 * Attaches req.user if valid.
 */
const protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = { protect };
