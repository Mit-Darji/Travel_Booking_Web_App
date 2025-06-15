import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
})

/**
 * Upload images to Cloudinary
 * @param {Array|Object} files - Single or multiple image files
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array|string>} - Array of uploaded image URLs or a single URL
 */
export const uploadImages = async (files, folder) => {
  if (!files) return [];

  const fileArray = Array.isArray(files) ? files : [files];
  const uploadPromises = fileArray.map(file =>
    cloudinary.v2.uploader.upload(file.tempFilePath, {folder: 'holiday_packages'})
  );

  const results = await Promise.all(uploadPromises);
  return results.length === 1 ? results[0].secure_url : results.map(result => result.secure_url);
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string} - Extracted public ID
 */
const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  return parts[parts.length - 1].split('.')[0]; // Extract publicId
};

/**
 * Delete images from Cloudinary
 * @param {Array|string} imageUrls - Array of image URLs or a single URL
 */
export const deleteImages = async (imageUrls) => {
  if (!imageUrls) return;

  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  const deletePromises = urls.map(url => cloudinary.v2.uploader.destroy(extractPublicId(url)));

  await Promise.all(deletePromises);
};

/**
 * Update images on Cloudinary (Delete old images, upload new ones)
 * @param {Array|string} oldUrls - Old image URLs
 * @param {Array|Object} newFiles - New image files
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array|string>} - Array of new image URLs or a single URL
 */
export const updateImages = async (oldUrls, newFiles, folder) => {
  if (oldUrls) await deleteImages(oldUrls);
  return uploadImages(newFiles, folder);
};
