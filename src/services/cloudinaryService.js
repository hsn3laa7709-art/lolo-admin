/**
 * Cloudinary Secure Unsigned Upload Service
 * Uses XMLHttpRequest to support progress tracking.
 */

const CLOUD_NAME = 'zhvofo0w';
const UPLOAD_PRESET = 'lolo_preset'; // Unsigned upload preset to configure in Cloudinary console

/**
 * Uploads a file to Cloudinary with progress tracking.
 * @param {File} file - The file to upload (Image/Video)
 * @param {Function} onProgress - Callback function for progress updates: (percent) => {}
 * @returns {Promise<string>} - Resolves with the secure URL of the uploaded media
 */
export function uploadImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response.'));
        }
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}. Please verify your Cloudinary Upload Preset.`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred during upload.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted by user.'));
    });

    xhr.open('POST', url, true);
    xhr.send(formData);
  });
}
