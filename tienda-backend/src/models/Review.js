const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Discriminador de marca — las reseñas pertenecen a una marca específica
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    clienteNombre: { type: String },
    fotoUrl: { type: String, required: true },
    comentario: { type: String },
    visible: { type: Boolean, default: true }
});

module.exports = mongoose.model('Review', reviewSchema);