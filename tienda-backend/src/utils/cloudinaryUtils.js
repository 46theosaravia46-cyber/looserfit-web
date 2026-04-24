const cloudinary = require('cloudinary').v2;

/**
 * Extrae el public_id de una URL de Cloudinary.
 * Ejemplo: https://res.cloudinary.com/demo/image/upload/v1234/folder/image.jpg -> folder/image
 */
const extractPublicId = (url) => {
    try {
        if (!url || !url.includes('cloudinary.com')) return null;
        
        // Dividir por '/upload/'
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        
        // Quitar la versión (v1234567/) si existe
        let publicIdWithExt = parts[1];
        if (publicIdWithExt.startsWith('v')) {
            const firstSlash = publicIdWithExt.indexOf('/');
            publicIdWithExt = publicIdWithExt.substring(firstSlash + 1);
        }
        
        // Quitar la extensión (.jpg, .png, etc.)
        const lastDot = publicIdWithExt.lastIndexOf('.');
        if (lastDot !== -1) {
            return publicIdWithExt.substring(0, lastDot);
        }
        return publicIdWithExt;
    } catch (error) {
        console.error('Error extracting public_id:', error);
        return null;
    }
};

/**
 * Elimina una imagen de Cloudinary a partir de su URL.
 */
const deleteFromCloudinary = async (url) => {
    const publicId = extractPublicId(url);
    if (!publicId) return;

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error(`Error deleting ${publicId} from Cloudinary:`, error);
    }
};

module.exports = {
    extractPublicId,
    deleteFromCloudinary
};
