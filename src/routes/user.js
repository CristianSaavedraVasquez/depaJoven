const express = require('express');
const router  = express.Router();

const { unlink }       = require('fs-extra');
const uuid             = require('uuid');
const passport         = require('passport');
const bodyParser       = require("body-parser");
const path             = require('path');
const pdf              = require('html-pdf');
const ejs              = require("ejs");
const fs               = require('fs');
const multer           = require('multer');
const User             = require('../models/user');
const Taller           = require('../models/taller');
const Modulo           = require("../models/modulo");

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/video/upload'),
    filename: (req, file, cb, filename) => {
        cb(null, uuid() + path.extname(file.originalname));
    } 
}); 

const imgStorage = multer.diskStorage({
    destination: path.join(__dirname, '../public/img/profilePics'),
    filename: (req, file, cb, filename) =>{
        cb(null, uuid() + path.extname(file.originalname));
    }
});

router.use(express.urlencoded({extended: false}));
router.use(bodyParser.urlencoded({extended: true}));

const upload = multer({
    storage:storage
});

const uploadImg = multer({
    storage:imgStorage
})

router.get('/rev/login', (req, res)=>{
    res.render('./users/login');
});

router.post('/rev/login', passport.authenticate('local-login-user',{
    successRedirect: '/rev/user',
    failureRedirect: '/rev/login',
    failureFlash: true
}));

router.get('/rev/user', async (req, res)=>{
    try {
        const user = await User.findById(req.session.passport.user, (err, usr)=>{
            if(err) throw new Error(err);
            if (!usr) throw new Error('User not found');
            return usr;
        });

        if(user.isProfesor == 'on'){
            res.redirect('/rev/profesor');
        } else {
            res.redirect('/rev/estudiantes');
        }

    } catch (error) {
        console.log(error);
        return res.redirect('/');   
    }
});

router.get('/rev/profesor', async(req,res)=>{
    try {
        const user = await User.findById(req.session.passport.user, async (err, usr) =>{
            if(err) throw new Error(err)
            if(!usr) throw new Error('User not found');
            if(!usr.isProfesor == 'on') throw new Error('Access Denied')
            return usr;
        });

        const tall = await Taller.find({_id:{ $in: user.Profesor.talleres } } );

        res.render('./rev/profesores', {profesor:user, talleres: tall});

    } catch (error) {
        console.log(error);
        return res.redirect('/');    
    }
});

router.get('/rev/profesor/creartaller', async(req,res)=>{
    try {
        const user = await User.findById(req.session.passport.user, (err, usr) =>{
            if(err) throw new Error(err)
            if(!usr) throw new Error('User not found');
            if(!usr.isProfesor == 'on') throw new Error('Access Denied')
            return usr;
        });

        res.render('./rev/crearTaller', {profesor:user});

    } catch (error) {
        console.log(error);
        return res.redirect('/');
    }
});

router.post('/rev/profesor/creartaller', async (req, res) =>{
    try {
        const user = await User.findById(req.session.passport.user, async (err, usr) =>{
            if(err) throw new Error(err)
            if(!usr) throw new Error('User not found');
            if(!usr.isProfesor == 'on') throw new Error('Access Denied');
            return usr;
        });

        const nuevoTaller = new Taller();
        nuevoTaller.nombre = req.body.nombre;
        nuevoTaller.descripcion = req.body.descripcion;
        nuevoTaller.objetivo = req.body.objetivo;
        nuevoTaller.horario = req.body.horario;
        nuevoTaller.profesor = user._id;
        await nuevoTaller.save();

        let listaDeTalleres = user.Profesor.talleres;
        listaDeTalleres.push(nuevoTaller._id);

        const updateProfesor = {
            talleres:listaDeTalleres,
            instagram: user.Profesor.instagram,
            facebook: user.Profesor.facebook,
            linkedin: user.Profesor.linkedin
        }

        await User.findByIdAndUpdate(req.session.passport.user, {Profesor: updateProfesor});

        res.redirect('/rev/profesor');

    } catch (error) {
        console.log(error);
        return res.redirect('/');
    }
});

router.get('/rev/profesor/taller/:idTaller', async (req, res)=>{
    try {
        const taller = await Taller.findById(req.params.idTaller, (err, taller) =>{
            if(err) throw new Error(err);
            if(!taller) throw new Error('Taller not found')
            return taller;
        });
        res.render('./rev/administrartaller', {taller:taller});

    } catch (error) {
        console.log(error);
        return res.redirect('/');
    }
});


