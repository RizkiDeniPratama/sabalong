# 🔄 Standardisasi Status Tiket - Panduan Lengkap

## 📋 Ringkasan Perubahan

Sistem tiket telah diperbarui untuk menggunakan status yang konsisten dalam bahasa Inggris dan memperbaiki authorization untuk update status.

---

## 🎯 Status Baru (Standardized)

### ✅ Status Utama:
| Status Baru | Status Lama | Deskripsi |
|-------------|-------------|-----------|
| `in_progress` | `on_progress` | Tiket sedang dikerjakan |
| `pending` | `on_hold` | Tiket ditunda/hold |
| `completed` | `selesai` | Tiket selesai dikerjakan |
| `closed` | `closed` | Tiket ditutup/diarsipkan |

### 🔄 Backward Compatibility:
- Sistem masih mendukung status lama untuk kompatibilitas
- Status lama akan otomatis dikonversi ke status baru
- Database existing tidak perlu diubah

---

## 🔐 Perubahan Authorization

### Sebelum:
```javascript
// Admin DAN Petugas bisa update status
if (userRole !== "admin" && ticket.assigned_to_id !== userId) {
  return forbidden()
}
```

### Sesudah:
```javascript
// Hanya Admin yang bisa update status via /status endpoint
if (userRole !== "admin") {
  return forbidden()
}

// Petugas punya endpoint khusus untuk complete tiket
// PUT /tickets/:id/complete (hanya untuk petugas assigned)
```

---

## 🛠 Implementasi Technical

### 1. **Backend Changes**

#### A. Ticket Controller (`ticketController.js`)
```javascript
// Validasi status baru + legacy
const validStatus = [
  "in_progress", "completed", "closed", "pending", // New
  "on_progress", "selesai", "on_hold"              // Legacy
];

// Normalisasi status
const normalizedStatus = {
  "selesai": "completed",
  "on_progress": "in_progress", 
  "on_hold": "pending"
}[status] || status;
```

#### B. New Endpoint untuk Petugas
```javascript
// PUT /tickets/:id/complete
export async function completeTicket(req, res) {
  // Hanya petugas assigned yang bisa complete
  if (ticket.assigned_to_id !== userId) {
    return forbidden()
  }
  
  // Update ke status "completed"
  await updateTicket({ status: "completed", completed_at: new Date() })
}
```

#### C. Routes Update (`ticketRoutes.js`)
```javascript
// Hanya admin bisa update status
router.put("/:id/status", authorize("admin"), updateTicketStatus);

// Petugas bisa complete tiket mereka
router.put("/:id/complete", authorize("petugas"), completeTicket);
```

### 2. **Frontend Changes**

#### A. Authorization Logic
```javascript
// Hanya admin yang bisa lihat form update status
v-if="!isTicketClosed && isAdmin"

// Petugas tetap bisa complete via tombol khusus
const canCompleteTicket = computed(() => 
  isAdmin.value || (isPetugas.value && isTicketOwner.value)
)
```

#### B. API Calls
```javascript
// Gunakan endpoint berbeda berdasarkan role
if (isPetugas.value) {
  await api.put(`/tickets/${ticket.id}/complete`)
} else {
  await api.put(`/tickets/${ticket.id}/status`, { status: 'completed' })
}
```

#### C. Status Badge Update
```javascript
const statusBadgeClass = (s: string) => {
  const map = {
    // New standardized statuses
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-gray-200 text-gray-800',
    // Legacy support
    selesai: 'bg-green-100 text-green-800',
    on_progress: 'bg-blue-100 text-blue-800',
  }
  return map[s?.toLowerCase()] || 'bg-gray-100'
}
```

---

## 🎨 UI/UX Improvements

### 1. **Feedback System**
```vue
<!-- Tombol feedback hanya muncul jika belum ada feedback -->
<div v-if="canRate">
  <button @click="showFeedbackModal = true">Beri Ulasan</button>
</div>

<!-- Pesan terima kasih jika sudah ada feedback -->
<div v-else-if="hasGivenFeedback">
  <div class="text-green-600">
    ✅ Terima kasih atas ulasan Anda
  </div>
</div>
```

