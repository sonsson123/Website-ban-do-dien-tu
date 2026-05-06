# Tài liệu API Users

## Tổng quan

Tài liệu này mô tả chi tiết các API endpoint liên quan đến quản lý người dùng (Users) trong hệ thống E-Commerce.

**Base URL**: `http://localhost:5000/api/users`

---

## 1. GET /api/users/me

### Mô tả
Lấy thông tin người dùng hiện tại (đã đăng nhập).

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
      "avatar": "https://example.com/avatar.jpg",
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

---

## 2. PATCH /api/users/me

### Mô tả
Cập nhật hồ sơ người dùng hiện tại (tên, số điện thoại, avatar URL, username).

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "fullName": "Nguyễn Văn B",
  "phone": "0987654321",
  "avatar": "https://example.com/new-avatar.jpg",
  "username": "newusername"
}
```

**Tất cả các trường đều tùy chọn**:
- `fullName` (string): Họ và tên, 2-100 ký tự
- `phone` (string): Số điện thoại Việt Nam hợp lệ
- `avatar` (string): URL ảnh đại diện
- `username` (string): Tên người dùng, 3-30 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới, phải unique

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn B",
      "phone": "0987654321",
      "username": "newusername",
      "avatar": "https://example.com/new-avatar.jpg",
      "role": "customer",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**409 Conflict - Username đã tồn tại**:
```json
{
  "success": false,
  "status": 409,
  "message": "Username already exists"
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
      "field": "phone",
      "message": "Please provide a valid Vietnamese phone number"
    }
  ]
}
```

---

## 3. GET /api/users/me/addresses

### Mô tả
Lấy danh sách địa chỉ giao hàng của người dùng hiện tại.

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
  "message": "Addresses retrieved successfully",
  "data": {
    "addresses": [
      {
        "_id": "...",
        "fullName": "Nguyễn Văn A",
        "phone": "0123456789",
        "street": "123 Đường ABC",
        "ward": "Phường 1",
        "district": "Quận 1",
        "city": "Hồ Chí Minh",
        "isDefault": true
      },
      {
        "_id": "...",
        "fullName": "Nguyễn Văn A",
        "phone": "0123456789",
        "street": "456 Đường XYZ",
        "ward": "Phường 2",
        "district": "Quận 2",
        "city": "Hồ Chí Minh",
        "isDefault": false
      }
    ]
  }
}
```

### Response lỗi

**401 Unauthorized**:
```json
{
  "success": false,
  "status": 401,
  "message": "Not authorized, no token"
}
```

---

## 4. POST /api/users/me/addresses

### Mô tả
Thêm địa chỉ giao hàng mới. Có thể đặt làm địa chỉ mặc định.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "street": "123 Đường ABC",
  "ward": "Phường 1",
  "district": "Quận 1",
  "city": "Hồ Chí Minh",
  "isDefault": true
}
```

**Trường bắt buộc**:
- `fullName` (string): Tên người nhận, 2-100 ký tự
- `phone` (string): Số điện thoại Việt Nam hợp lệ
- `street` (string): Địa chỉ đường/phố, 5-200 ký tự
- `city` (string): Thành phố, 2-100 ký tự

**Trường tùy chọn**:
- `ward` (string): Phường/xã, tối đa 100 ký tự
- `district` (string): Quận/huyện, tối đa 100 ký tự
- `isDefault` (boolean): Đặt làm địa chỉ mặc định (mặc định: false)

### Response thành công (201 Created)
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Address added successfully",
  "data": {
    "address": {
      "_id": "...",
      "fullName": "Nguyễn Văn A",
      "phone": "0123456789",
      "street": "123 Đường ABC",
      "ward": "Phường 1",
      "district": "Quận 1",
      "city": "Hồ Chí Minh",
      "isDefault": true
    }
  }
}
```

### Response lỗi

