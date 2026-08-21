const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// ── JWT Strategy ──────────────────────────────────────────────────────────────
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).select('-password');
      if (user) return done(null, user);
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

// ── Google OAuth Strategy ─────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) return done(null, user);

          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profileImage: profile.photos[0]?.value || '',
            authProvider: 'google',
          });

          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
}

module.exports = passport;
