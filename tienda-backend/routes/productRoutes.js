const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // Asegurate que la P sea mayúscula si el archivo es Product.js
const upload = require('../config/cloudinary'); 

// 1. RUTA PARA CREAR PRODUCTO (Con diagnóstico de errores)
router.post('/create', upload.fields([{ name: 'imagenes', maxCount: 5 }, { name: 'guiaTallesImg', maxCount: 1 }]), async (req, res) => {
    try {
        // Estos logs aparecerán en tu terminal de VS Code
        console.log("--- INTENTO DE CARGA ---");
        console.log("Files recibidos:", req.files); 
        console.log("Body recibido:", req.body);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ mensaje: 'No se subieron fotos. Revisá el nombre en Postman' });
        }

        const urls = req.files['imagenes'] ? req.files['imagenes'].map(file => file.path) : [];
        const guiaTallesUrl = req.files['guiaTallesImg'] ? req.files['guiaTallesImg'][0].path : req.body.guiaTalles;
        
        const nuevoProducto = new Product({
            ...req.body,
            imagenes: urls,
            guiaTalles: guiaTallesUrl
        });

        await nuevoProducto.save();
        res.status(201).json({ mensaje: 'Producto con fotos reales creado!', nuevoProducto });
        
    } catch (error) {
        // REEMPLAZÁ ESTA PARTE EXACTAMENTE:
        console.error("❌ ERROR DETALLADO:", JSON.stringify(error, null, 2)); 
        console.error("Mensaje directo:", error.message);
        res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
    }
});

// 2. RUTA PARA VER TODOS LOS PRODUCTOS
router.get('/all', async (req, res) => {
    try {
        const productos = await Product.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener productos' });
    }
});

// 3. BUSCAR PRODUCTOS CON FILTROS
router.get('/search', async (req, res) => {
    try {
        const { categoria, corte, soloPublicados } = req.query;
        let filtro = {};

        if (categoria) filtro.categoria = categoria;
        if (corte) filtro.corte = corte;
        if (soloPublicados === 'true') filtro.publicado = true;

        const productos = await Product.find(filtro);
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al filtrar productos' });
    }
});

// 4. TRAER UN PRODUCTO POR ID
router.get('/:id', async (req, res) => {
    try {
        const producto = await Product.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener producto', error: error.message });
    }
});

// 5. EDITAR PRODUCTO POR ID
router.put('/:id', upload.fields([{ name: 'imagenes', maxCount: 5 }, { name: 'guiaTallesImg', maxCount: 1 }]), async (req, res) => {
    try {
        const existente = await Product.findById(req.params.id);
        if (!existente) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        const updateData = { ...req.body };

        // Si llegan imágenes nuevas
        if (req.files['imagenes'] && req.files['imagenes'].length > 0) {
            updateData.imagenes = req.files['imagenes'].map(file => file.path);
        }

        // Si llega una nueva guía de talles
        if (req.files['guiaTallesImg'] && req.files['guiaTallesImg'].length > 0) {
            updateData.guiaTalles = req.files['guiaTallesImg'][0].path;
        }

        const actualizado = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({ mensaje: 'Producto actualizado', producto: actualizado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
    }
});

// 6. ELIMINAR PRODUCTO POR ID
router.delete('/:id', async (req, res) => {
    try {
        const eliminado = await Product.findByIdAndDelete(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
    }
});

// 7. TOGGLE PUBLICADO/OCULTO
router.patch('/:id/toggle', async (req, res) => {
    try {
        const producto = await Product.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        producto.publicado = !producto.publicado;
        await producto.save();

        res.json({ mensaje: 'Visibilidad actualizada', producto });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al cambiar visibilidad', error: error.message });
    }
});

module.exports = router;