**400 Bad Request - Validation failed**:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "phone",
      "message": "Please provide a valid Vietnamese phone number"
    }
  ]
}
```

### Ghi chú
- Nếu `isDefault` là `true`, tất cả các địa chỉ khác sẽ được đặt `isDefault = false`

---

## 5. PATCH /api/users/me/addresses/:addressId

### Mô tả
Cập nhật thông tin địa chỉ giao hàng.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `addressId` (string): ID của địa chỉ cần cập nhật (MongoDB ObjectId)

### Request Body
```json
{
  "fullName": "Nguyễn Văn B",
  "phone": "0987654321",
  "street": "456 Đường XYZ",
  "ward": "Phường 2",
  "district": "Quận 2",
  "city": "Hà Nội",
  "isDefault": false
}
```

**Tất cả các trường đều tùy chọn**:
- `fullName` (string): Tên người nhận, 2-100 ký tự
- `phone` (string): Số điện thoại Việt Nam hợp lệ
- `street` (string): Địa chỉ đường/phố, 5-200 ký tự
- `ward` (string): Phường/xã, tối đa 100 ký tự
- `district` (string): Quận/huyện, tối đa 100 ký tự
- `city` (string): Thành phố, 2-100 ký tự
- `isDefault` (boolean): Đặt làm địa chỉ mặc định

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "address": {
      "_id": "...",
      "fullName": "Nguyễn Văn B",
      "phone": "0987654321",
      "street": "456 Đường XYZ",
      "ward": "Phường 2",
      "district": "Quận 2",
      "city": "Hà Nội",
      "isDefault": false
    }
  }
}
```

### Response lỗi

**404 Not Found - Địa chỉ không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Address not found"
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
      "field": "addressId",
      "message": "Invalid address ID"
    }
  ]
}
```

### Ghi chú
- Nếu `isDefault` được đặt là `true`, tất cả các địa chỉ khác sẽ được đặt `isDefault = false`

---

## 6. DELETE /api/users/me/addresses/:addressId

### Mô tả
Xóa địa chỉ giao hàng.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `addressId` (string): ID của địa chỉ cần xóa (MongoDB ObjectId)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Address deleted successfully",
  "data": null
}
```

### Response lỗi

**404 Not Found - Địa chỉ không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Address not found"
}
```

**400 Bad Request - Invalid address ID**:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "addressId",
      "message": "Invalid address ID"
    }
  ]
}
```

---

## 7. GET /api/users (Admin Only)

### Mô tả
Lấy danh sách người dùng với khả năng filter và pagination. Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `page` (number, optional): Số trang (mặc định: 1)
- `limit` (number, optional): Số lượng items mỗi trang (mặc định: 10, tối đa: 100)
- `role` (string, optional): Lọc theo role (`customer`, `staff`, `admin`)
- `isDeleted` (string, optional): Lọc theo trạng thái xóa (`true`, `false`)
- `search` (string, optional): Tìm kiếm theo email, fullName, hoặc username

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "...",
        "email": "user1@example.com",
        "fullName": "Nguyễn Văn A",
        "phone": "0123456789",
        "username": "user1",
        "role": "customer",
        "isEmailVerified": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "_id": "...",
        "email": "user2@example.com",
        "fullName": "Nguyễn Văn B",
        "phone": "0987654321",
        "username": "user2",
        "role": "staff",
        "isEmailVerified": true,
        "createdAt": "2024-01-02T00:00:00.000Z",
        "updatedAt": "2024-01-02T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
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

**403 Forbidden - Không có quyền admin**:
```json
{
  "success": false,
  "status": 403,
  "message": "You do not have permission to perform this action"
}
```

### Ví dụ sử dụng

**Lấy trang 1, 20 items mỗi trang**:
```
GET /api/users?page=1&limit=20
```

**Lọc theo role customer**:
```
GET /api/users?role=customer
```

**Tìm kiếm user**:
```
GET /api/users?search=nguyen
```

**Lọc user đã bị xóa**:
```
GET /api/users?isDeleted=true
```

**Kết hợp nhiều filter**:
```
GET /api/users?role=customer&isDeleted=false&search=test&page=1&limit=10
```

---

## 8. PATCH /api/users/:id (Admin Only)

### Mô tả
Cập nhật thông tin user (role, status, profile). Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `id` (string): ID của user cần cập nhật (MongoDB ObjectId)

