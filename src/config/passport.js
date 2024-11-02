// src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const personService = require('../services/persons.service');
const service = new personService();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/v1/persons/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const emailDomain = profile.emails[0].value.split('@')[1];
        if (emailDomain !== 'ubiobio.cl' && emailDomain !== 'alumnos.ubiobio.cl') {
            return done(null, false, { message: 'Dominio de correo no permitido' });
        }

        const user = await service.findOrCreateGoogleUser(profile);
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await service.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
