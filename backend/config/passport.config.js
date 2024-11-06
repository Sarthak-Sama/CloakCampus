const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');

// Local strategy for login
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Invalid email' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid password' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// JWT strategy for securing routes
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};
passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
        const user = await userModel.findById(jwtPayload._id);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
}));

// Serialize user to store in session (optional, if you're using sessions)
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
