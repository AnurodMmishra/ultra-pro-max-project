# DeadlineShield API Testing Guide - Postman Collection

## Base URL
```
http://localhost:5000/api
```

---

## 📌 AUTHENTICATION & REGISTRATION ENDPOINTS

### 1. Register New User
**Endpoint:** `POST /auth/register`

**Description:** Create a new user account with email, phone, password, and role selection.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "Password@123",
  "role": "student"
}
```

**Response (Success - 201):**
```json
{
  "message": "Registration successful. OTP sent to email and phone.",
  "success": true
}
```

**Response (Error - 400):**
```json
{
  "message": "Email already exists"
}
```

**Notes:**
- Role can be: "student", "faculty", "admin", "other"
- Phone must be in E.164 format (e.g., +91...)
- Password must contain: 6+ chars, uppercase, lowercase, number, special char
- OTP required for verification before login

---

### 2. Verify Email OTP
**Endpoint:** `POST /auth/verify-email-otp`

**Description:** Verify the 6-digit OTP sent to user's email.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
   "email": "john@example.com",
  "otp": "123456"
}
```

**Response (Success - 200):**
```json
{
  "message": "Email verified successfully",
  "success": true
}
```

---

### 3. Verify Phone OTP
**Endpoint:** `POST /auth/verify-phone-otp`

**Description:** Verify the 6-digit OTP sent to user's phone via SMS.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response (Success - 200):**
```json
{
  "message": "Phone verified successfully",
  "success": true
}
```

---

### 4. Login
**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and get JWT token (requires both email and phone verified).

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response (Success - 200):**
```json
{
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "phone": "+919876543210"
  }
}
```

**Response (Pending Verification - 403):**
```json
{
  "message": "Account verification required. Please verify both email and phone.",
  "needsEmailVerification": true,
  "needsPhoneVerification": false
}
```

---

### 5. Resend OTP
**Endpoint:** `POST /auth/resend-otp`

**Description:** Resend OTP to email or phone (30-second cooldown between requests).

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "type": "email"
}
```
Or for phone:
```json
{
  "phone": "+919876543210",
  "type": "phone"
}
```

**Response (Success - 200):**
```json
{
  "message": "OTP sent successfully",
  "success": true
}
```

---

## 📝 PERSONAL TASK ENDPOINTS

All task endpoints require JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 6. Add Task
**Endpoint:** `POST /tasks/add`

**Description:** Create a new personal task with optional email/SMS reminders.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Complete project proposal",
  "description": "Finish the deadline-shield proposal document",
  "deadline": "2026-04-20",
  "notifyType": "both",
  "email": "john@example.com",
  "phone": "+919876543210",
  "requireProof": false
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "title": "Complete project proposal",
    "description": "Finish the deadline-shield proposal document",
    "deadline": "2026-04-20",
    "isCompleted": false,
    "completedAt": null,
    "notifyType": "both",
    "email": "john@example.com",
    "phone": "+919876543210",
    "requireProof": false,
    "proofImage": null,
    "createdAt": "2026-04-12T10:30:00.000Z"
  }
}
```

---

### 7. Get All Tasks
**Endpoint:** `GET /tasks`

**Description:** Retrieve all tasks for the logged-in user.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
?status=pending     // Filter: pending, completed, all
?sort=deadline      // Sort by: deadline, created
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Complete project proposal",
      "deadline": "2026-04-20",
      "isCompleted": false,
      "notifyType": "both"
    }
  ]
}
```

---

### 8. Update Task
**Endpoint:** `PATCH /tasks/{taskId}`

**Description:** Update task details (title, description, deadline, notification settings).

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated project proposal",
  "description": "Updated description",
  "deadline": "2026-04-25",
  "notifyType": "email",
  "email": "newemail@example.com"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": { ... }
}
```

---

### 9. Mark Task Complete
**Endpoint:** `PATCH /tasks/{taskId}/mark-complete`

**Description:** Mark a task as completed.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Task marked complete",
  "task": {
    "_id": "507f1f77bcf86cd799439011",
    "isCompleted": true,
    "completedAt": "2026-04-12T15:45:00.000Z"
  }
}
```

---

### 10. Upload Proof Image
**Endpoint:** `POST /tasks/{taskId}/upload-proof`

**Description:** Upload an image as proof of task completion (for tasks with `requireProof: true`).

**Request Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Form Data:**
- Key: `proof`
- Value: Image file (JPG, PNG - max 5MB)

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Proof uploaded successfully",
  "proofUrl": "/uploads/507f1f77bcf86cd799439011-proof.jpg"
}
```

---

### 11. Delete Task
**Endpoint:** `DELETE /tasks/{taskId}`

**Description:** Permanently delete a task.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 🏫 PROFESSIONAL SECTION ENDPOINTS

### STUDENT ENDPOINTS

#### 12. Get My Assignments
**Endpoint:** `GET /professional/my-assignments`

**Description:** Get all assignments assigned to the student by faculty members.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Physics Assignment",
      "description": "Chapter 5-7 problems",
      "deadline": "2026-04-20",
      "notifyType": "email",
      "assignedBy": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Dr. Smith",
        "email": "smith@school.edu"
      },
      "completions": [
        {
          "userId": "507f1f77bcf86cd799439010",
          "status": "pending",
          "completedAt": null
        }
      ]
    }
  ]
}
```

---

#### 13. Mark Assignment Complete
**Endpoint:** `PATCH /professional/assignments/{assignmentId}/complete`

**Description:** Mark an assignment as completed.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Marked as complete"
}
```

---

### FACULTY ENDPOINTS

#### 14. Get Students
**Endpoint:** `GET /professional/students`

