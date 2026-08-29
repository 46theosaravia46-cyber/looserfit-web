/**
 * migrate-add-brand.js — Migración: asignar brand 'fit' a documentos existentes.
 * Busca todos los documentos sin campo `brand` en cada colección
 * y les asigna el ObjectId de la marca 'fit' (Looser Fit).
 *
 * Es IDEMPOTENTE: correrlo dos veces no modifica documentos que ya tienen brand.
 * Loguea el conteo de documentos modificados por colección.
 *
 * USO: node tienda-backend/scripts/migrate-add-brand.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Importar modelos (en el orden correcto para evitar dependencias circulares)
const Brand = require('../src/models/Brand');
const Product = require('../src/models/product');
const Category = require('../src/models/Category');
const Order = require('../src/models/Order');
const HomeContent = require('../src/models/HomeContent');
const Review = require('../src/models/Review');

async function migrateBrand() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');
    console.log('🚀 Iniciando migración: asignar brand=fit a documentos existentes...\n');

    // Obtener el ObjectId de la marca 'fit'
    const fitBrand = await Brand.findOne({ slug: 'fit' });
    if (!fitBrand) {
      console.error('❌ Error: No se encontró la marca "fit" en la base de datos.');
      console.error('   Primero corré: node scripts/seed-brands.js');
      process.exit(1);
    }

    const fitId = fitBrand._id;
    console.log(`📌 Brand 'fit' encontrada (ID: ${fitId})\n`);

    // Lista de colecciones a migrar
    const colecciones = [
      { nombre: 'products',     modelo: Product },
      { nombre: 'categories',   modelo: Category },
      { nombre: 'orders',       modelo: Order },
      { nombre: 'homecontents', modelo: HomeContent },
      { nombre: 'reviews',      modelo: Review },
    ];

    let totalModificados = 0;

    for (const { nombre, modelo } of colecciones) {
      // Filtro: documentos que no tienen el campo brand (o es null)
      const filtro = { brand: { $exists: false } };
      const update = { $set: { brand: fitId } };

      const result = await modelo.updateMany(filtro, update);
      const modificados = result.modifiedCount;
      totalModificados += modificados;

      if (modificados > 0) {
        console.log(`✅ ${nombre}: ${modificados} documento(s) actualizado(s) → brand=fit`);
      } else {
        console.log(`⏭️  ${nombre}: 0 documentos para migrar (todos ya tienen brand)`);
      }
    }

    console.log('\n📊 Resumen de migración:');
    console.log(`   Total de documentos migrados: ${totalModificados}`);
    console.log('\n🏁 Migración completada exitosamente.');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB.');
  }
}

migrateBrand();
