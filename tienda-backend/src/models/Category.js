const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    // Discriminador de marca — cada marca tiene sus propias categorías
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Índice compuesto: el nombre de categoría es único por marca
categorySchema.index({ brand: 1, name: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Category', categorySchema);
