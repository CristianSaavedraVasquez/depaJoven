const express = require('express');
const router  = express.Router();

const { unlink }       = require('fs-extra');
const uuid             = require('uuid');
const passport         = require('passport');
const bodyParser       = require("body-parser");
const path             = require('path');
const multer           = require('multer');
const User             = require('../models/user');
const Taller           = require('../models/taller');
const Modulo           = require("../models/modulo");

router.get('/rev/taller', async(req, res) =>{
    try {
        const talleres = await Taller.find((err, talleres) =>{
            if(err) throw new Error(err)
            if(!talleres) throw new Error('Taller not found')
            return talleres;
        });

        res.render('./rev/talleres', { talleres:talleres } );

    } catch (error) {
        console.log(error);
        return res.redirect('/');
    }
});

router.get('/rev/taller/:idTaller', async(req, res) =>{
    try{
        const taller = await Taller.findById(req.params.idTaller, (err, taller) =>{
            if(err) throw new Error(err);
            if(!taller) throw new Error('Taller not found');
            return taller
        });

        let modules = [];
        let OrdersIds = [];

        taller.modulos.forEach(id => {
            OrdersIds.push(id);
        });

        modules = await Modulo.find({ _id: { $in: OrdersIds }}, (err, mds) =>{
            if(err) throw new Error(err);
            return mds;
        });

        res.render('./rev/taller', {taller:taller, modulos:modules});

    } catch(error){
        console.log(error);
        return res.redirect('/');
    }
});

router.get('/rev/taller/:idTaller/:idModulo', async(req, res) =>{
    try {
        const user = await User.findById(req.session.passport.user, async (err, usr) =>{
            if(err) throw new Error(err);
            return usr;
        }); 
        const taller = await Taller.findById(req.params.idTaller, async(err, taller) =>{
            if(err) throw new Error(err);
            if(!taller) throw new Error('Taller not found');
            return taller;
        });

        const modulo = await Modulo.findById(req.params.idModulo, (err, md) =>{
            if(err) throw new Error(err);
            if(!md) throw new Error('Modulo Not found')
            return md;
        });
        
        res.render('./rev/modulo', {taller:taller, modulo:modulo, usuario:user});

    } catch(error){
        console.log(error);
        return res.redirect('/');
    }
});

router.get('/rev/taller/:idTaller/:idModulo/delete', async(req, res) => {
    try {
        const taller = await Taller.findById(req.params.idTaller, async(err, taller) =>{
            if(err) throw new Error(err);
            if(!taller) throw new Error('Taller Not found')
            return taller;
        }); 
        const modulo = await Modulo.findById(req.params.idModulo, async(err, md) =>{
            if(err) throw(err);
            if(!md) throw new Error('Modulo Not found')
            return md;
        });

        await Modulo.findByIdAndDelete({ _id: modulo._id });
        res.redirect('/rev/user');

    } catch(error){
        console.log(error);
        return res.redirect('/');
    }
});

router.get('/rev/profesor/taller/:idTaller/finalizar', async(req, res) => {
    try {
        const user = await User.findById(req.session.passport.user, (err, usr) =>{
            if(err) throw new Error(err);
            if(!usr.isProfesor == "on") throw new Error('Permission denied');
            return usr; 
        });
        const taller = await Taller.findById(req.params.idTaller, async (err, taller) =>{
            if(err) throw new Error(err)
            if(!taller) throw new Error('Taller Not found');
            return taller;
        });

        const Alumnos = await User.find({_id: { $in: taller.alumnos } });
        res.render('./rev/finalizarTaller', {usr: user, taller: taller, alumnos: Alumnos});

    } catch(error){
        console.log(error);
        return res.redirect('/');
    }
});

router.post('/rev/profesor/taller/:idTaller/finalizar', async(req, res) =>{
    try {
        const user = await User.findById(req.session.passport.user, (err, usr) =>{
            if(err) throw new Error(err);
            if(!usr.isProfesor == "on") throw new Error('Access Denied');
            return usr;
        });
        const taller = await Taller.findById(req.params.idTaller, async(err, taller) =>{
           if(err) throw new Error(err);
           if(!taller) throw new Error('Taller not found');
           return taller;
        }); 

        const notas = req.body.nota;
        let testIds = [];

        if(Array.isArray(notas)){
            taller.alumnos.forEach((aID, index) =>{
                console.log(aID);
                testIds.push(aID);
            });
            await User.findOneAndUpdate({_id: { $in: testIds}}, {$set:{
                taller: {
                    id: taller._id,
                    estado: notas[index]
                }
            }}, (err, resDoc) =>{
                if(err) throw new Error(err);
                console.log(resDoc);
                res.redirect('/rev/user');
            });
        } else {
            console.log(taller.alumnos);
            await User.findOneAndUpdate({_id: taller.alumnos}, {$set:{
                taller: {
                    id: taller._id,
                    estado: notas
                }
            }}, (err, resDoc) =>{
                if(err) throw new Error(err);
                console.log(resDoc);
                res.redirect('/rev/user');
            });
        }

    } catch(error){
        console.log(error);
        return res.redirect('/');
    }
});

module.exports = router;