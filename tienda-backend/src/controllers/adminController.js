const adminService = require('../services/adminService');

const enviarNewsletter = async (req, res) => {
    try {
        const { asunto, contenido } = req.body;
        if (!asunto || !contenido) return res.status(400).json({ error: 'Asunto y contenido son obligatorios' });
        
        const result = await adminService.enviarNewsletter(asunto, contenido);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar la noticia. Verifica las credenciales de Gmail.' });
    }
};

module.exports = {
    enviarNewsletter
};
