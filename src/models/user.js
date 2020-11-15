const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const path = require('path');

const { Schema } = mongoose;

const userSchema = new Schema({
    email: String,
    password: String,
    nombre: String,
    profilePic: String,
    telefono: String,
    run: String,
    taller: {
        id: String,
        estado: String
    },
    isProfesor: String, 
    Profesor: {
        talleres:[],
        instagram: String,
        facebook: String,
        linkedin: String
    },
});

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.comparePassword= function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('user', userSchema);