router.post('/rev/profesor/taller/:idTaller', upload.fields([{ name: 'video' }, { name: 'material' }]), async (req,res) => {
    try {
        const user = await User.findById(req.session.passport.user, async (err, usr) =>{
            if(err) throw new Error(err)
            if(!usr) throw new Error('User not found');
            if(!usr.isProfesor == 'on') throw new Error('Access Denied');
            return usr;
        });

        const nuevoModulo = new Modulo();
        nuevoModulo.nombre = req.body.nombre;
        nuevoModulo.contenido = req.body.contenido;
        nuevoModulo.evaluacion = req.body.evaluacion;
        nuevoModulo.duracion = req.body.duracion;
        nuevoModulo.video_path = req.files.video[0].path;
        nuevoModulo.material_path = req.files.material[0].path; 

        await nuevoModulo.save();

        const taller = await Taller.findById(req.params.idTaller, async (err, t) =>{
            if(err) throw new Error(err);
            if(!t) throw new Error('Taller not found')
            return t;
        });

        let modulosLista = taller.modulos;

        modulosLista.push(nuevoModulo._id);
        
        await Taller.findOneAndUpdate({_id: taller._id}, {modulos: modulosLista});

        console.log(nuevoModulo);

        res.redirect('/rev/profesor');

    } catch (error) {
        console.log(error);
        return res.redirect('/');
    }
});

router.get('/rev/estudiantes', async (req, res) => {
    try {
        const user = await User.findById(req.session.passport.user, async(err, usr) =>{
            if(err) throw new Error(err);
            if(!usr) throw new Error('User not found')
            if(usr.isProfesor == 'on') throw new Error('Access Denied');
            return usr;
        });
        
        const taller = await Taller.findById(user.taller.id, (err, taller)=>{
            if(err) throw err;
            if(!taller) throw new Error('Taller not found')
            return taller;
        });

        res.render('./rev/estudiantes', {estudiante:user, taller: taller});

    } catch (error) {
        console.log(error);
        return res.redirect('/');
    }
});

router.post('/rev/estudiantes', async(req, res) =>{
    try {
        await User.findById(req.session.passport.user, async (err, usr) =>{
            if(err) throw new Error(err);
            if(!usr) throw new Error('User not found')
            return usr;
        });
    } catch (error) {
        console.log(error);
        return res.redirect('/');
    }
});

router.get('/rev/estudiante/estado', async(req, res) => {
    try {
        const user = await User. findById(req.session.passport.user, (err, usr) =>{
            if(err) throw new Error(err);
            if(!usr) throw new Error('User not found')
            return usr;
        })

        const taller = await Taller.findById(usr.taller.id, (err, taller)=>{
            if(err) throw new Error(err);
            if(!taller) throw new Error('Taller not found')
            return taller;
        });

        res.render('./rev/alumnoFin', {estudiante: user, taller: taller});

    } catch (error) {
        console.log(error);
        return res.redirect('/');
    }
});

router.get('/rev/estudiante/certificado', async(req, res) => {
    try {
        const user = await User.findById(req.session.passport.user, (err, usr) =>{
            if(err) throw new Error(err);
            if(!usr) throw new Error('User not found')
            if(usr.isProfesor == 'on') throw new Error('Access Denied');
            return usr;
        })

        const taller = Taller.findById(user.taller.id, (err, taller)=>{
            if(err) throw new Error(err);
            if(!taller) throw new Error('Taller not found')
            return taller;
        });

        res.render('./rev/alumnoFin', {estudiante: user, taller: taller});

    } catch (error) {
        console.log(error);
        return res.redirect('/');
    }
});

// Foto de Perfil
router.post('/rev/fotoPerfil', uploadImg.single('foto'), async (req, res) =>{
    try {
        if(!req.session.hasOwnProperty('passport')) throw new Error('Session expired');

        await User.findByIdAndUpdate({_id: req.session.passport.user}, {profilePic: req.file.path});
        res.redirect('/rev/user');
    } catch (error) {
        
    }
});

// Render pdf

router.get('/certificado', async (req, res) => {
    try {
        const user = await User.findById(req.session.passport.user, (err, usr) =>{
            if(err) throw new Error(err);
            if(!usr) throw new Error('User not found')
            if(usr.taller.estado == 'Aprobado') throw new Error('Access Denied');
            return usr;
        });

        const taller = await Taller.findById(user.taller.id, (err, taller) => {
            if(err) throw new Error(err);
            if(!taller) throw new Error('Taller not found')
            return taller;
        });

        const document = ejs.renderFile(path.join(__dirname, '../views/rev/certificado.ejs'), {estudiante: user, taller:taller}, (err, data) => {
            if(err) throw new Error(err);
            if(!data) throw new Error('Data not found')
            return data;
        });

        pdf.create(document).toFile('./src/public/certificados/'+ user.nombre +'.pdf', function(err, document) {
            if(err) throw new Error(err);
            res.send('File created successfully');
        });

    } catch (error) {
        console.log(error);
        return res.redirect('/');    
    }
});

module.exports = router;
