require('dotenv').config({ path: './tienda-backend/.env' });
const path = require('path');
const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Product = require('../src/models/product');

const INITIAL_CATEGORIAS = [
    { name: 'Abrigos', description: 'Abrigos, camperas y buzos' },
    { name: 'Remeras', description: 'Remeras y musculosas' },
    { name: 'Pantalones', description: 'Pantalones, shorts y bermudas' },
    { name: 'Calzado', description: 'Zapatillas y zapatos' },
    { name: 'Accesorios', description: 'Gorras, medias y otros' }
];

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB para migración');

        // 1. Crear categorías si no existen
        for (const catData of INITIAL_CATEGORIAS) {
            const exists = await Category.findOne({ name: catData.name });
            if (!exists) {
                await Category.create(catData);
                console.log(`Created category: ${catData.name}`);
            }
        }

        const allCats = await Category.find();
        const catMap = {};
        allCats.forEach(c => {
            catMap[c.name.toLowerCase()] = c._id;
        });

        // Mapping for messy categories
        const legacyMapping = {
            'outerwear / abrigos': catMap['abrigos'],
            'tops / remeras': catMap['remeras'],
            'bottoms / pantalones': catMap['pantalones'],
            'footwear / calzado': catMap['calzado'],
            'accessories / accesorios': catMap['accesorios']
        };

        // 2. Actualizar productos
        const products = await Product.find();
        console.log(`Found ${products.length} products to check...`);

        for (const p of products) {
            if (typeof p.categoria === 'string') {
                const lowerCat = p.categoria.toLowerCase();
                const newId = catMap[lowerCat] || legacyMapping[lowerCat];

                if (newId) {
                    p.categoria = newId;
                    await p.save();
                    console.log(`Updated product ${p.nombre}: ${lowerCat} -> ${newId}`);
                } else {
                    // Fallback to Accesorios or first cat if unknown
                    p.categoria = catMap['accesorios'] || allCats[0]._id;
                    await p.save();
                    console.warn(`Unknown category "${p.categoria}" for product ${p.nombre}. Fallback used.`);
                }
            } else {
                console.log(`Product ${p.nombre} already has ObjectId category.`);
            }
        }

        console.log('🚀 Migración completada con éxito');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en migración:', error);
        process.exit(1);
    }
};

migrate();
