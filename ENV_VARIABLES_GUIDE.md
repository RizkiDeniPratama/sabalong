# Environment Variables Guide

## Frontend (.env)

### API Configuration
```env
VITE_API_URL=http://localhost:3000
VITE_API_BASE_PATH=/sabalong
```
**Kegunaan:**
- `VITE_API_URL`: Base URL untuk API backend
- `VITE_API_BASE_PATH`: Path prefix untuk semua API endpoints

**Kapan digunakan:**
- Di `fe/src/services/api.ts` untuk konfigurasi axios
- Di attachment URL untuk download file
- Di production, ganti dengan domain production

**Contoh Production:**
```env
VITE_API_URL=https://api.sabalong.com
VITE_API_BASE_PATH=/sabalong
```

---

### App Configuration
```env
VITE_APP_NAME=SABALONG
VITE_APP_TITLE=Sistem Aplikasi Bantuan Online
```
**Kegunaan:**
- `VITE_APP_NAME`: Nama aplikasi (untuk branding, title, dll)
- `VITE_APP_TITLE`: Deskripsi lengkap aplikasi

**Kapan digunakan:**
- Di meta tags HTML
- Di page titles
- Di footer atau about page

**Cara pakai:**
```typescript
const appName = import.meta.env.VITE_APP_NAME
document.title = `${pageName} | ${appName}`
```

---

### Feature Flags
```env
VITE_ENABLE_FEEDBACK=true
VITE_ENABLE_SLA_TRACKING=true
```
**Kegunaan:**
- Enable/disable fitur tertentu tanpa ubah kode
- Berguna untuk staging/testing

**Kapan digunakan:**
- Saat ingin hide fitur yang belum siap di production
- Saat testing fitur baru

**Cara pakai:**
```typescript
const enableFeedback = import.meta.env.VITE_ENABLE_FEEDBACK === 'true'

// Di component:
<button v-if="enableFeedback" @click="showFeedback">
  Beri Feedback
</button>
```

---

### Upload Configuration
```env
VITE_MAX_FILE_SIZE=5242880
```
**Kegunaan:**
- Limit ukuran file upload (dalam bytes)
- 5242880 bytes = 5 MB

**Kapan digunakan:**
- Di form upload attachment
- Untuk validasi client-side sebelum upload

**Cara pakai:**
```typescript
const maxSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880')

if (file.size > maxSize) {
  alert(`File terlalu besar. Max: ${maxSize / 1024 / 1024}MB`)
}
```

---

### Environment
```env
VITE_ENV=development
```
**Kegunaan:**
- Identifikasi environment saat ini
- Options: `development`, `staging`, `production`

**Kapan digunakan:**
- Untuk conditional logic berdasarkan environment
- Untuk enable/disable debug mode

**Cara pakai:**
```typescript
const isDev = import.meta.env.VITE_ENV === 'development'

if (isDev) {
  console.log('Debug info:', data)
}
```

---

## Backend (.env)

### Database
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sabalong"
```
**Kegunaan:**
- Connection string untuk Prisma ORM
- Format: `postgresql://username:password@host:port/database`

---

### JWT Secret
```env
JWT_SECRET=your-super-secret-key-here-change-in-production
```
**Kegunaan:**
- Secret key untuk sign JWT tokens
- **PENTING:** Ganti dengan random string di production

**Generate random secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Server Configuration
```env
PORT=3000
NODE_ENV=development
```
**Kegunaan:**
- `PORT`: Port untuk backend server
- `NODE_ENV`: Environment mode (development/production)

---

## Best Practices

### 1. Never Commit .env
Tambahkan ke `.gitignore`:
```
.env
.env.local
.env.*.local
```

### 2. Always Provide .env.example
File `.env.example` berisi template tanpa nilai sensitif:
```env
# .env.example
VITE_API_URL=http://localhost:3000
JWT_SECRET=change-this-in-production
```

### 3. Validate Environment Variables
Di `api.ts` atau startup file:
```typescript
const requiredEnvVars = ['VITE_API_URL', 'VITE_API_BASE_PATH']

requiredEnvVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
})
```

### 4. Use Type-Safe Env
Buat type definition:
```typescript
// env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_BASE_PATH: string
  readonly VITE_APP_NAME: string
  readonly VITE_ENABLE_FEEDBACK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## Deployment

### Development
```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

### Staging
```env
VITE_API_URL=https://staging-api.sabalong.com
VITE_ENV=staging
```

### Production
```env
VITE_API_URL=https://api.sabalong.com
VITE_ENV=production
```

---

## Troubleshooting

### Environment variables tidak terbaca
1. Pastikan prefix `VITE_` untuk Vite
2. Restart dev server setelah ubah .env
3. Clear cache: `npm run dev -- --force`

### CORS Error
Pastikan `VITE_API_URL` sesuai dengan backend CORS config

### File upload gagal
Check `VITE_MAX_FILE_SIZE` dan backend upload limit
