# Tài liệu API Authentication

## Tổng quan

Tài liệu này mô tả chi tiết các API endpoint liên quan đến xác thực (Authentication) trong hệ thống E-Commerce.

**Base URL**: `http://localhost:5000/api/auth`

---

## 1. POST /api/auth/register

### Mô tả
Tạo tài khoản người dùng mới. Hệ thống sẽ tự động hash password và kiểm tra email unique.

### Yêu cầu xác thực
Không cần (Public endpoint)

### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "username": "testuser"
}
```

**Trường bắt buộc**:
- `email` (string): Email hợp lệ, phải unique
- `password` (string): Mật khẩu tối thiểu 6 ký tự
- `fullName` (string): Họ và tên, tối thiểu 2 ký tự

**Trường tùy chọn**:
- `phone` (string): Số điện thoại
- `username` (string): Tên người dùng, phải unique nếu có

### Response thành công (201 Created)
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0123456789",
      "username": "testuser",
      "role": "customer",
      "isEmailVerified": false,
      "addresses": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Response lỗi

**409 Conflict - Email đã tồn tại**:
```json
{
  "success": false,
  "status": 409,
  "message": "Email already exists"
}
```

**400 Bad Request - Validation failed**:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Ghi chú
- Password được hash tự động bằng bcryptjs (12 rounds)
- Refresh token được lưu vào database
- Cookies được set tự động (accessToken và refreshToken)

---

## 2. POST /api/auth/login

### Mô tả
Đăng nhập vào hệ thống. Trả về access token và refresh token.

### Yêu cầu xác thực
Không cần (Public endpoint)

### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Response lỗi

**401 Unauthorized - Thông tin đăng nhập sai**:
```json
{
  "success": false,
  "status": 401,
  "message": "Invalid email or password"
}
```

**401 Unauthorized - Tài khoản đã bị xóa**:
```json
{
  "success": false,
  "status": 401,
  "message": "Account has been deleted"
}
```

### Ghi chú
- Refresh token được lưu vào database
- `lastLogin` được cập nhật
- Cookies được set tự động

---

## 3. POST /api/auth/logout

### Mô tả
Đăng xuất khỏi hệ thống. Thu hồi refresh token (xóa trong DB) và xóa cookies.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
```

### Request Body (tùy chọn)
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> Nếu không gửi refreshToken trong body, hệ thống sẽ lấy từ cookie.

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

### Response lỗi

**401 Unauthorized - Không có token**:
```json
{
  "success": false,
  "status": 401,
  "message": "Not authorized, no token"
}
```

### Ghi chú
- Refresh token bị xóa khỏi database
- Cookies bị xóa
- Client nên xóa token khỏi localStorage/sessionStorage

---

## 4. POST /api/auth/refresh

### Mô tả
Cấp access token mới từ refresh token hợp lệ. Refresh token cũ sẽ bị thay thế bằng token mới.

### Yêu cầu xác thực
Không cần (Public endpoint)

### Request Body (tùy chọn)
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> Nếu không gửi refreshToken trong body, hệ thống sẽ lấy từ cookie.

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Response lỗi

**400 Bad Request - Thiếu refresh token**:
```json
{
  "success": false,
  "status": 400,
  "message": "Refresh token is required"
}
```

**401 Unauthorized - Refresh token không hợp lệ**:
```json
{
  "success": false,
  "status": 401,
  "message": "Invalid refresh token"
}
```

**401 Unauthorized - Refresh token hết hạn**:
```json
{
  "success": false,
  "status": 401,
  "message": "Refresh token expired"
}
```

### Ghi chú
- Refresh token mới được lưu vào database
- Refresh token cũ bị vô hiệu hóa
- Access token mới có thời hạn 15 phút (mặc định)

---

## 5. POST /api/auth/forgot-password

### Mô tả
Tạo reset token và gửi email link đặt lại mật khẩu. Ở môi trường development, reset URL sẽ được trả về trong response.

### Yêu cầu xác thực
Không cần (Public endpoint)

### Request Body
```json
{
  "email": "user@example.com"
}
```

### Response thành công (200 OK)

**Môi trường development**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password reset instructions have been sent",
  "data": {
    "resetUrl": "http://localhost:3000/reset-password?token=..."
  }
}
```

**Môi trường production**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password reset instructions have been sent",
  "data": null
}
```

> Ở production, không trả về resetUrl để tránh lộ thông tin.

### Response lỗi

**400 Bad Request - Validation failed**:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Ghi chú
- Reset token có thời hạn 1 giờ
- Token được lưu vào database (resetPasswordToken, resetPasswordExpire)
- Ở development, reset URL được log ra console
- Ở production, cần tích hợp dịch vụ email thực tế (hiện tại chỉ log)

---

## 6. POST /api/auth/reset-password

### Mô tả
Đặt lại mật khẩu bằng reset token. Token sẽ bị vô hiệu hóa sau khi sử dụng.

### Yêu cầu xác thực
Không cần (Public endpoint)

### Request Body
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password reset successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Response lỗi

**400 Bad Request - Thiếu token**:
```json
{
  "success": false,
  "status": 400,
  "message": "Reset token is required"
}
```

