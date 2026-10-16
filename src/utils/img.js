import api from '@/services/api'

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150'

const getBackendUrl = () => {
  const apiUrl = api.defaults.baseURL

  if (!apiUrl) return ''

  return apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '')
}

const getStorageUrl = () => {
  const configuredStorageUrl = import.meta.env.VITE_STORAGE_URL

  if (configuredStorageUrl) {
    return configuredStorageUrl.replace(/\/+$/, '')
  }

  const backendUrl = getBackendUrl()

  return backendUrl ? `${backendUrl}/storage` : ''
}

export const getImageUrl = (record) => {
  if (!record || !record.image) return DEFAULT_AVATAR

  let image = String(record.image).trim()

  if (!image) return DEFAULT_AVATAR

  if (/^(blob:|data:)/i.test(image)) {
    return image
  }

  const storageUrl = getStorageUrl()
  const backendUrl = getBackendUrl()

  // Teacher image API URL থেকে storage URL তৈরি
  if (/^https?:\/\//i.test(image)) {
    if (image.includes('/api/teacher-image/')) {
      const filename = image.split('/api/teacher-image/').pop().split('?')[0]

      return storageUrl ? `${storageUrl}/teachers/${filename}` : DEFAULT_AVATAR
    }

    // Student image API URL আগের মতো রাখা
    if (image.includes('/api/student-image/')) {
      const filename = image.split('/api/student-image/').pop().split('?')[0]

      return backendUrl ? `${backendUrl}/api/student-image/${filename}` : DEFAULT_AVATAR
    }

    // Absolute storage URL
    if (image.includes('/storage/')) {
      const storagePath = image.split('/storage/').pop().split('?')[0].replace(/^\/+/, '')

      return storageUrl ? `${storageUrl}/${storagePath}` : DEFAULT_AVATAR
    }

    return image
  }

  // Relative image path
  image = image
    .split('?')[0]
    .replace(/^\/+/, '')
    .replace(/^public\//, '')
    .replace(/^storage\//, '')

  return storageUrl ? `${storageUrl}/${image}` : DEFAULT_AVATAR
}

export const getTeacherImageUrl = (imagePath) => {
  if (!imagePath) return DEFAULT_AVATAR

  const image = String(imagePath).trim()

  if (!image) return DEFAULT_AVATAR

  return getImageUrl({ image })
}
