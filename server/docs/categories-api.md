# Tài liệu API Categories

## Tổng quan

Tài liệu này mô tả chi tiết các API endpoint liên quan đến quản lý danh mục sản phẩm (Categories) trong hệ thống E-Commerce.

**Base URL**: `http://localhost:5000/api/categories`

---

## 1. GET /api/categories

### Mô tả
Lấy danh sách tất cả categories dạng phẳng (flat list), không phân cấp. Sắp xếp theo level và tên.

### Yêu cầu xác thực
Không cần (Public endpoint)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "_id": "...",
        "name": "Điện thoại",
        "slug": "dien-thoai",
        "description": "Các sản phẩm điện thoại di động",
        "parent": null,
        "level": 0,
        "image": "https://example.com/images/phone.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "_id": "...",
        "name": "iPhone",
        "slug": "iphone",
        "description": "Điện thoại iPhone",
        "parent": {
          "_id": "...",
          "name": "Điện thoại",
          "slug": "dien-thoai"
        },
        "level": 1,
        "image": "https://example.com/images/iphone.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "_id": "...",
        "name": "Laptop",
        "slug": "laptop",
        "description": "Máy tính xách tay",
        "parent": null,
        "level": 0,
        "image": "https://example.com/images/laptop.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Ghi chú
- Categories được sắp xếp theo `level` (tăng dần) và `name` (alphabetical)
- Parent category được populate với `name` và `slug`
- Chỉ trả về categories chưa bị xóa (`isDeleted: false`)

---

## 2. GET /api/categories/tree

### Mô tả
Lấy cây danh mục phân cấp (parent/child). Mỗi category có thể chứa mảng `children` là các category con.

