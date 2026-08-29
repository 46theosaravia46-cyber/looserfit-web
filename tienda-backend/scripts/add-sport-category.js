require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Brand = require('../src/models/Brand');
const Category = require('../src/models/Category');

async function addSportCategory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const brand = await Brand.findOne({ slug: 'fit' });
    if (!brand) {
        console.log('Brand "fit" not found');
        process.exit(1);
    }

    const categoryExists = await Category.findOne({ brand: brand._id, name: 'Sport' });
    if (categoryExists) {
        console.log('Category "Sport" already exists');
    } else {
        await Category.create({ brand: brand._id, name: 'Sport', description: 'Ropa y accesorios deportivos' });
        console.log('✅ Category "Sport" created successfully!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB.');
  }
}

addSportCategory();
