# API Documentation

This document provides a detailed description of the API endpoints for this project.

**Base URL:** `/sabalong`

## Authentication

All API requests must be authenticated using a Bearer token in the `Authorization` header.

`Authorization: Bearer <your_access_token>`

---

## Auth

### POST /auth/login

Logs in a user and returns an access token.

- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login berhasil",
    "data": {
      "access_token": "ey...",
      "user": {
        "id": 1,
        "nama": "User Name",
        "email": "user@example.com",
        "role": "user"
      }
    }
  }
  ```

### POST /auth/logout

Logs out the currently authenticated user.

- **Authentication:** Required
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logout berhasil"
  }
  ```

### PUT /auth/change-password

Changes the password for the currently authenticated user.

- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "passwordLama": "oldPassword",
    "passwordBaru": "newPassword"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password berhasil diperbarui"
  }
  ```

---

## Roles

### GET /roles

Get all user roles.

- **Authentication:** Required
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "role_name": "admin",
        "role_description": "Administrator",
        "created_at": "2025-10-25T13:25:40.688Z"
      },
      {
        "id": 2,
        "role_name": "user",
        "role_description": "Regular User",
        "created_at": "2025-10-25T13:25:40.688Z"
      }
    ]
  }
  ```

### POST /roles

Create a new user role.

- **Authentication:** Required (Admin only)
- **Request Body:**
  ```json
  {
    "role_name": "test",
    "role_description": "testing"
  }
  ```
- **Response:** The created role object.
  ```json
  {
    "success": true,
    "message": "Role baru berhasil ditambahkan",
    "data": {
      "id": 6,
      "role_name": "test",
      "role_description": "testing",
      "created_at": "2025-11-18T08:56:55.327Z"
    }
  }
  ```

### PUT /roles/:id

Update an existing user role.

- **Authentication:** Required (Admin only)
- **Request Body:**
  ```json
  {
    "role_name": "updatetest",
    "role_description": "ini updatean testing"
  }
  ```
- **Response:** The updated role object.

```json
{
  "success": true,
  "message": "Role berhasil diupdate",
  "data": {
    "id": 6,
    "role_name": "updatetest",
    "role_description": "ini updatean testing",
    "created_at": "2025-11-18T08:56:55.327Z"
  }
}
```

### DELETE /roles/:id

Delete a user role.

- **Authentication:** Required (Admin only)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Role updatetest berhasil dihapus"
  }
  ```

## Skills

### GET /skills

Get all skills.

- **Authentication:** Required
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "skill_name": "Frontend Development",
        "skill_description": "Kemampuan dalam membangun tampilan antarmuka pengguna (UI) menggunakan teknologi seperti HTML, CSS, dan JavaScript. Fokus utamanya adalah membuat aplikasi web yang responsif, interaktif, dan mudah digunakan.",
        "kategori": "Development",
        "created_at": "2025-10-25T13:25:40.835Z"
      },
      ,
      {
        "id": 2,
        "skill_name": "Backend Development",
        "skill_description": "Kemampuan dalam mengembangkan logika dan struktur di sisi server menggunakan bahasa seperti Node.js, PHP, atau Python. Bertanggung jawab terhadap pengelolaan database, autentikasi, dan API agar sistem berjalan stabil.",
        "kategori": "Development",
        "created_at": "2025-10-25T13:25:40.840Z"
      }
    ]
  }
  ```

### GET /skills/:id

Get a specific skill by ID.

