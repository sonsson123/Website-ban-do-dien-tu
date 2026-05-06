# Tài liệu API Reviews

## Tổng quan

Tài liệu này mô tả chi tiết các API endpoint liên quan đến quản lý đánh giá sản phẩm (Reviews) trong hệ thống E-Commerce.

**Base URL**: `http://localhost:5000/api`

---

## 1. GET /api/products/:productId/reviews

### Mô tả
Lấy danh sách đánh giá của một sản phẩm với pagination. Sắp xếp theo thời gian tạo (mới nhất trước).

### Yêu cầu xác thực
Không cần (Public endpoint)

### URL Parameters
- `productId` (string): ID của sản phẩm (MongoDB ObjectId)

### Query Parameters
- `page` (number, optional): Số trang (mặc định: 1)
- `limit` (number, optional): Số lượng items mỗi trang (mặc định: 10, tối đa: 100)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "_id": "...",
        "product": "...",
        "user": {
          "_id": "...",
          "fullName": "Nguyễn Văn A",
          "username": "user1",
          "avatar": "https://example.com/avatar.jpg"
        },
        "rating": 5,
        "comment": "Sản phẩm rất tốt, đáng mua!",
        "images": [
          "https://res.cloudinary.com/.../review1.jpg"
        ],
        "isVerifiedPurchase": true,
        "helpfulCount": 10,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "_id": "...",
        "product": "...",
        "user": {
          "_id": "...",
          "fullName": "Trần Thị B",
          "username": "user2",
          "avatar": null
        },
        "rating": 4,
        "comment": "Sản phẩm tốt nhưng giá hơi cao",
        "images": [],
        "isVerifiedPurchase": true,
        "helpfulCount": 5,
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

**404 Not Found - Sản phẩm không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Product not found"
}
```

**400 Bad Request - Invalid product ID**:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "productId",
      "message": "Invalid product ID"
    }
  ]
}
```

### Ghi chú
- Reviews được sắp xếp theo `createdAt` giảm dần (mới nhất trước)
- Chỉ trả về reviews chưa bị xóa (`isDeleted: false`)
- User information được populate với `fullName`, `username`, và `avatar`

### Ví dụ sử dụng

**Lấy trang 1, 20 reviews**:
```
GET /api/products/65a1b2c3d4e5f6g7h8i9j0k1/reviews?page=1&limit=20
```

---

## 2. POST /api/products/:productId/reviews

### Mô tả
Tạo đánh giá mới cho sản phẩm. Chỉ user đã mua hàng (verified purchase) mới được tạo review. Hệ thống sẽ tự động cập nhật averageRating và numReviews của sản phẩm.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### URL Parameters
- `productId` (string): ID của sản phẩm (MongoDB ObjectId)

### Request Body
```json
{
  "rating": 5,
  "comment": "Sản phẩm rất tốt, đáng mua! Giao hàng nhanh, đóng gói cẩn thận.",
  "images": [
    "https://res.cloudinary.com/.../review1.jpg",
    "https://res.cloudinary.com/.../review2.jpg"
  ]
}
```

**Trường bắt buộc**:
- `rating` (number): Điểm đánh giá, 1-5 sao
- `comment` (string): Nội dung đánh giá, 10-1000 ký tự

**Trường tùy chọn**:
- `images` (array): Mảng URL ảnh minh chứng (tối đa 1000 ký tự mỗi URL)

