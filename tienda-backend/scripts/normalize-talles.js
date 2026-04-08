
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Product = require('../src/models/product');
const { SIZES_BY_CATEGORY } = require('../src/constants/products');

const DB_CAT_TO_KEY = {
    'Outerwear / Abrigos': 'Abrigos',
    'Tops / Remeras': 'Remeras',
    'Bottoms / Pantalones': 'Pantalones',
    'Footwear / Calzado': 'Calzado',
    'Accessories / Accesorios': 'Accesorios'
};

const normalize = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB para normalización de talles');

        const products = await Product.find().populate('categoria');
        console.log(`Buscando en ${products.length} productos...`);

        let updatedCount = 0;

        for (const p of products) {
            if (!p.categoria) continue;

            const catName = p.categoria.name;
            const catKey = DB_CAT_TO_KEY[catName] || catName;
            const validSizes = SIZES_BY_CATEGORY[catKey] || [];
            
            if (validSizes.length === 0) {
                console.log(`⚠️  Categoría "${catName}" no tiene talles definidos en constantes.`);
                continue;
            }

            const oldTalles = p.talles || [];
            let newTalles = [];
            let changed = false;

            for (const t of oldTalles) {
                let current = String(t).trim();
                let normalized = current;

                // 1. Caso Pantalones: "50" -> "50ARG"
                if (catKey === 'Pantalones' && /^\d+$/.test(current)) {
                    const withArg = current + 'ARG';
                    if (validSizes.includes(withArg)) {
                        normalized = withArg;
                    }
                }

                // 2. Caso Calzado: "38" -> "38/38.5"
                if (catKey === 'Calzado' && /^\d+$/.test(current)) {
                    const match = validSizes.find(v => v.startsWith(current + '/'));
                    if (match) {
                        normalized = match;
                    }
                }

                // 3. Caso General: Buscar coincidencia exacta (case-insensitive) o similar
                if (!validSizes.includes(normalized)) {
                    const exactMatch = validSizes.find(v => v.toLowerCase() === normalized.toLowerCase());
                    if (exactMatch) {
                        normalized = exactMatch;
                    }
                }

                if (normalized !== current) {
                    changed = true;
                }
                newTalles.push(normalized);
            }

            // Eliminar duplicados y vacíos
            newTalles = [...new Set(newTalles)].filter(Boolean);
            
            // Si después de normalizar, algún talle sigue sin ser válido, 
            // intentamos ver si el original era un error de pegado (ej: "S, M")
            // Pero como ya son arrays, esto es menos probable.

            if (changed || JSON.stringify(newTalles) !== JSON.stringify(oldTalles)) {
                p.talles = newTalles;
                await p.save();
                console.log(`✅ [${p.nombre}]: ${JSON.stringify(oldTalles)} -> ${JSON.stringify(newTalles)}`);
                updatedCount++;
            }
        }

        console.log(`\n🚀 Proceso finalizado. ${updatedCount} productos actualizados.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en normalización:', error);
        process.exit(1);
    }
};

normalize();
