/**
 * setup-sport.js — Inicialización de la marca Looser Sport.
 * Crea el HomeContent de Sport con Coming Soon activo
 * para que la tienda Sport muestre la pantalla de "Próximamente"
 * mientras el contenido no esté listo.
 *
 * Es IDEMPOTENTE: si ya existe el HomeContent de Sport, solo actualiza
 * el Coming Soon sin borrar el existente.
 *
 * USO: node tienda-backend/scripts/setup-sport.js
 * OPCIONAL: --duration=<minutos>  (default: 43200 = 30 días)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Brand       = require('../src/models/Brand');
const HomeContent = require('../src/models/HomeContent');

// Parsear argumento --duration=<minutos>
const durationArg = process.argv.find(a => a.startsWith('--duration='));
const durationMinutes = durationArg
  ? parseInt(durationArg.split('=')[1], 10)
  : 43200; // 30 días por defecto

async function setupSport() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');

    // 1. Buscar la marca Sport
    const sport = await Brand.findOne({ slug: 'sport' });
    if (!sport) {
      console.error('❌ Marca "sport" no encontrada. Corré primero: node scripts/seed-brands.js');
      process.exit(1);
    }
    console.log(`✅ Marca encontrada: ${sport.name} (${sport._id})`);

    // 2. Calcular la fecha de lanzamiento
    const launchDate = new Date(Date.now() + durationMinutes * 60 * 1000);
    console.log(`📅 Coming Soon activo hasta: ${launchDate.toLocaleString('es-AR')}`);

    // 3. Crear o actualizar el HomeContent de Sport
    let home = await HomeContent.findOne({ brand: sport._id });

    if (!home) {
      home = new HomeContent({
        brand: sport._id,
        heroImages: [],
        familyImages: [],
        featuredProducts: [],
      });
      console.log('🆕 Creando nuevo HomeContent para Sport...');
    } else {
      console.log('♻️  HomeContent de Sport ya existe. Actualizando Coming Soon...');
    }

    home.comingSoon = {
      enabled: true,
      launchDate,
      message: 'Looser Sport — Próximamente',
      subtitle: 'Nuestra nueva línea deportiva está en camino. Registrate para recibir el aviso de lanzamiento.',
      emailMessage: '🏃 ¡Looser Sport ya está disponible! Visitá loosersport.com para ver la nueva colección.',
    };

    await home.save();
    console.log('✅ HomeContent de Sport guardado con éxito.\n');

    // 4. Resumen
    console.log('─'.repeat(50));
    console.log(`  Marca:          ${sport.name}`);
    console.log(`  Coming Soon:    ACTIVO`);
    console.log(`  Launch Date:    ${launchDate.toISOString()}`);
    console.log(`  Duración:       ${durationMinutes} minutos (${Math.round(durationMinutes / 60 / 24)} días)`);
    console.log('─'.repeat(50));
    console.log('\n✅ Setup de Looser Sport completado.');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB.');
  }
}

setupSport();