### Request Body
```json
{
  "role": "staff",
  "isDeleted": false,
  "fullName": "Nguyễn Văn C",
  "phone": "0111222333",
  "avatar": "https://example.com/avatar.jpg",
  "username": "newusername"
}
```

**Tất cả các trường đều tùy chọn**:
- `role` (string): Vai trò (`customer`, `staff`, `admin`)
- `isDeleted` (boolean): Trạng thái soft delete
- `fullName` (string): Họ và tên, 2-100 ký tự
- `phone` (string): Số điện thoại Việt Nam hợp lệ
- `avatar` (string): URL ảnh đại diện
- `username` (string): Tên người dùng, 3-30 ký tự, phải unique

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn C",
      "phone": "0111222333",
      "username": "newusername",
      "role": "staff",
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**404 Not Found - User không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "User not found"
}
```

**409 Conflict - Username đã tồn tại**:
```json
{
  "success": false,
  "status": 409,
  "message": "Username already exists"
}
```

**400 Bad Request - Invalid role**:
```json
{
  "success": false,
  "status": 400,
  "message": "Invalid role"
}
```

**403 Forbidden - Không có quyền admin**:
```json
{
  "success": false,
  "status": 403,
  "message": "You do not have permission to perform this action"
}
```

---

## 9. DELETE /api/users/:id (Admin Only)

### Mô tả
Soft delete user (đánh dấu xóa, không xóa thực sự). Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `id` (string): ID của user cần xóa (MongoDB ObjectId)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

### Response lỗi

**404 Not Found - User không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "User not found"
}
```

**400 Bad Request - Không thể xóa chính mình**:
```json
{
  "success": false,
  "status": 400,
  "message": "You cannot delete your own account"
}
```

**403 Forbidden - Không có quyền admin**:
```json
{
  "success": false,
  "status": 403,
  "message": "You do not have permission to perform this action"
}
```

### Ghi chú
- Soft delete: User được đánh dấu `isDeleted = true`, không bị xóa khỏi database
- Admin không thể xóa chính tài khoản của mình
- User đã bị soft delete sẽ không thể đăng nhập

---

## Cấu trúc dữ liệu Address

Mỗi địa chỉ trong mảng `addresses` có cấu trúc:

```json
{
  "_id": "ObjectId",
  "fullName": "string (required, 2-100 chars)",
  "phone": "string (required, Vietnamese phone)",
  "street": "string (required, 5-200 chars)",
  "ward": "string (optional, max 100 chars)",
  "district": "string (optional, max 100 chars)",
  "city": "string (required, 2-100 chars)",
  "isDefault": "boolean (default: false)"
}
```

---

## Mã lỗi HTTP

| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Bad Request (validation failed, thiếu tham số) |
| 401 | Unauthorized (token không hợp lệ, chưa đăng nhập) |
| 403 | Forbidden (không có quyền truy cập) |
| 404 | Not Found (resource không tồn tại) |
| 409 | Conflict (username/email đã tồn tại) |
| 500 | Internal Server Error |

---

## Lưu ý quan trọng

1. **Authentication**: Tất cả endpoints (trừ admin endpoints) yêu cầu user phải đăng nhập và có token hợp lệ.

2. **Authorization**: Các endpoints admin (`GET /api/users`, `PATCH /api/users/:id`, `DELETE /api/users/:id`) yêu cầu role `admin`.

3. **Address Management**: 
   - Mỗi user có thể có nhiều địa chỉ
   - Chỉ một địa chỉ có thể là mặc định (`isDefault = true`)
   - Khi đặt một địa chỉ làm mặc định, các địa chỉ khác tự động bỏ mặc định

4. **Soft Delete**: 
   - User bị soft delete (`isDeleted = true`) vẫn tồn tại trong database
   - User đã bị soft delete không thể đăng nhập
   - Admin không thể xóa chính tài khoản của mình

5. **Username Uniqueness**: Username phải unique trong toàn bộ hệ thống (nếu được cung cấp).

6. **Pagination**: 
   - Mặc định: page = 1, limit = 10
   - Limit tối đa: 100
   - Response bao gồm metadata pagination

7. **Search**: Tìm kiếm user theo email, fullName, hoặc username (case-insensitive).

---

Chúc bạn sử dụng API thành công! 🚀


