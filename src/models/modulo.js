const mongoose = require('mongoose');

const {Schema} = mongoose;

const moduloSchema = {
    nombre: String,
    contenido: String,
    evaluacion: String,
    duracion: String,
    video_path: String,
    material_path: String
}

module.exports = mongoose.model('modulo', moduloSchema);