### Yêu cầu xác thực
Không cần (Public endpoint)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Category tree retrieved successfully",
  "data": {
    "categories": [
      {
        "_id": "...",
        "name": "Điện thoại",
        "slug": "dien-thoai",
        "description": "Các sản phẩm điện thoại di động",
        "parent": null,
        "level": 0,
        "image": "https://example.com/images/phone.jpg",
        "children": [
          {
            "_id": "...",
            "name": "iPhone",
            "slug": "iphone",
            "description": "Điện thoại iPhone",
            "parent": "...",
            "level": 1,
            "image": "https://example.com/images/iphone.jpg",
            "children": []
          },
          {
            "_id": "...",
            "name": "Samsung",
            "slug": "samsung",
            "description": "Điện thoại Samsung",
            "parent": "...",
            "level": 1,
            "image": "https://example.com/images/samsung.jpg",
            "children": []
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "_id": "...",
        "name": "Laptop",
        "slug": "laptop",
        "description": "Máy tính xách tay",
        "parent": null,
        "level": 0,
        "image": "https://example.com/images/laptop.jpg",
        "children": [],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Ghi chú
- Chỉ trả về các category gốc (parent = null) với cấu trúc cây đầy đủ
- Mỗi category có mảng `children` chứa các category con
- Cấu trúc có thể lồng nhau nhiều cấp

---

## 3. GET /api/categories/:id

### Mô tả
Lấy thông tin chi tiết của một category theo ID.

### Yêu cầu xác thực
Không cần (Public endpoint)

### URL Parameters
- `id` (string): ID của category (MongoDB ObjectId)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "category": {
      "_id": "...",
      "name": "iPhone",
      "slug": "iphone",
      "description": "Điện thoại iPhone",
      "parent": {
        "_id": "...",
        "name": "Điện thoại",
        "slug": "dien-thoai",
        "level": 0
      },
      "level": 1,
      "image": "https://example.com/images/iphone.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**404 Not Found - Category không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Category not found"
}
```

**400 Bad Request - Invalid category ID**:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "id",
      "message": "Invalid category ID"
    }
  ]
}
```

### Ghi chú
- Parent category được populate với `name`, `slug`, và `level`
- Chỉ trả về category chưa bị xóa

---

## 4. POST /api/categories (Admin Only)

### Mô tả
Tạo category mới. Slug sẽ được tự động tạo từ name. Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "name": "Điện thoại",
  "description": "Các sản phẩm điện thoại di động",
  "parent": null,
  "image": "https://example.com/images/phone.jpg"
}
```

**Trường bắt buộc**:
- `name` (string): Tên category, 2-100 ký tự, phải unique

**Trường tùy chọn**:
- `description` (string): Mô tả category, tối đa 500 ký tự
- `parent` (string): ID của category cha (MongoDB ObjectId). Nếu `null` hoặc không có, category sẽ là category gốc (level 0)
- `image` (string): URL ảnh category

### Response thành công (201 Created)
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "_id": "...",
      "name": "Điện thoại",
      "slug": "dien-thoai",
      "description": "Các sản phẩm điện thoại di động",
      "parent": null,
      "level": 0,
      "image": "https://example.com/images/phone.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**409 Conflict - Tên category đã tồn tại**:
```json
{
  "success": false,
  "status": 409,
  "message": "Category name already exists"
}
```

**404 Not Found - Parent category không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Parent category not found"
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
      "field": "name",
      "message": "Category name must be between 2 and 100 characters"
    }
  ]
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
- Slug được tự động tạo từ `name` (lowercase, loại bỏ ký tự đặc biệt)
- Level được tự động tính dựa trên parent:
  - Nếu `parent = null`: `level = 0`
  - Nếu có parent: `level = parent.level + 1`
- Nếu parent không tồn tại hoặc đã bị xóa, sẽ trả về lỗi 404

---

## 5. PATCH /api/categories/:id (Admin Only)

### Mô tả
Cập nhật thông tin category. Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `id` (string): ID của category cần cập nhật (MongoDB ObjectId)

### Request Body
```json
{
  "name": "Điện thoại thông minh",
  "description": "Các sản phẩm điện thoại thông minh",
  "parent": "...",
  "image": "https://example.com/images/new-phone.jpg"
}
```

**Tất cả các trường đều tùy chọn**:
- `name` (string): Tên category, 2-100 ký tự, phải unique nếu thay đổi
- `description` (string): Mô tả category, tối đa 500 ký tự
- `parent` (string | null): ID của category cha hoặc `null` để đặt làm category gốc
- `image` (string): URL ảnh category

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "_id": "...",
      "name": "Điện thoại thông minh",
      "slug": "dien-thoai-thong-minh",
      "description": "Các sản phẩm điện thoại thông minh",
      "parent": {
        "_id": "...",
        "name": "Thiết bị điện tử",
        "slug": "thiet-bi-dien-tu",
        "level": 0
      },
      "level": 1,
      "image": "https://example.com/images/new-phone.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**404 Not Found - Category không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Category not found"
}
```

**409 Conflict - Tên category đã tồn tại**:
```json
{
  "success": false,
  "status": 409,
  "message": "Category name already exists"
}
```

**400 Bad Request - Không thể set parent là chính nó**:
```json
{
  "success": false,
  "status": 400,
  "message": "Category cannot be its own parent"
}
```

**400 Bad Request - Không thể set parent là con cháu của nó**:
```json
{
  "success": false,
  "status": 400,
  "message": "Cannot set a descendant category as parent"
}
```

**404 Not Found - Parent category không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Parent category not found"
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
- Khi thay đổi `name`, slug sẽ được tự động cập nhật
- Khi thay đổi `parent`:
  - Nếu `parent = null`: Category trở thành category gốc (level = 0)
  - Nếu có parent: Level được tự động tính lại
  - Không cho phép set parent là chính nó
  - Không cho phép set parent là con cháu của nó (tránh circular reference)
- Chỉ cập nhật các trường được gửi trong request body

---

## 6. DELETE /api/categories/:id (Admin Only)

### Mô tả
Soft delete category (đánh dấu xóa, không xóa thực sự). Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `id` (string): ID của category cần xóa (MongoDB ObjectId)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Category deleted successfully",
  "data": null
}
```

### Response lỗi

**404 Not Found - Category không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Category not found"
}
```

**400 Bad Request - Category có con**:
```json
{
  "success": false,
  "status": 400,
  "message": "Cannot delete category with child categories. Please delete or move child categories first."
}
```

**400 Bad Request - Category có sản phẩm**:
```json
{
  "success": false,
  "status": 400,
  "message": "Cannot delete category that has products. Please remove or reassign products first."
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
- Soft delete: Category được đánh dấu `isDeleted = true`, không bị xóa khỏi database
- Không cho phép xóa category nếu:
  - Category có child categories (categories con)
  - Category có products đang sử dụng
- Trước khi xóa, cần:
  - Xóa hoặc di chuyển tất cả child categories
  - Xóa hoặc chuyển tất cả products sang category khác

---

## Cấu trúc dữ liệu Category

Mỗi category có cấu trúc:

```json
{
  "_id": "ObjectId",
  "name": "string (required, 2-100 chars, unique)",
  "slug": "string (auto-generated, unique)",
  "description": "string (optional, max 500 chars)",
  "parent": "ObjectId | null (ref: Category)",
  "level": "number (auto-calculated, 0 = root)",
  "image": "string (optional, URL)",
  "isDeleted": "boolean (default: false)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Giải thích các trường:

- **name**: Tên category, bắt buộc, unique trong hệ thống
- **slug**: URL-friendly version của name, tự động tạo từ name (lowercase, loại bỏ ký tự đặc biệt)
- **description**: Mô tả category, tùy chọn
- **parent**: ID của category cha. `null` nếu là category gốc
- **level**: Cấp độ phân cấp, tự động tính:
  - `0`: Category gốc (không có parent)
  - `1`: Category con của category gốc
  - `2+`: Category con của category con, ...
- **image**: URL ảnh đại diện cho category
- **isDeleted**: Trạng thái soft delete

---

## Cấu trúc cây phân cấp

Hệ thống hỗ trợ cây phân cấp nhiều cấp:

```
Điện thoại (level 0)
├── iPhone (level 1)
│   ├── iPhone 15 (level 2)
│   └── iPhone 14 (level 2)
├── Samsung (level 1)
│   ├── Galaxy S (level 2)
│   └── Galaxy Note (level 2)
└── Xiaomi (level 1)

Laptop (level 0)
├── Gaming Laptop (level 1)
└── Business Laptop (level 1)
```

---

## Mã lỗi HTTP

| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Bad Request (validation failed, không thể xóa do có con/sản phẩm) |
| 401 | Unauthorized (token không hợp lệ, chưa đăng nhập) |
| 403 | Forbidden (không có quyền admin) |
| 404 | Not Found (category không tồn tại) |
| 409 | Conflict (tên category đã tồn tại) |
| 500 | Internal Server Error |

---

## Lưu ý quan trọng

1. **Authentication & Authorization**: 
   - Các endpoint GET là public (không cần đăng nhập)
   - Các endpoint POST, PATCH, DELETE yêu cầu đăng nhập và role `admin`

2. **Auto Slug Generation**: 
   - Slug được tự động tạo từ `name` khi tạo hoặc cập nhật name
   - Format: lowercase, loại bỏ ký tự đặc biệt, thay khoảng trắng bằng dấu gạch ngang
   - Ví dụ: "Điện thoại" → "dien-thoai"

3. **Level Calculation**: 
   - Level được tự động tính dựa trên parent
   - Khi thay đổi parent, level được tự động cập nhật

4. **Circular Reference Prevention**: 
   - Không cho phép set parent là chính nó
   - Không cho phép set parent là con cháu của nó (tránh vòng lặp vô hạn)

5. **Soft Delete**: 
   - Category bị soft delete (`isDeleted = true`) vẫn tồn tại trong database
   - Category đã bị soft delete không xuất hiện trong danh sách
   - Không thể xóa category nếu có child categories hoặc products

6. **Parent Validation**: 
   - Khi tạo/cập nhật với parent, hệ thống kiểm tra parent có tồn tại và chưa bị xóa
   - Nếu parent không tồn tại, trả về lỗi 404

7. **Delete Restrictions**: 
   - Không thể xóa category có child categories
   - Không thể xóa category có products đang sử dụng
   - Cần xử lý child categories và products trước khi xóa

---

## Ví dụ sử dụng

### Tạo category gốc
```json
POST /api/categories
{
  "name": "Điện thoại",
  "description": "Các sản phẩm điện thoại di động"
}
```

### Tạo category con
```json
POST /api/categories
{
  "name": "iPhone",
  "description": "Điện thoại iPhone",
  "parent": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

### Cập nhật category
```json
PATCH /api/categories/65a1b2c3d4e5f6g7h8i9j0k1
{
  "name": "Điện thoại thông minh",
  "description": "Các sản phẩm điện thoại thông minh"
}
```

### Di chuyển category (thay đổi parent)
```json
PATCH /api/categories/65a1b2c3d4e5f6g7h8i9j0k1
{
  "parent": "65a1b2c3d4e5f6g7h8i9j0k2"
}
```

### Đặt category làm gốc (bỏ parent)
```json
PATCH /api/categories/65a1b2c3d4e5f6g7h8i9j0k1
{
  "parent": null
}
```

---

Chúc bạn sử dụng API thành công! 🚀


