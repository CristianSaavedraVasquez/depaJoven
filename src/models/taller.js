const mongoose = require('mongoose');

const {Schema} = mongoose;

const tallerSchema = new Schema({
    nombre: String,
    descripcion: String,
    objetivo: String,
    horario: String,
    profesor: String,
    isTermino: String,
    modulos: [],
    alumnos: []
})

module.exports = mongoose.model('taller', tallerSchema);
