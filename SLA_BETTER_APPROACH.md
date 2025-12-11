# SLA Implementation - Better Approach

## ❌ **Masalah dengan Pendekatan Sebelumnya**

### **Duplikasi SLA Calculator:**
```
Backend: be/src/utils/slaUtils.js
Frontend: fe/src/utils/slaCalculator.ts  ❌ DUPLIKASI
```

**Masalah:**
1. ❌ **Code duplication** - Logic sama di 2 tempat
2. ❌ **Maintenance burden** - Update 2 tempat jika ada perubahan
3. ❌ **Potential inconsistency** - Bisa beda hasil jika ada bug
4. ❌ **Unnecessary complexity** - Frontend jadi lebih kompleks

---

## ✅ **Pendekatan yang Lebih Baik**

### **Single Source of Truth: Backend**

**Prinsip:**
- Backend = **Single source of truth** untuk SLA calculation
- Frontend = **Consumer** yang menampilkan data dari backend
- Tidak ada duplikasi logic

### **Backend Endpoints yang Sudah Ada:**

1. **`GET /slas/ticket/:id`** - Get SLA detail untuk specific ticket
   ```json
   {
     "success": true,
     "data": {
       "ticket_number": "TKT-123",
       "status": "selesai",
       "assignee": "John Doe",
       "service": "IT Support",
       "sla_config": {
         "resolution_hours": 24
       },
       "resolution_sla": {
         "deadline": "2024-12-10T16:00:00Z",
         "actual_completion": "2024-12-10T14:30:00Z",
         "percentage": 100,
         "delay_hours": 0,
         "status": "On Time"
       }
     }
   }
   ```

2. **`GET /dashboard-analytics`** - SLA performance summary
3. **`GET /slas/petugas/:id/performance`** - Detail performance petugas

---

## 🔄 **New Implementation Flow**

### **Saat Petugas Menyelesaikan Tiket:**

```
1. Petugas klik "Tandai Selesai"
         ↓
2. API: PUT /tickets/:id/status { status: "selesai" }
         ↓
3. Backend: Update ticket + Calculate SLA
         ↓
4. Frontend: Fetch updated ticket data
         ↓
5. Frontend: Call GET /slas/ticket/:id untuk SLA detail
         ↓
6. Show SLA Congratulations Modal dengan data dari backend
         ↓
7. Display SLA Result in ticket detail
```

### **Code Changes:**

**Before (❌ Duplikasi):**
```typescript
// Frontend menghitung sendiri
const slaPercentage = calculateResolutionSLAPercentage(
  ticket.completed_at,
  ticket.resolution_deadline
)
```

**After (✅ Single Source):**
```typescript
// Frontend ambil dari backend
const response = await api.get(`/slas/ticket/${ticket.id}`)
const slaData = response.data.data.resolution_sla
```

---

## 📊 **Data Flow Diagram**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘
        │                   │                   │
        │ Complete Ticket   │                   │
        ├──────────────────►│                   │
        │                   │ Update + Calc SLA │
        │                   ├──────────────────►│
        │                   │                   │
        │ Get SLA Data      │                   │
        ├──────────────────►│                   │
        │                   │ Query SLA         │
        │                   ├──────────────────►│
        │                   │ Return SLA Data   │
        │                   │◄──────────────────┤
        │ SLA Data          │                   │
        │◄──────────────────┤                   │
        │                   │                   │
        │ Show Modal        │                   │
        │                   │                   │
```

---

## 🎯 **Benefits of New Approach**

### ✅ **Advantages:**
1. **Single Source of Truth** - Hanya backend yang hitung SLA
2. **Consistency** - Tidak mungkin beda hasil antara FE dan BE
3. **Maintainability** - Update logic hanya di 1 tempat
4. **Accuracy** - Backend punya akses lengkap ke database
5. **Performance** - Frontend tidak perlu complex calculation
6. **Scalability** - Mudah tambah fitur SLA baru di backend

### ✅ **Trade-offs:**
1. **Extra API Call** - Perlu call `/slas/ticket/:id` untuk detail
2. **Network Dependency** - Butuh internet untuk SLA data
3. **Slight Delay** - Modal muncul setelah API call selesai

**Verdict:** Trade-offs ini **worth it** untuk consistency dan maintainability.

---

## 🛠 **Implementation Details**

### **Frontend Changes:**

1. **Remove SLA Calculator** ❌
   ```typescript
   // DELETED: fe/src/utils/slaCalculator.ts
   ```

2. **Use Backend API** ✅
   ```typescript
   // NEW: Fetch SLA data from backend
   const fetchSLAData = async () => {
     const response = await api.get(`/slas/ticket/${ticket.id}`)
     slaData.value = response.data.data
   }
   ```

3. **Update Modal Logic** ✅
   ```typescript
   // Show modal after fetching SLA data
   await fetchSLAData()
   showSLAModal.value = true
   ```

### **Backend (Already Exists):**

1. **SLA Utils** ✅ `be/src/utils/slaUtils.js`
2. **SLA Controller** ✅ `be/src/controllers/slaController.js`
3. **SLA Routes** ✅ `be/src/routers/slaRoutes.js`

---

## 🧪 **Testing Scenarios**

### **SLA Calculation Consistency:**
- [ ] Backend calculation matches expected results
- [ ] Frontend displays same data as backend calculation
- [ ] No discrepancy between dashboard and detail page

### **Modal Functionality:**
- [ ] Modal shows correct SLA data from backend
- [ ] Modal appears after API call completes
- [ ] Modal handles API errors gracefully

### **Performance:**
- [ ] SLA API call is fast enough (<500ms)
- [ ] Modal doesn't feel sluggish
- [ ] Error handling works if API fails

---

## 🚀 **Future Enhancements**

### **Caching Strategy:**
```typescript
// Cache SLA data to avoid repeated API calls
const slaCache = new Map()

const fetchSLAData = async (ticketId) => {
  if (slaCache.has(ticketId)) {
    return slaCache.get(ticketId)
  }
  
  const data = await api.get(`/slas/ticket/${ticketId}`)
  slaCache.set(ticketId, data)
  return data
}
```

### **Real-time Updates:**
```typescript
// WebSocket untuk real-time SLA updates
socket.on('sla-updated', (data) => {
  if (data.ticketId === ticket.value.id) {
    slaData.value = data.sla
  }
})
```

---

## 📝 **Conclusion**

**Pendekatan baru ini lebih baik karena:**

1. ✅ **Eliminates code duplication**
2. ✅ **Ensures data consistency**
3. ✅ **Simplifies maintenance**
4. ✅ **Leverages existing backend infrastructure**
5. ✅ **Follows single responsibility principle**

**Trade-off yang minimal (extra API call) worth it untuk benefits yang didapat.**

Backend sudah punya semua yang dibutuhkan, frontend tinggal consume data dengan smart way! 🎯