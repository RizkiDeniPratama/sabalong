/**
 * API Configuration
 * Centralized configuration untuk semua API calls
 * 
 * Kenapa dibuat terpisah?
 * - Konsistensi: Semua komponen pakai config yang sama
 * - Mudah maintenance: Ubah sekali, berlaku di semua tempat
 * - Environment-aware: Otomatis sesuai environment (dev/prod)
 */

// Ambil dari environment variables dengan fallback yang aman
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/sabalong'

export const API_CONFIG = {
  // Base URL lengkap untuk axios
  baseURL: `${API_URL}${API_BASE_PATH}`,
  
  // Timeout untuk request (10 detik)
  timeout: 10000,
  
  // Headers default
  headers: {
    'Content-Type': 'application/json',
  }
}

/**
 * Utility function untuk generate file URLs
 * Dipakai untuk gambar, dokumen, dll yang di-upload
 */
export const getFileUrl = (path: string): string => {
  if (!path) return ''
  
  // Kalau sudah full URL (http/https), langsung return
  if (path.startsWith('http')) return path
  
  // Kalau path relatif, gabungkan dengan base URL
  return `${API_URL}${path}`
}

/**
 * Utility untuk validasi file upload
 */
export const validateFile = (
  file: File, 
  maxSize: number = 5 * 1024 * 1024, // 5MB default
  allowedTypes: string[] = ['image/*', 'application/pdf']
): { valid: boolean; error?: string } => {
  
  // Cek ukuran file
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File terlalu besar. Maksimal ${Math.round(maxSize / 1024 / 1024)}MB`
    }
  }
  
  // Cek tipe file
  const isValidType = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', '/'))
    }
    return file.type === type
  })
  
  if (!isValidType) {
    return {
      valid: false,
      error: `Tipe file tidak didukung. Hanya: ${allowedTypes.join(', ')}`
    }
  }
  
  return { valid: true }
}