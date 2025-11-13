// services/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image from URL to Cloudinary
 * @param {string} imageUrl - The URL of the image to upload
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
async function uploadImageFromUrl(imageUrl, folder = 'cybercrime-reports') {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Upload image from buffer to Cloudinary
 * @param {Buffer} buffer - The image buffer
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
function uploadImageFromBuffer(buffer, folder = 'cybercrime-reports') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
}

module.exports = {
  uploadImageFromUrl,
  uploadImageFromBuffer,
  cloudinary
};
