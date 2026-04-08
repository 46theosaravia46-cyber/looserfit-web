
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/product');

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB para fijar Heelys');

        // Buscamos el producto Heelys. Usamos regex para ser flexibles con el nombre.
        const heelys = await Product.findOne({ nombre: /Heelys/i });

        if (!heelys) {
            console.log('❌ Producto "Heelys" no encontrado.');
            process.exit(0);
        }

        console.log(`Encontrado: ${heelys.nombre}`);
        console.log(`Talles actuales: ${JSON.stringify(heelys.talles)}`);

        // Normalizamos el talle problemático "5US / 38ARG" -> "38/38.5" (que es el formato Calzado)
        const fixedTalles = heelys.talles.map(t => {
            if (t === "5US / 38ARG") return "38/38.5";
            return t;
        });

        heelys.talles = [...new Set(fixedTalles)];
        await heelys.save();

        console.log(`✅ Talles actualizados: ${JSON.stringify(heelys.talles)}`);
        process.exit(0);
    } catch (e) {
        console.error('❌ Error fixing Heelys:', e);
        process.exit(1);
    }
};

fix();
