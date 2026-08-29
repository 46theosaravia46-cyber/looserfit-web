/**
 * verify-migration.js — Verifica integridad de la migración multi-marca.
 * Reporta por colección:
 *   - Total de documentos
 *   - Documentos por marca
 *   - Documentos huérfanos (sin brand) ← deben ser 0
 *
 * USO: node tienda-backend/scripts/verify-migration.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Brand       = require('../src/models/Brand');
const Product     = require('../src/models/product');
const Category    = require('../src/models/Category');
const Order       = require('../src/models/Order');
const HomeContent = require('../src/models/HomeContent');
const Review      = require('../src/models/Review');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener todas las marcas
    const brands = await Brand.find({}).sort({ order: 1 });
    if (brands.length === 0) {
      console.error('❌ No hay marcas en la colección brands. Corré primero: node scripts/seed-brands.js');
      process.exit(1);
    }

    console.log(`📋 Marcas registradas: ${brands.map(b => b.slug).join(', ')}\n`);
    console.log('═'.repeat(60));

    const colecciones = [
      { nombre: 'products',      modelo: Product },
      { nombre: 'categories',    modelo: Category },
      { nombre: 'orders',        modelo: Order },
      { nombre: 'homecontents',  modelo: HomeContent },
      { nombre: 'reviews',       modelo: Review },
    ];

    let totalHuerfanos = 0;

    for (const { nombre, modelo } of colecciones) {
      const total = await modelo.countDocuments();
      const huerfanos = await modelo.countDocuments({ brand: { $exists: false } });
      totalHuerfanos += huerfanos;

      console.log(`\n📁 ${nombre.toUpperCase()} (total: ${total})`);

      if (huerfanos > 0) {
        console.log(`   ⚠️  Documentos sin brand: ${huerfanos} ← REQUIERE ATENCIÓN`);
      } else {
        console.log(`   ✅ Sin documentos huérfanos`);
      }

      // Contar por cada marca
      for (const brand of brands) {
        const count = await modelo.countDocuments({ brand: brand._id });
        console.log(`   • ${brand.slug.padEnd(8)} → ${count} documento(s)`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    if (totalHuerfanos === 0) {
      console.log('✅ MIGRACIÓN OK — Cero documentos huérfanos en toda la BD');
    } else {
      console.log(`❌ ATENCIÓN — ${totalHuerfanos} documento(s) sin brand. Corré migrate-add-brand.js`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB.');
  }
}

verify();
