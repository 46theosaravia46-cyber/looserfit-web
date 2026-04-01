const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    clienteNombre: { type: String },
    fotoUrl: { type: String, required: true },
    comentario: { type: String },
    visible: { type: Boolean, default: true }
});

module.exports = mongoose.model('Review', reviewSchema);