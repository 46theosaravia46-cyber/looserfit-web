const fs = require('fs');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// 1. RUTA PARA CREAR PRODUCTO (Con diagnóstico de errores)
router.post('/create', protect, adminOnly, upload.fields([{ name: 'imagenes', maxCount: 20 }, { name: 'guiaTallesImg', maxCount: 1 }]), async (req, res) => {
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
router.put('/:id', protect, adminOnly, upload.fields([{ name: 'imagenes', maxCount: 20 }, { name: 'guiaTallesImg', maxCount: 1 }]), async (req, res) => {
    try {
        const existente = await Product.findById(req.params.id);
        if (!existente) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        // --- LÓGICA DE PERSISTENCIA MANUAL Y PROTECTORA ---
        const { imagenesExistentes, imagenes, ...otrosCampos } = req.body;
        const imagenesExistentesAlt = req.body['imagenesExistentes[]'];

        // 1. Identificar fotos anteriores
        let fotosMantener = [];
        const rawExistentes = imagenesExistentes || imagenesExistentesAlt;

        if (rawExistentes) {
            fotosMantener = Array.isArray(rawExistentes) ? rawExistentes : [rawExistentes];
        } else {
            // SALVAVIDAS FINAL: Si subiste fotos nuevas, pero el panel no mandó la lista de las viejas
            // vamos a asumir que QUERÉS MANTENER las fotos que ya tenías en la base de datos.
            // Solo borraremos fotos si mandás una lista vacía intencionalmente (un caso raro).
            fotosMantener = existente.imagenes || [];
        }

        // 2. Identificar fotos nuevas
        let fotosNuevas = [];
        if (req.files && req.files['imagenes']) {
            fotosNuevas = req.files['imagenes'].map(f => f.path);
        }

        // 3. ASIGNACIÓN MANUAL CAMPO POR CAMPO (A prueba de balas)
        if (otrosCampos.nombre) existente.nombre = otrosCampos.nombre;
        if (otrosCampos.descripcion) existente.descripcion = otrosCampos.descripcion;
        if (otrosCampos.precio) existente.precio = Number(otrosCampos.precio);
        if (otrosCampos.precioOferta) existente.precioOferta = otrosCampos.precioOferta && otrosCampos.precioOferta !== 'null' ? Number(otrosCampos.precioOferta) : undefined;
        if (otrosCampos.categoria) existente.categoria = otrosCampos.categoria;
        if (otrosCampos.tipo) existente.tipo = otrosCampos.tipo;
        if (otrosCampos.stock) existente.stock = Number(otrosCampos.stock);
        if (otrosCampos.publicado !== undefined) existente.publicado = otrosCampos.publicado === 'true' || otrosCampos.publicado === true;
        if (otrosCampos.esNuevoDrop !== undefined) existente.esNuevoDrop = otrosCampos.esNuevoDrop === 'true' || otrosCampos.esNuevoDrop === true;
        
        // Manejo de talles
        if (otrosCampos.talles) {
            existente.talles = Array.isArray(otrosCampos.talles) ? otrosCampos.talles : otrosCampos.talles.split(',');
        }

        // LÓGICA DE SUMA TOTAL: Si el admin NO apretó ninguna X, el total es VIEJAS + NUEVAS
        const totalFinal = [...new Set([...fotosMantener, ...fotosNuevas])];
        existente.imagenes = totalFinal;

        // Guía de talles
        if (req.files && req.files['guiaTallesImg'] && req.files['guiaTallesImg'].length > 0) {
            existente.guiaTalles = req.files['guiaTallesImg'][0].path;
        }

        const actualizado = await existente.save();

        res.json({ 
            mensaje: `SUPER-UNIÓN ÉXITO: Tenías ${fotosMantener.length}, sumaste ${fotosNuevas.length}. El producto ahora tiene ${actualizado.imagenes.length} fotos totales.`, 
            producto: actualizado 
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
    }
});

// 6. ELIMINAR PRODUCTO POR ID
router.delete('/:id', protect, adminOnly, async (req, res) => {
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
router.patch('/:id/toggle', protect, adminOnly, async (req, res) => {
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