### Response thành công (201 Created)
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "_id": "...",
      "product": {
        "_id": "...",
        "name": "iPhone 15 Pro Max",
        "slug": "iphone-15-pro-max"
      },
      "user": {
        "_id": "...",
        "fullName": "Nguyễn Văn A",
        "username": "user1",
        "avatar": "https://example.com/avatar.jpg"
      },
      "rating": 5,
      "comment": "Sản phẩm rất tốt, đáng mua! Giao hàng nhanh, đóng gói cẩn thận.",
      "images": [
        "https://res.cloudinary.com/.../review1.jpg",
        "https://res.cloudinary.com/.../review2.jpg"
      ],
      "isVerifiedPurchase": true,
      "helpfulCount": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**404 Not Found - Sản phẩm không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Product not found"
}
```

**403 Forbidden - Chưa mua hàng**:
```json
{
  "success": false,
  "status": 403,
  "message": "You can only review products you have purchased"
}
```

**409 Conflict - Đã review rồi**:
```json
{
  "success": false,
  "status": 409,
  "message": "You have already reviewed this product"
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
      "field": "rating",
      "message": "Rating must be between 1 and 5"
    },
    {
      "field": "comment",
      "message": "Comment must be between 10 and 1000 characters"
    }
  ]
}
```

**401 Unauthorized - Chưa đăng nhập**:
```json
{
  "success": false,
  "status": 401,
  "message": "Not authorized, no token"
}
```

### Ghi chú
- Chỉ user đã mua hàng (có đơn hàng với status `delivered` chứa sản phẩm này) mới được tạo review
- Mỗi user chỉ được review một lần cho mỗi sản phẩm
- `isVerifiedPurchase` được tự động set là `true` khi tạo review
- `averageRating` và `numReviews` của sản phẩm được tự động cập nhật sau khi tạo review

---

## 3. PATCH /api/reviews/:id

### Mô tả
Cập nhật đánh giá. Chỉ owner (người tạo review) hoặc admin mới được phép cập nhật.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### URL Parameters
- `id` (string): ID của review cần cập nhật (MongoDB ObjectId)

### Request Body
```json
{
  "rating": 4,
  "comment": "Sản phẩm tốt nhưng giá hơi cao. Đã cập nhật đánh giá.",
  "images": [
    "https://res.cloudinary.com/.../review1.jpg"
  ]
}
```

**Tất cả các trường đều tùy chọn**:
- `rating` (number): Điểm đánh giá, 1-5 sao
- `comment` (string): Nội dung đánh giá, 10-1000 ký tự
- `images` (array): Mảng URL ảnh minh chứng

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "review": {
      "_id": "...",
      "product": {
        "_id": "...",
        "name": "iPhone 15 Pro Max",
        "slug": "iphone-15-pro-max"
      },
      "user": {
        "_id": "...",
        "fullName": "Nguyễn Văn A",
        "username": "user1",
        "avatar": "https://example.com/avatar.jpg"
      },
      "rating": 4,
      "comment": "Sản phẩm tốt nhưng giá hơi cao. Đã cập nhật đánh giá.",
      "images": [
        "https://res.cloudinary.com/.../review1.jpg"
      ],
      "isVerifiedPurchase": true,
      "helpfulCount": 10,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**404 Not Found - Review không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Review not found"
}
```

**403 Forbidden - Không có quyền**:
```json
{
  "success": false,
  "status": 403,
  "message": "You do not have permission to update this review"
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
      "field": "rating",
      "message": "Rating must be between 1 and 5"
    }
  ]
}
```

### Ghi chú
- Chỉ owner (người tạo review) hoặc admin mới được phép cập nhật
- `averageRating` và `numReviews` của sản phẩm được tự động cập nhật sau khi sửa review

---

## 4. DELETE /api/reviews/:id

### Mô tả
Xóa đánh giá (soft delete). Chỉ owner (người tạo review) hoặc admin mới được phép xóa.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `id` (string): ID của review cần xóa (MongoDB ObjectId)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Review deleted successfully",
  "data": null
}
```

### Response lỗi

**404 Not Found - Review không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Review not found"
}
```

**403 Forbidden - Không có quyền**:
```json
{
  "success": false,
  "status": 403,
  "message": "You do not have permission to delete this review"
}
```

