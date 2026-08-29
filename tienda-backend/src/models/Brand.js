/**
 * Brand.js — Modelo de Mongoose para la colección `brands`.
 * Cada documento representa una marca del sistema (Looser Fit, Looser Sport, etc.).
 * Es la entidad raíz del sistema multi-marca: todos los demás modelos
 * referencian su ObjectId a través del campo `brand`.
 */

const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  // Identificador único legible por humanos. Ej: 'fit', 'sport'
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  // Nombre público de la marca. Ej: 'Looser Fit', 'Looser Sport'
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // Si está en false, el middleware retorna 422 para peticiones de esa marca
  enabled: {
    type: Boolean,
    default: true,
  },

  // Orden de aparición en listas (1 = primero)
  order: {
    type: Number,
    default: 1,
  },

  // URL del logo de la marca (subido a Cloudinary o ruta pública)
  logo: {
    type: String,
    default: '',
  },

  // Tokens de diseño por marca (reservado para personalización futura)
  theme: {
    primaryColor: { type: String, default: '#0d0d0d' },
    secondaryColor: { type: String, default: '#f5f3ef' },
    accentColor: { type: String, default: '#c8b89a' },
    fontFamily: { type: String, default: 'Inter' },
    borderRadius: { type: String, default: '0px' },
  },

  // Metadatos SEO de la página principal de cada marca
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    ogImage: { type: String, default: '' },
  },

  // Configuraciones operativas de la marca
  settings: {
    // Coming Soon global (bloquea la tienda pública de esta marca)
    comingSoon: { type: Boolean, default: false },
    // Modo mantenimiento (retorna 503 en peticiones públicas)
    maintenanceMode: { type: Boolean, default: false },
  },

}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
