import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config.js'

/**
 * Upload an image to Firebase Storage with progress tracking.
 * Falls back to a local Object URL in offline/sandbox environments.
 *
 * @param {File} file — File object to upload
 * @param {string} path — Storage folder path (e.g. 'flocks/flock123')
 * @param {Function} [onProgress] — Callback with percentage (0-100)
 * @returns {Promise<string>} Download URL
 */
export function uploadImage(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    // Generate a unique filename to prevent collision
    const filename = `${Date.now()}_${file.name}`
    const storageRef = ref(storage, `${path}/${filename}`)

    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        if (onProgress) onProgress(Math.round(progress))
      },
      (error) => {
        console.warn('[Storage] Upload failed, falling back to local Object URL:', error.message)
        // Check for offline/sandbox typical errors
        if (
          error.code === 'storage/unauthorized' ||
          error.code === 'storage/retry-limit-exceeded' ||
          error.code === 'storage/unknown'
        ) {
          // Fallback to local Object URL
          const localUrl = URL.createObjectURL(file)
          if (onProgress) onProgress(100)
          resolve(localUrl)
        } else {
          reject(error)
        }
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadUrl)
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}

/**
 * Delete an image from Firebase Storage.
 *
 * @param {string} url — Storage file download URL
 * @returns {Promise<void>}
 */
export async function deleteImage(url) {
  if (url.startsWith('blob:')) {
    console.log('[Storage] Deleted local blob Object URL:', url)
    URL.revokeObjectURL(url)
    return
  }

  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
    console.log('[Storage] Deleted storage file:', url)
  } catch (err) {
    console.warn('[Storage] Failed to delete storage file:', err.message)
  }
}