**400 Bad Request - Invalid review ID**:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "id",
      "message": "Invalid review ID"
    }
  ]
}
```

### Ghi chú
- Soft delete: Review được đánh dấu `isDeleted = true`, không bị xóa khỏi database
- Review đã bị soft delete sẽ không xuất hiện trong danh sách reviews
- `averageRating` và `numReviews` của sản phẩm được tự động cập nhật sau khi xóa review

---

## Cấu trúc dữ liệu Review

Mỗi review có cấu trúc:

```json
{
  "_id": "ObjectId",
  "product": "ObjectId (ref: Product)",
  "user": "ObjectId (ref: User)",
  "rating": "number (1-5, required)",
  "comment": "string (required, 10-1000 chars)",
  "images": "array of strings (URLs, optional)",
  "isVerifiedPurchase": "boolean (default: false)",
  "helpfulCount": "number (default: 0)",
  "isDeleted": "boolean (default: false)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Giải thích các trường:

- **product**: ID của sản phẩm được đánh giá
- **user**: ID của user tạo review
- **rating**: Điểm đánh giá từ 1-5 sao
- **comment**: Nội dung đánh giá, 10-1000 ký tự
- **images**: Mảng URL ảnh minh chứng (tùy chọn)
- **isVerifiedPurchase**: Đánh dấu đã mua hàng (tự động set `true` khi tạo review)
- **helpfulCount**: Số lượt "hữu ích" (có thể mở rộng sau)
- **isDeleted**: Trạng thái soft delete

---

## Verified Purchase

Hệ thống tự động kiểm tra user đã mua hàng bằng cách:

1. Tìm tất cả đơn hàng của user có `orderStatus = 'delivered'`
2. Kiểm tra xem có OrderItem nào chứa sản phẩm này không
3. Nếu có → `isVerifiedPurchase = true`
4. Nếu không → Không cho phép tạo review

**Lưu ý**: Chỉ user đã mua và nhận hàng (delivered) mới được tạo review.

---

## Auto Rating Update

Hệ thống tự động cập nhật `averageRating` và `numReviews` của sản phẩm khi:

- Tạo review mới
- Cập nhật review (thay đổi rating)
- Xóa review (soft delete)

Công thức tính:
- `averageRating = tổng rating / số lượng reviews`
- `numReviews = số lượng reviews chưa bị xóa`

---

## Mã lỗi HTTP

| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Bad Request (validation failed, invalid ID) |
| 401 | Unauthorized (token không hợp lệ, chưa đăng nhập) |
| 403 | Forbidden (không có quyền, chưa mua hàng) |
| 404 | Not Found (product/review không tồn tại) |
| 409 | Conflict (đã review rồi) |
| 500 | Internal Server Error |

---

## Lưu ý quan trọng

1. **Authentication**: 
   - Endpoint GET là public (không cần đăng nhập)
   - Các endpoint POST, PATCH, DELETE yêu cầu đăng nhập

2. **Verified Purchase**: 
   - Chỉ user đã mua hàng (có đơn hàng delivered chứa sản phẩm) mới được tạo review
   - Mỗi user chỉ được review một lần cho mỗi sản phẩm

3. **Authorization**: 
   - Chỉ owner (người tạo review) hoặc admin mới được sửa/xóa review
   - User khác không thể sửa/xóa review của người khác

4. **Auto Rating Update**: 
   - `averageRating` và `numReviews` được tự động cập nhật
   - Không cần cập nhật thủ công

5. **Soft Delete**: 
   - Review bị soft delete (`isDeleted = true`) vẫn tồn tại trong database
   - Review đã bị soft delete không xuất hiện trong danh sách
   - Rating vẫn được tính lại sau khi xóa

6. **Pagination**: 
   - Mặc định: page = 1, limit = 10
   - Limit tối đa: 100
   - Response bao gồm metadata pagination

7. **Sorting**: 
   - Reviews được sắp xếp theo `createdAt` giảm dần (mới nhất trước)

---

## Ví dụ sử dụng

### Tạo review sau khi mua hàng
```json
POST /api/products/65a1b2c3d4e5f6g7h8i9j0k1/reviews
{
  "rating": 5,
  "comment": "Sản phẩm rất tốt, đóng gói cẩn thận, giao hàng nhanh. Rất hài lòng!",
  "images": [
    "https://res.cloudinary.com/.../product1.jpg"
  ]
}
```

### Cập nhật review của mình
```json
PATCH /api/reviews/65a1b2c3d4e5f6g7h8i9j0k1
{
  "rating": 4,
  "comment": "Sản phẩm tốt nhưng giá hơi cao. Đã cập nhật đánh giá."
}
```

### Xóa review của mình
```
DELETE /api/reviews/65a1b2c3d4e5f6g7h8i9j0k1
```

### Lấy danh sách reviews của sản phẩm
```
GET /api/products/65a1b2c3d4e5f6g7h8i9j0k1/reviews?page=1&limit=20
```

---

Chúc bạn sử dụng API thành công! 🚀