**Description:** Get list of all students (only accessible to faculty).

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439010",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "createdAt": "2026-04-10T08:00:00.000Z"
    }
  ]
}
```

---

#### 15. Create Assignment for Students
**Endpoint:** `POST /professional/assignments`

**Description:** Create an assignment and assign it to students.

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "title": "Physics Assignment - Chapter 5",
  "description": "Complete all problems from chapter 5, pages 120-135",
  "deadline": "2026-04-20",
  "assignTo": "all",
  "notifyType": "both"
}
```

**assignTo Options:**
- `"all"` - Assign to all students
- `["id1", "id2"]` - Assign to specific students

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Assignment created",
  "assignedCount": 15,
  "data": { ... }
}
```

---

#### 16. Get Created Assignments (Faculty)
**Endpoint:** `GET /professional/created-assignments`

**Description:** Get all assignments created by this faculty member.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Physics Assignment",
      "deadline": "2026-04-20",
      "assignedTo": [...],
      "completions": [
        {
          "userId": "507f1f77bcf86cd799439010",
          "status": "pending"
        },
        {
          "userId": "507f1f77bcf86cd799439013",
          "status": "completed",
          "completedAt": "2026-04-19T10:30:00.000Z"
        }
      ]
    }
  ]
}
```

---

### ADMIN ENDPOINTS

#### 17. Get Faculty
**Endpoint:** `GET /professional/faculty`

**Description:** Get list of all faculty members (only accessible to admin).

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Dr. Smith",
      "email": "smith@school.edu",
      "phone": "+919876543211",
      "createdAt": "2026-04-08T09:00:00.000Z"
    }
  ]
}
```

---

#### 18. Create Assignment for Faculty
**Endpoint:** `POST /professional/assignments`

**Description:** Create an assignment and assign it to faculty members (same as faculty endpoint, but admin can assign to faculty).

**Request Body:**
```json
{
  "title": "Curriculum Update - Q2 2026",
  "description": "Update curriculum for new semester",
  "deadline": "2026-04-30",
  "assignTo": "all",
  "notifyType": "email"
}
```

---

## 🔔 NOTIFICATION ENDPOINTS

### 19. Get Notifications
**Endpoint:** `GET /notifications`

**Description:** Get all notifications for the logged-in user.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
?read=false     // Filter: read, unread, all
?limit=20       // Number of notifications to fetch
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "userId": "507f1f77bcf86cd799439010",
      "title": "Task Deadline Approaching",
      "message": "Physics Assignment due in 1 hour",
      "type": "deadline",
      "read": false,
      "createdAt": "2026-04-12T14:30:00.000Z"
    }
  ]
}
```

---

### 20. Mark Notification as Read
**Endpoint:** `PATCH /notifications/{notificationId}/read`

**Description:** Mark a specific notification as read.

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## ❌ ERROR RESPONSES

All endpoints may return these error responses:

### 401 Unauthorized
```json
{
  "message": "No token provided" / "Invalid token"
}
```

### 403 Forbidden
```json
{
  "message": "Only students can access this" / "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "message": "Task not found" / "Assignment not found"
}
```

### 400 Bad Request
```json
{
  "message": "Please fill all required fields"
}
```

### 500 Server Error
```json
{
  "message": "Server error"
}
```

---

## 🧪 TESTING SCENARIOS

### Scenario 1: Student Registration & Login
1. Call Register endpoint with role="student"
2. Verify email OTP
3. Verify phone OTP
4. Login and get token
5. Use token in subsequent calls

### Scenario 2: Faculty Creates Assignment
1. Login as faculty
2. Call "Get Students" to see available students
3. Create assignment with `assignTo: "all"`
4. Verify assignment created
5. Check "Created Assignments" to see it listed

### Scenario 3: Student Receives & Completes Assignment
1. Login as student
2. Call "Get My Assignments"
3. View assignments from faculty
4. Call "Mark Assignment Complete"

### Scenario 4: Admin Manages Faculty
1. Login as admin
2. Call "Get Faculty"
3. Create assignment for faculty
4. Check "Created Assignments" to see assignments

### Scenario 5: Task with Proof Upload
1. Create task with `requireProof: true`
2. After completing task, call "Upload Proof"
3. Verify proof URL returned
4. Mark task as complete

---

## 📋 AUTHORIZATION MATRIX

| Endpoint | Student | Faculty | Admin | Other |
|----------|---------|---------|-------|-------|
| /auth/register | ✅ | ✅ | ✅ | ✅ |
| /auth/login | ✅ | ✅ | ✅ | ✅ |
| /tasks/add | ✅ | ✅ | ✅ | ✅ |
| /tasks (GET) | ✅ | ✅ | ✅ | ✅ |
| /professional/my-assignments | ✅ | ❌ | ❌ | ❌ |
| /professional/students | ❌ | ✅ | ❌ | ❌ |
| /professional/faculty | ❌ | ❌ | ✅ | ❌ |
| /professional/assignments (POST) | ❌ | ✅ | ✅ | ❌ |

---

## 🔐 POSTMAN SETUP

1. **Create Environment Variable:**
   - Variable: `base_url` = `http://localhost:5000/api`
   - Variable: `token` = (set after login)

2. **In Header:**
   ```
   Authorization: Bearer {{token}}
   ```

3. **Pre-request Script (for token update):**
   ```javascript
   // After login, run this to update token
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.token);
   ```

---

## 📞 CONTACT & SUPPORT

For API issues, check:
1. Server is running on port 5000
2. MongoDB connection is active
3. Environment variables (.env) are set correctly
4. JWT token is valid and not expired
5. User role has access to endpoint

---

**Last Updated:** 2026-04-12
**API Version:** 1.0
**Status:** Production Ready (with security fixes applied)
