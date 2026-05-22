const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
  },
});

const uploadToCloudinary = (buffer, folder = 'campus-laf/items') => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  if (!cloud_name || !api_key || !api_secret) {
    return Promise.reject(new Error('Cloudinary credentials not configured'));
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 1200, height: 1200, crop: 'limit' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { upload, uploadToCloudinary };