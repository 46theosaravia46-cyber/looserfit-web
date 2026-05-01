const multer = require('multer');
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Multer guarda en memoria (no en disco) para mandarlo a Imagekit
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo por foto
});

// Función para subir una imagen a Imagekit
async function subirImagen(file, carpeta = 'looserfit_productos') {
    const resultado = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: carpeta,
        useUniqueFileName: true
    });
    console.log('URL generada por ImageKit:', resultado.url);
    return resultado.url;
}

module.exports = { upload, subirImagen, imagekit };
