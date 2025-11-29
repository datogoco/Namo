const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LinkedInStrategy = require("passport-linkedin").Strategy;
const User = require("../models/userModel");

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Define local strategy for login
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        const isMatch = await user.correctPassword(password, user.password);

        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

const ensureOAuthUser = async ({ email, name, photo }) => {
  const existing = await User.findOne({ email });
  if (existing) return existing;

  const tempPassword = Math.random().toString(36).slice(-12);
  const user = new User({
    name: name || email.split("@")[0],
    email,
    password: tempPassword,
    photo,
  });
  await user.save();
  return user;
};

const defaultHost =
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://your-railway-backend-url"
    : "http://localhost:5000");

const googleCallback =
  process.env.GOOGLE_CALLBACK_URL || `${defaultHost}/auth/google/callback`;
const facebookCallback =
  process.env.FACEBOOK_CALLBACK_URL || `${defaultHost}/auth/facebook/callback`;
const linkedinCallback =
  process.env.LINKEDIN_CALLBACK_URL || `${defaultHost}/auth/linkedin/callback`;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: googleCallback,
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("[GOOGLE] Starting GoogleStrategy callback");
        console.log("[GOOGLE] Strategy callback triggered");
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const photo = profile.photos?.[0]?.value;
          if (!email) return done(null, false, { message: "No email from Google" });
          console.log("[GOOGLE] Google profile received:", profile);
          const user = await ensureOAuthUser({ email, name, photo });
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: facebookCallback,
        profileFields: ["id", "displayName", "emails", "photos"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const photo = profile.photos?.[0]?.value;
          if (!email) return done(null, false, { message: "No email from Facebook" });
          const user = await ensureOAuthUser({ email, name, photo });
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
}

if (process.env.LINKEDIN_KEY && process.env.LINKEDIN_SECRET) {
  passport.use(
    new LinkedInStrategy(
      {
        consumerKey: process.env.LINKEDIN_KEY,
        consumerSecret: process.env.LINKEDIN_SECRET,
        callbackURL: linkedinCallback,
        profileFields: ["id", "first-name", "last-name", "email-address", "picture-url"],
      },
      async (token, tokenSecret, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name =
            profile.displayName ||
            `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim();
          const photo = profile.photos?.[0]?.value;
          if (!email) return done(null, false, { message: "No email from LinkedIn" });
          const user = await ensureOAuthUser({ email, name, photo });
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
}
