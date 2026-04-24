const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'looserfit_general';
    let transformation = [{ quality: 'auto:good', fetch_format: 'auto' }];

    if (file.fieldname === 'imagenes' || file.fieldname === 'guiaTallesImg') {
      folder = 'looserfit_productos';
      transformation.push({ width: 800, crop: 'limit' });
    } else if (file.fieldname === 'newHeroImages' || file.fieldname === 'newFamilyImages') {
      folder = 'looserfit_banners';
      transformation.push({ width: 1920, crop: 'limit' });
    } else if (file.fieldname === 'comprobante') {
      folder = 'looserfit_comprobantes';
      transformation.push({ width: 1000, crop: 'limit' });
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'heic', 'heif'],
      transformation: transformation,
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;