/**
 * Notification Composable
 * 
 * Kenapa dibuat?
 * - Ganti alert() yang jelek dengan UI yang bagus
 * - Konsisten di seluruh aplikasi
 * - Bisa dikustomisasi (success, error, warning, info)
 * 
 * Cara pakai:
 * const { showSuccess, showError } = useNotifications()
 * showSuccess('Data berhasil disimpan!')
 * showError('Gagal menyimpan data')
 */

import iziToast from 'izitoast'
import 'izitoast/dist/css/iziToast.min.css'

// Konfigurasi default untuk semua toast
const defaultConfig = {
  timeout: 5000,
  resetOnHover: true,
  transitionIn: 'flipInX' as const,
  transitionOut: 'flipOutX' as const,
  position: 'topRight' as const
}

export const useNotifications = () => {
  
  /**
   * Notifikasi sukses (hijau)
   * Untuk: berhasil simpan, berhasil hapus, dll
   */
  const showSuccess = (message: string, title: string = 'Berhasil') => {
    iziToast.success({
      title,
      message,
      ...defaultConfig,
      color: 'green'
    })
  }
  
  /**
   * Notifikasi error (merah)  
   * Untuk: gagal simpan, error API, dll
   */
  const showError = (message: string, title: string = 'Error') => {
    iziToast.error({
      title,
      message,
      ...defaultConfig,
      color: 'red'
    })
  }
  
  /**
   * Notifikasi warning (kuning)
   * Untuk: peringatan, validasi, dll
   */
  const showWarning = (message: string, title: string = 'Peringatan') => {
    iziToast.warning({
      title,
      message,
      ...defaultConfig,
      color: 'yellow'
    })
  }
  
  /**
   * Notifikasi info (biru)
   * Untuk: informasi umum
   */
  const showInfo = (message: string, title: string = 'Info') => {
    iziToast.info({
      title,
      message,
      ...defaultConfig,
      color: 'blue'
    })
  }
  
  /**
   * Notifikasi loading
   * Untuk: proses yang lama
   */
  const showLoading = (message: string = 'Memproses...') => {
    return iziToast.show({
      theme: 'dark',
      icon: 'fa fa-spinner fa-spin',
      title: 'Loading',
      message,
      position: 'center',
      timeout: false, // Tidak auto close
      overlay: true,
      close: false
    })
  }
  
  /**
   * Tutup semua notifikasi
   */
  const closeAll = () => {
    iziToast.destroy()
  }
  
  return {
    showSuccess,
    showError, 
    showWarning,
    showInfo,
    showLoading,
    closeAll
  }
}