- **Authentication:** Required
- **Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "skill_name": "Frontend Development",
    "skill_description": "Kemampuan dalam membangun tampilan antarmuka pengguna (UI) menggunakan teknologi seperti HTML, CSS, dan JavaScript. Fokus utamanya adalah membuat aplikasi web yang responsif, interaktif, dan mudah digunakan.",
    "kategori": "Development",
    "created_at": "2025-10-25T13:25:40.835Z"
  }
}
```

### POST /skills

Create a new skill.

- **Authentication:** Required (Admin only)
- **Request Body:**
  ```json
  {
    "skill_name": "New Skill",
    "skill_description": "Description of the new skill",
    "kategori": "Technical"
  }
  ```
- **Response:**:

```json
{
  "success": true,
  "message": "Skill baru berhasil ditambahkan",
  "data": {
    "id": 14,
    "skill_name": "test",
    "skill_description": "testing",
    "kategori": "development",
    "created_at": "2025-11-18T09:09:52.104Z"
  }
}
```

### PUT /skills/:id

Update a skill.

- **Authentication:** Required (Admin only)
- **Request Body:**
  ```json
  {
    "skill_name": "Updated Skill Name",
    "skill_description": "Updated description",
    "kategori": "Soft Skill"
  }
  ```
- **Response:** The updated skill object.

### DELETE /skills/:id

Delete a skill.

- **Authentication:** Required (Admin only)
- **Response:** Success message.

---

## SLAs (Service Level Agreements)

### GET /slas

Get all SLAs.

- **Authentication:** Required
- **Response:** A list of SLA objects.

### POST /slas

Create a new SLA.

- **Authentication:** Required (Admin only)
- **Request Body:**
  ```json
  {
    "sla_name": "High Priority",
    "response_hours": 1,
    "resolution_hours": 4,
    "description": "For critical issues",
    "is_active": true
  }
  ```
- **Response:** The created SLA object.

### PUT /slas/:id

Update an SLA.

- **Authentication:** Required (Admin only)
- **Request Body:**
  ```json
  {
    "sla_name": "Updated SLA Name",
    "response_hours": 2,
    "resolution_hours": 8
  }
  ```
- **Response:** The updated SLA object.

### DELETE /slas/:id

Delete an SLA.

- **Authentication:** Required (Admin only)
- **Response:** Success message.

---

## Services

### GET /services

Get all active services.

- **Authentication:** Required
- **Response:** A list of service objects with associated SLA and skills.

### GET /services/:id

Get a specific service by ID.

- **Authentication:** Required
- **Response:** A service object with associated SLA and skills.

### POST /services

Create a new service.

- **Authentication:** Required (Admin only)
- **Request Body:**
  ```json
  {
    "nama_layanan": "New Service",
    "deskripsi": "Description of the service",
    "kategori": "IT Support",
    "sla_id": 1,
    "default_priority": "High",
    "icon": "service-icon.png",
    "skill_ids": [1, 2]
  }
  ```
- **Response:** The created service object.

### PUT /services/:id

Update a service.

- **Authentication:** Required (Admin only)
- **Request Body:** (Fields are optional)
  ```json
  {
    "nama_layanan": "Updated Service Name",
    "is_active": false,
    "skill_ids": [3, 4]
  }
  ```
- **Response:** The updated service object.

### DELETE /services/:id

Delete a service.

- **Authentication:** Required (Admin only)
- **Response:** Success message.

---

## Users

### GET /users

Get all users. Can be filtered by role.

- **Authentication:** Required
- **Query Params:** `?role=petugas`
- **Response:** A list of user objects (without passwords).

### GET /users/profile

Get the profile of the currently logged-in user.

- **Authentication:** Required
- **Response:** The user object of the logged-in user.

### GET /users/:id

Get a user by ID.

- **Authentication:** Required (Admin or `petugas` only)
- **Response:** A user object (without password).

### POST /users

Create a new user.

- **Authentication:** Required (Admin only)
- **Request Body:**
  ```json
  {
    "role_id": 2,
    "nama": "New User",
    "email": "new.user@example.com",
    "password": "password123",
    "instansi": "New Company",
    "skills": [{ "skill_id": 1, "level": "junior" }]
  }
  ```
- **Response:** The created user object.

### PUT /users/:id

Update a user.

- **Authentication:** Required (Admin only)
- **Request Body:** (Fields are optional)
  ```json
  {
    "nama": "Updated User Name",
    "is_active": true,
    "skills": [{ "skill_id": 2, "level": "senior" }]
  }
  ```
- **Response:** The updated user object.

### DELETE /users/:id

Delete a user.

- **Authentication:** Required (Admin only)
- **Response:** Success message.

---

## Tickets

### POST /tickets

Create a new ticket.

- **Authentication:** Required (`user` role only)
- **Request Body:**
  ```json
  {
    "service_id": 1,
    "judul_permohonan": "Cannot connect to printer",
    "deskripsi": "My computer cannot find the office printer.",
    "attachment": "screenshot.png"
  }
  ```
- **Response:** The created ticket object.

### GET /tickets

Get tickets based on user role.

- **User:** Sees their own tickets.
- **Petugas:** Sees their assigned tickets and unassigned tickets.
- **Admin:** Sees all tickets.

- **Authentication:** Required
- **Query Params:** `?limit=10`
- **Response:** A list of ticket objects.

### GET /tickets/:id

Get a ticket by ID. Access is restricted based on user role.

- **Authentication:** Required
- **Response:** A ticket object with details and logs.

### PUT /tickets/:id/assign

Assign a ticket to a `petugas`.

- **Authentication:** Required (Admin only)
- **Request Body:**
  ```json
  {
    "petugas_id": 5
  }
  ```
- **Response:** The updated ticket object.

### PUT /tickets/:id/status

Update the status of a ticket.

- **Authentication:** Required (Admin or assigned `petugas` only)
- **Request Body:**
  ```json
  {
    "status": "selesai",
    "notes": "The issue has been resolved."
  }
  ```
- **Response:** The updated ticket object.

### PUT /tickets/:id/escalate

Escalate a ticket.

- **Authentication:** Required (Assigned `petugas` only)
- **Request Body:**
  ```json
  {
    "eskalasi_reason": "Need assistance from a senior technician."
  }
  ```
- **Response:** The updated ticket object.

### POST /tickets/:id/logs

Add a comment to a ticket.

- **Authentication:** Required (Admin, assigned `petugas`, or ticket requester)
- **Request Body:**
  ```json
  {
    "notes": "I have tried restarting the printer, but it didn't work."
  }
  ```
- **Response:** The created log object.

---

## Feedbacks

### GET /feedbacks

Get all feedbacks.

- **Authentication:** Required (Admin or `petugas` only)
- **Response:** A list of feedback objects.

### POST /feedbacks

Create a new feedback for a ticket.

- **Authentication:** Required (`user` role only)
- **Request Body:**
  ```json
  {
    "ticket_id": 123,
    "rating": 5,
    "review": "The service was excellent!"
  }
  ```
- **Response:** The created feedback object.

---

## Notifications

### GET /notifications

Get notifications for the logged-in user (up to 30 latest).

- **Authentication:** Required
- **Response:** A list of notification objects.

### PUT /notifications/read-all

Mark all unread notifications as read.

- **Authentication:** Required
- **Response:** Success message.

### PUT /notifications/:id/read

Mark a specific notification as read.

- **Authentication:** Required
- **Response:** The updated notification object.

---

## Dashboard Analytics

### GET /dashboard-analytics

Get dashboard analytics data.

- **Authentication:** Required (Admin or `petugas` only)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "tickets": {
        "pending": 10,
        "on_progress": 5,
        "eskalasi": 1,
        "selesai": 50,
        "closed": 20
      },
      "feedbacks": {
        "average_rating_all_time": "4.5",
        "average_rating_this_month": "4.8",
        "average_rating_last_month": "4.2",
        "total_feedback_this_month": 15
      },
      "petugas": {
        "total": 10,
        "available": 3
      },
      "users": {
        "total": 150
      }
    }
  }
  ```
