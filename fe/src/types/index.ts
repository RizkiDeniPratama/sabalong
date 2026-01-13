/**
 * Global Type Definitions
 * 
 * Kenapa dibuat terpisah?
 * - Konsistensi: Semua komponen pakai type yang sama
 * - Reusability: Tidak perlu define ulang di setiap file
 * - Maintenance: Ubah sekali, berlaku di semua tempat
 */

// User related types
export interface User {
  id: number
  nama: string
  email: string
  role: 'admin' | 'petugas' | 'user' | 'pimpinan'
  instansi?: string
  phone?: string
  created_at?: string
  updated_at?: string
}

// Service related types
export interface Service {
  id: number
  nama_layanan: string
  deskripsi: string
  kategori: string
  sla_id: number
  default_priority: 'low' | 'medium' | 'high' | 'critical'
  is_active: boolean
  icon?: string
  flowchart?: string
  sop?: string
  created_at?: string
  updated_at?: string
  sla?: SLA
  skills?: ServiceSkill[]
}

export interface ServiceSkill {
  id: number
  skill_id: number
  service_id: number
  skill: Skill
}

export interface Skill {
  id: number
  skill_name: string
  description?: string
}

// SLA related types
export interface SLA {
  id: number
  sla_name: string
  response_hours: number
  resolution_hours: number
  description?: string
}

// Ticket related types
export interface Ticket {
  id: number
  ticket_number: string
  judul_permohonan: string
  deskripsi: string
  status: 'pending' | 'in_progress' | 'on_progress' | 'completed' | 'selesai' | 'closed' | 'eskalasi'
  priority: 'low' | 'medium' | 'high' | 'critical'
  attachment?: string
  created_at: string
  updated_at?: string
  response_deadline?: string
  resolution_deadline?: string
  first_response_at?: string
  completed_at?: string
  assigned_to_id?: number
  user_id: number
  service_id: number
  eskalasi_from_id?: number
  
  // Relations
  requester: User
  assignee?: User
  service: Service
  logs?: TicketLog[]
  feedback?: Feedback
}

export interface TicketLog {
  id: number
  ticket_id: number
  user_id: number
  action_type: 'created' | 'assigned' | 'status_changed' | 'commented' | 'escalated'
  notes?: string
  created_at: string
  user?: User
}

// Feedback related types
export interface Feedback {
  id: number
  ticket_id: number
  user_id: number
  rating: 1 | 2 | 3 | 4 | 5
  review?: string
  created_at: string
  ticket?: Ticket
  user?: User
}

// Notification related types
export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  created_at: string
  data?: any
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

// Dashboard Analytics types
export interface DashboardStats {
  tickets: {
    total: number
    pending: number
    in_progress: number
    completed: number
    overdue: number
  }
  sla_performance: {
    average_response_time: number
    average_resolution_time: number
    sla_compliance_rate: number
    top_performers: Array<{
      user: User
      completion_rate: number
      average_rating: number
    }>
  }
  feedbacks: {
    average_rating_all_time: string
    average_rating_this_month: string
    average_rating_last_month: number
    total_feedback_this_month: number
  }
  urgent_alerts: Array<{
    id: number
    type: 'sla_breach' | 'overdue_response' | 'high_priority'
    message: string
    ticket?: Ticket
    created_at: string
  }>
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface CreateTicketForm {
  service_id: number | string
  judul_permohonan: string
  deskripsi: string
  attachment?: string
}

export interface CreateServiceForm {
  nama_layanan: string
  deskripsi: string
  kategori: string
  sla_id: number | string
  default_priority: string
  is_active: boolean
  sop: string
  skill_ids: number[]
}

// Utility types
export type LoadingState = {
  [key: string]: boolean
}

export type ErrorState = {
  [key: string]: string
}

// Menu item type
export interface MenuItem {
  label: string
  path: string
  icon: string
  badge?: number | string
  children?: MenuItem[]
}