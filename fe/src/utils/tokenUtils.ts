/**
 * Token Utility Functions
 * Menangani validasi dan pengelolaan token JWT
 */

interface DecodedToken {
  exp: number
  iat: number
  [key: string]: any
}

/**
 * Decode JWT token tanpa verifikasi signature
 * Hanya untuk membaca payload (exp, iat, dll)
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Cek apakah token sudah expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

/**
 * Cek apakah token akan expired dalam waktu tertentu (default 5 menit)
 */
export const isTokenExpiringSoon = (token: string, minutesBeforeExpiry: number = 5): boolean => {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  const expiryBuffer = minutesBeforeExpiry * 60
  
  return decoded.exp < (currentTime + expiryBuffer)
}

/**
 * Get token expiry time dalam format readable
 */
export const getTokenExpiryTime = (token: string): Date | null => {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return null
  
  return new Date(decoded.exp * 1000)
}

/**
 * Validasi token secara lengkap
 */
export const validateToken = (token: string | null): { valid: boolean; reason?: string } => {
  if (!token) {
    return { valid: false, reason: 'Token tidak ditemukan' }
  }
  
  if (typeof token !== 'string' || token.split('.').length !== 3) {
    return { valid: false, reason: 'Format token tidak valid' }
  }
  
  if (isTokenExpired(token)) {
    return { valid: false, reason: 'Token sudah expired' }
  }
  
  return { valid: true }
}