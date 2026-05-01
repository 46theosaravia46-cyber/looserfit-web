const homeService = require('../services/homeService');
const { subirImagen } = require('../config/storage');

const getHome = async (req, res) => {
    try {
        const doc = await homeService.getHomeContent();
        res.json(doc);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener contenido home', error: error.message });
    }
};

const updateHero = async (req, res) => {
    try {
        let finalImages = [];
        if (req.body.heroData) {
            finalImages = typeof req.body.heroData === 'string' ? JSON.parse(req.body.heroData) : req.body.heroData;
        }

        let fileIndex = 0;
        const mapped = [];
        for (const item of finalImages) {
            if (item.startsWith('NEW_FILE_') && req.files && req.files[fileIndex]) {
                const url = await subirImagen(req.files[fileIndex], 'looserfit_banners');
                fileIndex++;
                mapped.push(url);
            } else {
                mapped.push(item);
            }
        }
        finalImages = mapped;

        const doc = await homeService.updateHero(finalImages);
        res.json({ mensaje: 'Hero actualizado', home: doc });
    } catch (error) {
        console.error('CRITICAL HERO ERROR:', error);
        res.status(500).json({ mensaje: 'Error al actualizar hero', error: error.message });
    }
};

const updateFamily = async (req, res) => {
    try {
        let finalConfig = [];
        if (req.body.familyData) {
            finalConfig = typeof req.body.familyData === 'string' ? JSON.parse(req.body.familyData) : req.body.familyData;
        }

        let fileIndex = 0;
        const familyImages = [];
        for (const item of finalConfig) {
            let src = item.src;
            if (src.startsWith('NEW_FILE_') && req.files && req.files[fileIndex]) {
                src = await subirImagen(req.files[fileIndex], 'looserfit_banners');
                fileIndex++;
            }
            familyImages.push({ src, titulo: item.titulo || '', descripcion: item.descripcion || '' });
        }

        const doc = await homeService.updateFamily(familyImages);
        res.json({ mensaje: 'Family actualizado', home: doc });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar family', error: error.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        const doc = await homeService.updateSettings(req.body.comingSoon);
        res.json({ mensaje: 'Configuración actualizada', home: doc });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar configuración', error: error.message });
    }
};

const updateFeatured = async (req, res) => {
    try {
        const { productIds } = req.body;
        if (!Array.isArray(productIds)) {
            return res.status(400).json({ mensaje: 'productIds debe ser un array' });
        }
        const doc = await homeService.updateFeatured(productIds);
        res.json({ mensaje: 'Productos destacados actualizados', home: doc });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar destacados', error: error.message });
    }
};

module.exports = {
    getHome,
    updateHero,
    updateFamily,
    updateSettings,
    updateFeatured
};
