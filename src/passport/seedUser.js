const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');
const Taller = require('../models/taller');

passport.serializeUser((newUser, done) => {
    done(null, newUser.id);
});

passport.deserializeUser(async (userID, done)=>{
    await User.findById(userID, (err, user)=>{
        if(err){
            console.log(err);
        }else{
            done(null, user);
        }
    });
});

passport.use('local-signup-user', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    nombreField: 'nombre',
    telefonoField: 'telefono',
    runField: 'run',
    isProfesorField: 'isProfesor',
    instagramField: 'instagram',
    facebookField: 'facebook',
    linkedin: 'linkedin',
    taller: 'taller',
    passReqToCallback: true
}, async (req, email, password, done)=>{
    await User.findOne({email:email}, async (err, usr) =>{
        if(err){
            done(err);
        }
        if(usr){
            done(null, false, req.flash('Email ya Ingresado'));
        } else {
            const newUser = new User();
            newUser.email = email;
            newUser.nombre = req.body.nombre;
            newUser.telefono = req.body.telefono;
            newUser.run = req.body.run; 
            newUser.isProfesor = req.body.isProfesor;

            if(newUser.isProfesor == 'on'){
                newUser.Profesor.instagram = req.body.instagram;
                newUser.Profesor.facebook = req.body.facebook;
                newUser.Profesor.linkedin = req.body.linkedin;
            } else {

                newUser.taller = {
                    id: req.body.taller,
                    estado: 'En Progreso',
                }

                Taller.findOneAndUpdate({_id: req.body.taller}, { $push: {alumnos:newUser._id}}, (err, res) =>{
                    if(err){
                        console.log(`ERROR: ${err}`)
                    }
                    console.log(res);
                });
            }

            newUser.save();
            return done(null, newUser);
        }
    });
}));

passport.use('local-login-user', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async(req,email, password, done)=>{
    await User.findOne({email:email}, (err,usr)=>{
        if(err){
            return done(err);
        }
        if(!usr){
            return done(null, false, req.flash('loginMessage', 'No existe este Usuario'));
        }

        return done(null, usr);
    });
}));