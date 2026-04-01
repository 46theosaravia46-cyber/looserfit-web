const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); 
const mongoose = require('mongoose');

const REPLACEMENTS = {
    'Abrigos': 'Outerwear / Abrigos',
    'Remeras': 'Tops / Remeras',
    'Pantalones': 'Bottoms / Pantalones',
    'Calzado': 'Footwear / Calzado',
    'Accesorios': 'Accessories / Accesorios'
};

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('--- MIGRACIÓN DE CATEGORÍAS V1.0 ---');
        const db = mongoose.connection.db;
        const Category = db.collection('categories');
        const Product = db.collection('products');

        // 1. Renombrar categorías existentes
        for (const [oldName, newName] of Object.entries(REPLACEMENTS)) {
            await Category.updateOne(
                { name: oldName },
                { $set: { name: newName } }
            );
            console.log(`- Renombrado: ${oldName} -> ${newName}`);
        }

        // 2. Vincular productos que tienen categorías en "String" (o vacías)
        const allCats = await Category.find({}).toArray();
        const allProducts = await Product.find({}).toArray();

        let count = 0;
        for (const p of allProducts) {
            let catId = null;

            // Caso A: Ya tiene un ObjectId pero el nombre de la categoría cambió
            // (No hay que hacer nada, el ID es el mismo, el populate traerá el nuevo nombre)

            // Caso B: Tiene un "String" en lugar de un ObjectId
            if (p.categoria && typeof p.categoria === 'string') {
                const found = allCats.find(c => 
                    c.name === p.categoria || 
                    REPLACEMENTS[p.categoria] === c.name ||
                    p.categoria.includes(c.name)
                );
                if (found) {
                    catId = found._id;
                }
            }

            // Caso C: No tiene categoría o no se encontró el String
            if (!catId && (!p.categoria || typeof p.categoria !== 'object')) {
                // Asignamos una por defecto si está vacío (ej: Tops)
                const def = allCats.find(c => c.name.includes('Tops')) || allCats[0];
                catId = def._id;
            }

            if (catId) {
                await Product.updateOne(
                    { _id: p._id },
                    { $set: { categoria: catId } }
                );
                count++;
            }
        }

        console.log(`--- MIGRACIÓN COMPLETADA: ${count} productos actualizados ---`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Error en migración:', err);
        process.exit(1);
    });
