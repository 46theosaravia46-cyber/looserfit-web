const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    precio: { type: Number, required: true },
    precioOferta: { type: Number },
    categoria: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true 
    },
    tipo: { 
        type: String, 
        default: 'regular'
    },
    talles: [{ type: String }], // Ejemplo: ["S", "M", "L"]
    imagenes: [{ type: String }],
    stock: { type: Number, default: 0 },
    publicado: { type: Boolean, default: false }, // "Ocultar o poner visible"
    esNuevoDrop: { type: Boolean, default: false }, // Para la sección de "Últimas novedades"
    guiaTalles: { type: String } // Guía de medidas (texto o URL)
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);