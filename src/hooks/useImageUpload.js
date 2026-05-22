import { useState, useCallback } from 'react'
import { uploadImage, addDocument, COLLECTIONS } from '../firebase'
import { useAuth } from '../contexts/AuthContext.jsx'

/**
 * Custom hook for uploading images and registering their metadata in Firestore.
 */
export default function useImageUpload() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [url, setUrl] = useState(null)

  const upload = useCallback(async (file, flockId = null, isOffline = false) => {
    setUploading(true)
    setProgress(0)
    setError(null)
    setUrl(null)

    try {
      // 1. Upload file to Storage (or fallback to Blob URL)
      const downloadUrl = await uploadImage(file, 'flocks', (p) => setProgress(p))

      // 2. Prepare metadata payload
      const metadata = {
        url: downloadUrl,
        flockId: flockId || 'general',
        name: file.name,
        type: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
      }

      // 3. Register in DB
      if (isOffline || downloadUrl.startsWith('blob:')) {
        // Local state updates
        const localRecord = {
          ...metadata,
          id: `local-img-${Date.now()}`,
        }
        const cached = window.localStorage.getItem('poultrypro_images')
        const currentLocal = cached ? JSON.parse(cached) : []
        window.localStorage.setItem('poultrypro_images', JSON.stringify([localRecord, ...currentLocal]))
        
        // Force list refresh in local fallback context if needed
        console.log('[Storage Hook] Registered image metadata locally', localRecord)
      } else {
        await addDocument(COLLECTIONS.images, metadata, user?.uid || '')
        console.log('[Storage Hook] Registered image in Firestore')
      }

      setUrl(downloadUrl)
      return downloadUrl
    } catch (err) {
      setError(err.message || 'Image upload failed.')
      console.error('[Storage Hook] Upload error:', err)
      throw err
    } finally {
      setUploading(false)
    }
  }, [user])

  return { upload, progress, uploading, error, url }
}
