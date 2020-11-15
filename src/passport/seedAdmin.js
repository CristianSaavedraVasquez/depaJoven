const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Admin   = require("../models/admin");

passport.serializeUser((newAdmin, done) => {
  done(null, newAdmin.id);
});

passport.deserializeUser(async (id, done) => {
  const newAdmin = await Admin.findById(id);
  done(null, newAdmin);
});

passport.use('local-signup-admin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  await Admin.findOne({username:username}, function(err, user){
    if(err){
      return done(err);
    } else{
      if (user){
        return done('Username Already exists!');
      } else{
        const admin = new Admin();
        admin.username = username;
        admin.password = admin.encryptPassword(password);
        admin.save()
        done(null, admin);
      }
    }
  });
}));

passport.use('local-signin-admin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, username, password, done) => {
  await Admin.findOne({username: username}, (err, admin) => {

    if(err){
      return done(err);
    }

    if(!admin) {
      return done(null, false, req.flash('signinMessageAdmin', 'No User Found'));
    }
    if(!admin.comparePassword(password)) {
      return done(null, false, req.flash('signinMessageAdmin', 'Incorrect Password'));
    }


    return done(null, admin);
  });
}));
