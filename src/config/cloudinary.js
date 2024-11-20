const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dazmhcufp',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getImageUrl(filename) {
  if (!filename) {
    throw new Error('Filename is required');
  }
  // Adding back the version number that was in the original URL
  return `https://res.cloudinary.com/${cloudinary.config().cloud_name}/image/upload/v1638469793/${filename}`;
}

function parseCloudinaryUrl(url) {
  if (!url) return null;
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (err) {
    console.error('Failed to parse Cloudinary URL:', err);
    return null;
  }
}

module.exports = {
  cloudinary,
  getImageUrl,
  parseCloudinaryUrl,
};
