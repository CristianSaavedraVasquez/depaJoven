const express   = require("express");
const router    = express.Router();
const { unlink } = require('fs-extra');
const passport = require('passport');
const bodyParser = require("body-parser");
const Admin  = require('../models/admin');
const Users   = require('../models/user');
const authFunc  = require("../passport/auth-functions");
const Taller = require('../models/taller');
const Modulo = require('../models/modulo');

var loggedIn = false;

router.use(express.urlencoded({extended: false}));
router.use(bodyParser.urlencoded({extended:true}));

router.get('/adminLogin', authFunc.checkNotAuthenticated, function(req, res){
    res.render('./admin/adminLogin', {loggedIn: req.isAuthenticated()});
});

router.post('/adminLogin', authFunc.checkNotAuthenticated , passport.authenticate('local-signin-admin', {
  successRedirect: '/admin/usuarios',
  failureRedirect: '/adminLogin',
  failureFlash: true
}));

router.get('/adminSignup', authFunc.checkNotAuthenticated, function(req, res){
    res.render('./admin/adminSignup', {loggedIn: req.isAuthenticated()});
});

router.post('/adminSignup', authFunc.checkNotAuthenticated , passport.authenticate('local-signup-admin', {
  successRedirect: '/admin/usuarios',
  failureRedirect: '/adminSignup',
  failureFlash: true
}))

router.get('/admin/adminProfile', function(req,res) {
    res.render('./admin/adminprofile');
});


//rutas que usan el nuevo modelo de usuario
router.get('/admin/usuarios', (req, res)=>{
  try {
    const users = Users.find((err, usrs) =>{
      if(err) throw new Error(err);
      if(!usrs) throw new Error('Users not found');
      return usrs;
    });
    res.render('./admin/Usuarios', {usuarios:users});
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
});

router.get('/admin/nuevoUsuario', async (req, res)=>{
  try {
    const talleres = await Taller.find((err, talleres) =>{
      if(err) throw new Error(err);
      if(!talleres) throw new Error('Talleres not found')
      return talleres; 
    });
    res.render('./admin/nuevoUsuario', {talleres: talleres});
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
});

router.post('/admin/nuevoUsuario', passport.authenticate('local-signup-user',{
  successRedirect: '/admin/lista',
  failureRedirect: '<h1>no se pudo crear el perfil</h1>',
  failureFlash: true
}))

router.get('/admin/lista', async (req, res) => {
  try {
    const users = await Users.find((err, usuarios) => {
      if(err) throw new Error(err);
      if(!usuarios) throw new Error('User not found');
      return usuarios;
    });
    res.render('./admin/listaEstudiante', {usuarios: users});
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
