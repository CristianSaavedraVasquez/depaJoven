const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

passport.serializeUser((newUser, done) => {
  done(null, newUser.id);
});

passport.deserializeUser(async (id, done) => {
  const newUser = await User.findById(id);
  done(null, newUser);
});

/* passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  tallerField: 'taller',
  nombreField: 'nombre',
  telefonoField: 'telefono',
  //runField: 'run',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const user = await User.findOne({'email': email})
  console.log(user)
  if(user) {
    return done(null, false, req.flash('signupMessage', 'The Email is already Taken.'));
  } else {
    const newUser = new User();
    newUser.email = email;
    newUser.taller = req.body.taller;
    newUser.nombre = req.body.nombre;
    newUser.telefono = req.body.telefono;
    //newUser.rut = req.body.run;
    newUser.password = newUser.encryptPassword(password);
  console.log(newUser)
    await newUser.save();
    done(null, newUser);
  }
}));

passport.use('local-signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const user = await User.findOne({email: email});
  if(!user) {
    return done(null, false, req.flash('signinMessage', 'No User Found'));
  }
  if(!user.comparePassword(password)) {
    return done(null, false, req.flash('signinMessage', 'Incorrect Password'));
  }
  return done(null, user);
}));
 */