### 2. **Status Update Form**
```vue
<!-- Hanya admin yang bisa lihat -->
<div v-if="!isTicketClosed && isAdmin">
  <h3>Update Status</h3>
  <p class="text-xs text-gray-500">
    Hanya admin yang dapat mengubah status tiket
  </p>
  <select v-model="newStatus">
    <option value="in_progress">In Progress</option>
    <option value="pending">Pending (On Hold)</option>
    <option value="completed">Completed</option>
    <option value="closed">Closed (Archive)</option>
  </select>
</div>
```

---

## 🔄 Migration Strategy

### Phase 1: Backward Compatibility ✅
- Support both old and new status formats
- Auto-convert legacy status to new format
- No database migration needed

### Phase 2: Frontend Update ✅
- Update UI to use new status labels
- Maintain legacy status support in computed properties
- Update API calls to use appropriate endpoints

### Phase 3: Gradual Migration (Future)
- Slowly migrate existing data to new status format
- Remove legacy status support after full migration
- Update all documentation

---

## 🧪 Testing Scenarios

### 1. **Admin Testing**
- ✅ Can update any ticket status via dropdown
- ✅ Can see all status options
- ✅ Status updates are logged correctly

### 2. **Petugas Testing**
- ✅ Cannot see status update dropdown
- ✅ Can complete assigned tickets via "Tandai Selesai" button
- ✅ Cannot complete tickets not assigned to them
- ✅ SLA modal appears after completion

### 3. **User Testing**
- ✅ Cannot update ticket status
- ✅ Can give feedback on completed tickets
- ✅ Cannot give feedback twice
- ✅ Sees thank you message after feedback

### 4. **Status Display Testing**
- ✅ New status shows correct badges
- ✅ Legacy status still works
- ✅ Status colors are consistent

---

## 📊 Database Impact

### Current Status Distribution (Example):
```sql
-- Check current status usage
SELECT status, COUNT(*) as count 
FROM tickets 
GROUP BY status;

-- Results might show:
-- selesai: 150
-- on_progress: 45
-- pending: 20
-- closed: 80
```

### After Migration:
```sql
-- New status distribution
-- completed: 150 (converted from selesai)
-- in_progress: 45 (converted from on_progress)  
-- pending: 20 (same)
-- closed: 80 (same)
```

---

## 🚨 Breaking Changes

### ⚠️ What Changed:
1. **Authorization**: Petugas can no longer update status via `/status` endpoint
2. **API Endpoints**: New `/complete` endpoint for petugas
3. **Status Values**: New standardized status names

### ✅ What's Safe:
1. **Database**: No schema changes needed
2. **Legacy Support**: Old status values still work
3. **User Experience**: Functionality remains the same

---

## 🎓 Learning Points

### 1. **API Design**
- **Good**: Separate endpoints for different roles
- **Why**: Clear separation of concerns, better security

### 2. **Backward Compatibility**
- **Good**: Support old and new formats during transition
- **Why**: Prevents breaking existing functionality

### 3. **Authorization Strategy**
- **Good**: Role-based endpoint access
- **Why**: More secure than parameter-based authorization

### 4. **Status Normalization**
- **Good**: Convert legacy to new format internally
- **Why**: Consistent data processing while maintaining compatibility

### 5. **User Experience**
- **Good**: Different UI for different roles
- **Why**: Users only see what they can actually do

---

## 🔮 Future Enhancements

### 1. **Status Workflow**
```javascript
// Possible status transitions
const allowedTransitions = {
  'pending': ['in_progress', 'closed'],
  'in_progress': ['completed', 'pending', 'closed'],
  'completed': ['closed'],
  'closed': [] // Final state
}
```

### 2. **Audit Trail**
```javascript
// Enhanced logging
{
  action: 'status_change',
  from_status: 'in_progress',
  to_status: 'completed',
  user_role: 'petugas',
  timestamp: '2024-12-10T10:30:00Z'
}
```

### 3. **Notification System**
```javascript
// Auto-notify on status changes
if (statusChanged && ticket.user_id) {
  await sendNotification(ticket.user_id, {
    type: 'status_update',
    message: `Tiket ${ticket.number} telah ${newStatus}`
  })
}
```

---

*Dokumentasi ini dibuat untuk memastikan semua developer memahami perubahan sistem status tiket dan dapat melakukan maintenance dengan baik.*