**401 Unauthorized - Token không hợp lệ hoặc hết hạn**:
```json
{
  "success": false,
  "status": 401,
  "message": "Invalid or expired reset token"
}
```

**400 Bad Request - Validation failed**:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    },
    {
      "field": "confirmPassword",
      "message": "Password confirmation does not match"
    }
  ]
}
```

### Ghi chú
- Reset token bị xóa sau khi sử dụng
- Password mới được hash tự động
- User được đăng nhập tự động sau khi reset (trả về tokens)

---

## 7. POST /api/auth/change-password

### Mô tả
Người dùng đổi mật khẩu. Yêu cầu nhập mật khẩu hiện tại để xác thực.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Response lỗi

**401 Unauthorized - Mật khẩu hiện tại sai**:
```json
{
  "success": false,
  "status": 401,
  "message": "Current password is incorrect"
}
```

**400 Bad Request - Validation failed**:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "newPassword",
      "message": "New password must be different from current password"
    },
    {
      "field": "confirmPassword",
      "message": "Password confirmation does not match"
    }
  ]
}
```

### Ghi chú
- Mật khẩu mới phải khác mật khẩu hiện tại
- Password mới được hash tự động
- Tokens mới được tạo sau khi đổi mật khẩu

---

## 8. GET /api/auth/me

### Mô tả
Lấy thông tin người dùng hiện tại.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
```

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User information retrieved successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0123456789",
      "username": "testuser",
      "role": "customer",
      "isEmailVerified": false,
      "addresses": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**401 Unauthorized - Không có token**:
```json
{
  "success": false,
  "status": 401,
  "message": "Not authorized, no token"
}
```

**401 Unauthorized - Token không hợp lệ**:
```json
{
  "success": false,
  "status": 401,
  "message": "Invalid token"
}
```

---

## Thông tin Token

### Access Token
- **Thời hạn**: 15 phút (mặc định, có thể cấu hình qua `JWT_EXPIRES_IN`)
- **Secret**: `JWT_SECRET` từ environment variables
- **Payload**: `{ id: user._id, role: user.role }`
- **Sử dụng**: Xác thực các request cần bảo mật

### Refresh Token
- **Thời hạn**: 7 ngày
- **Secret**: `JWT_REFRESH_SECRET` hoặc `JWT_SECRET` nếu không có
- **Payload**: `{ id: user._id }`
- **Lưu trữ**: Database (trường `refreshToken` trong collection `users`)
- **Sử dụng**: Lấy access token mới khi access token hết hạn

### Reset Token
- **Thời hạn**: 1 giờ
- **Secret**: `JWT_SECRET`
- **Payload**: `{ id: user._id }`
- **Lưu trữ**: Database (trường `resetPasswordToken` và `resetPasswordExpire` trong collection `users`)
- **Sử dụng**: Đặt lại mật khẩu

---

## Cookies

Hệ thống tự động set cookies cho access token và refresh token:

- **accessToken**: Access token
- **refreshToken**: Refresh token

**Cookie Options**:
- `httpOnly`: true (không thể truy cập từ JavaScript)
- `secure`: true (chỉ gửi qua HTTPS) ở production
- `sameSite`: 'strict'
- `expires`: 7 ngày

---

## Bảng dữ liệu

Tất cả dữ liệu liên quan đến authentication được lưu trong collection **`users`**:

- `email`: Email người dùng (unique, required)
- `password`: Mật khẩu đã hash (required, select: false)
- `fullName`: Họ và tên (required)
- `phone`: Số điện thoại (optional)
- `username`: Tên người dùng (optional, unique nếu có)
- `role`: Vai trò (enum: 'customer', 'staff', 'admin', default: 'customer')
- `refreshToken`: Refresh token hiện tại (select: false)
- `resetPasswordToken`: Token đặt lại mật khẩu (optional)
- `resetPasswordExpire`: Thời gian hết hạn của reset token (optional)
- `lastLogin`: Thời gian đăng nhập cuối cùng (optional)
- `isEmailVerified`: Trạng thái xác thực email (default: false)
- `addresses`: Mảng địa chỉ (optional)
- `isDeleted`: Trạng thái soft delete (default: false)

---

## Lưu ý quan trọng

1. **Password Security**: Tất cả password được hash bằng bcryptjs với 12 rounds trước khi lưu vào database.

2. **Token Storage**: Refresh token được lưu trong database để có thể thu hồi khi cần.

3. **Email Service**: Hiện tại, forgot-password chỉ log reset URL ra console. Ở production, cần tích hợp dịch vụ email thực tế (SendGrid, AWS SES, etc.).

4. **Cookie vs Header**: Hệ thống hỗ trợ cả cookie và Authorization header. Client có thể chọn cách phù hợp.

5. **Token Rotation**: Mỗi lần refresh token, refresh token cũ bị vô hiệu hóa và token mới được tạo.

---

## Mã lỗi HTTP

| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Bad Request (validation failed, thiếu tham số) |
| 401 | Unauthorized (token không hợp lệ, thông tin đăng nhập sai) |
| 409 | Conflict (email/username đã tồn tại) |
| 500 | Internal Server Error |

---

Chúc bạn sử dụng API thành công! 🚀











