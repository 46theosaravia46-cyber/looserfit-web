const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../src/models/Product');
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const MONGO_URI = process.env.MONGO_URI;

async function uploadToImageKit(cloudinaryUrl, folder = 'looserfit_productos') {
    try {
        console.log(`Subiendo a ImageKit: ${cloudinaryUrl}`);
        const response = await imagekit.upload({
            file: cloudinaryUrl, // ImageKit soporta subir por URL
            fileName: cloudinaryUrl.split('/').pop().split('?')[0],
            folder: folder,
            useUniqueFileName: true
        });
        return response.url;
    } catch (error) {
        console.error(`Error subiendo ${cloudinaryUrl}:`, error.message);
        return null; // Si falla, devuelve null
    }
}

async function migrar() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Conectado a MongoDB');

        const productos = await Product.find({});
        console.log(`Encontrados ${productos.length} productos para revisar.`);

        for (const producto of productos) {
            let modificado = false;

            // Migrar imagenes principales
            if (producto.imagenes && producto.imagenes.length > 0) {
                const nuevasImagenes = [];
                for (const img of producto.imagenes) {
                    if (img.includes('cloudinary.com')) {
                        console.log(`Migrando imagen de producto ${producto.nombre}...`);
                        const nuevaUrl = await uploadToImageKit(img);
                        if (nuevaUrl) {
                            nuevasImagenes.push(nuevaUrl);
                            modificado = true;
                        } else {
                            nuevasImagenes.push(img); // Mantenemos la original si falla
                        }
                    } else {
                        nuevasImagenes.push(img); // Ya no es Cloudinary (o no es url)
                    }
                }
                producto.imagenes = nuevasImagenes;
            }

            // Migrar guía de talles
            if (producto.guiaTalles && producto.guiaTalles.includes('cloudinary.com')) {
                console.log(`Migrando guía de talles de producto ${producto.nombre}...`);
                const nuevaUrl = await uploadToImageKit(producto.guiaTalles, 'looserfit_productos');
                if (nuevaUrl) {
                    producto.guiaTalles = nuevaUrl;
                    modificado = true;
                }
            }

            if (modificado) {
                await producto.save();
                console.log(`✅ Producto actualizado: ${producto.nombre}`);
            } else {
                console.log(`⏩ Sin cambios para: ${producto.nombre}`);
            }
        }

        console.log('🎉 Migración completada.');
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}

migrar();
