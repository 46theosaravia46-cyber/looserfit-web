const mongoose = require('mongoose');

const familyImageSchema = new mongoose.Schema({
    src: { type: String, required: true },
    titulo: { type: String, default: '' },
    descripcion: { type: String, default: '' },
}, { _id: false });

const homeContentSchema = new mongoose.Schema({
    // Discriminador de marca — cada marca tiene su propio contenido home
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    heroImages: [{ type: String }],
    familyImages: { type: [familyImageSchema], default: [] },
    comingSoon: {
        enabled: { type: Boolean, default: false },
        launchDate: { type: Date },
        message: { type: String, default: 'Web prendida próximamente en:' },
        subtitle: { type: String, default: '' },
        emailMessage: { type: String, default: '' }
    },
    featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

// Índice único: solo puede existir un HomeContent por marca
homeContentSchema.index({ brand: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('HomeContent', homeContentSchema);
