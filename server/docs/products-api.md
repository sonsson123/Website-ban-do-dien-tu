# Tài liệu API Products

## Tổng quan

Tài liệu này mô tả chi tiết các API endpoint liên quan đến quản lý sản phẩm (Products) trong hệ thống E-Commerce.

**Base URL**: `http://localhost:5000/api/products`

---

## 1. GET /api/products

### Mô tả
Lấy danh sách sản phẩm với khả năng filter, sort và pagination.

### Yêu cầu xác thực
Không cần (Public endpoint)

### Query Parameters

**Pagination**:
- `page` (number, optional): Số trang (mặc định: 1)
- `limit` (number, optional): Số lượng items mỗi trang (mặc định: 10, tối đa: 100)

**Filter**:
- `q` (string, optional): Tìm kiếm theo tên, mô tả, hoặc brand (case-insensitive)
- `category` (string, optional): Lọc theo category ID (MongoDB ObjectId)
- `minPrice` (number, optional): Giá tối thiểu
- `maxPrice` (number, optional): Giá tối đa

**Sort**:
- `sort` (string, optional): Sắp xếp theo trường
  - `price` hoặc `-price`: Sắp xếp theo giá (tăng/giảm)
  - `createdAt` hoặc `-createdAt`: Sắp xếp theo ngày tạo (mới nhất/cũ nhất)
  - `averageRating` hoặc `-averageRating`: Sắp xếp theo đánh giá
  - `name` hoặc `-name`: Sắp xếp theo tên (A-Z/Z-A)
  - Mặc định: `-createdAt` (mới nhất trước)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "...",
        "name": "iPhone 15 Pro Max",
        "slug": "iphone-15-pro-max",
        "description": "Điện thoại iPhone 15 Pro Max 256GB",
        "price": 29990000,
        "discount": 5,
        "priceAfterDiscount": 28490500,
        "stock": 50,
        "inStock": true,
        "category": {
          "_id": "...",
          "name": "iPhone",
          "slug": "iphone"
        },
        "brand": "Apple",
        "images": [
          "https://res.cloudinary.com/.../iphone15.jpg"
        ],
        "specifications": {
          "RAM": "8GB",
          "Storage": "256GB",
          "Screen": "6.7 inch"
        },
        "averageRating": 4.5,
        "numReviews": 120,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Ví dụ sử dụng

**Lấy trang 1, 20 items**:
```
GET /api/products?page=1&limit=20
```

**Tìm kiếm sản phẩm**:
```
GET /api/products?q=iphone
```

**Lọc theo category**:
```
GET /api/products?category=65a1b2c3d4e5f6g7h8i9j0k1
```

**Lọc theo khoảng giá**:
```
GET /api/products?minPrice=1000000&maxPrice=5000000
```

**Sắp xếp theo giá tăng dần**:
```
GET /api/products?sort=price
```

**Kết hợp nhiều filter**:
```
GET /api/products?q=iphone&category=65a1b2c3d4e5f6g7h8i9j0k1&minPrice=20000000&maxPrice=30000000&sort=-price&page=1&limit=10
```

---

## 2. GET /api/products/:slug

### Mô tả
Lấy thông tin chi tiết của một sản phẩm theo slug.

### Yêu cầu xác thực
Không cần (Public endpoint)

### URL Parameters
- `slug` (string): Slug của sản phẩm (URL-friendly version của tên)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "product": {
      "_id": "...",
      "name": "iPhone 15 Pro Max",
      "slug": "iphone-15-pro-max",
      "description": "Điện thoại iPhone 15 Pro Max 256GB với chip A17 Pro, camera 48MP...",
      "price": 29990000,
      "discount": 5,
      "priceAfterDiscount": 28490500,
      "stock": 50,
      "inStock": true,
      "category": {
        "_id": "...",
        "name": "iPhone",
        "slug": "iphone",
        "level": 1
      },
      "brand": "Apple",
      "images": [
        "https://res.cloudinary.com/.../iphone15-1.jpg",
        "https://res.cloudinary.com/.../iphone15-2.jpg"
      ],
      "specifications": {
        "RAM": "8GB",
        "Storage": "256GB",
        "Screen": "6.7 inch Super Retina XDR",
        "Camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
        "Battery": "4422 mAh",
        "OS": "iOS 17"
      },
      "averageRating": 4.5,
      "numReviews": 120,
      "isActive": true,
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

---

## 3. POST /api/products (Admin Only)

### Mô tả
Tạo sản phẩm mới. Slug sẽ được tự động tạo từ name. Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "name": "iPhone 15 Pro Max",
  "description": "Điện thoại iPhone 15 Pro Max 256GB với chip A17 Pro",
  "price": 29990000,
  "discount": 5,
  "stock": 50,
  "category": "65a1b2c3d4e5f6g7h8i9j0k1",
  "brand": "Apple",
  "images": [
    "https://example.com/images/iphone15.jpg"
  ],
  "specifications": {
    "RAM": "8GB",
    "Storage": "256GB",
    "Screen": "6.7 inch"
  },
  "isActive": true
}
```

**Trường bắt buộc**:
- `name` (string): Tên sản phẩm, 3-200 ký tự
- `description` (string): Mô tả sản phẩm, tối thiểu 10 ký tự
- `price` (number): Giá sản phẩm, >= 0
- `stock` (number): Số lượng tồn kho, >= 0
- `category` (string): ID của category (MongoDB ObjectId)

**Trường tùy chọn**:
- `discount` (number): Phần trăm giảm giá, 0-100 (mặc định: 0)
- `brand` (string): Thương hiệu, tối đa 100 ký tự
- `images` (array): Mảng URL ảnh
- `specifications` (object): Đối tượng thông số kỹ thuật (key-value pairs)
- `isActive` (boolean): Trạng thái hoạt động (mặc định: true)

### Response thành công (201 Created)
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "...",
      "name": "iPhone 15 Pro Max",
      "slug": "iphone-15-pro-max",
      "description": "Điện thoại iPhone 15 Pro Max 256GB với chip A17 Pro",
      "price": 29990000,
      "discount": 5,
      "priceAfterDiscount": 28490500,
      "stock": 50,
      "inStock": true,
      "category": {
        "_id": "...",
        "name": "iPhone",
        "slug": "iphone",
        "level": 1
      },
      "brand": "Apple",
      "images": [
        "https://example.com/images/iphone15.jpg"
      ],
      "specifications": {
        "RAM": "8GB",
        "Storage": "256GB",
        "Screen": "6.7 inch"
      },
      "averageRating": 0,
      "numReviews": 0,
      "isActive": true,
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

**400 Bad Request - Validation failed**:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "data": [
    {
      "field": "price",
      "message": "Price must be a positive number"
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
- Nếu slug đã tồn tại, sẽ thêm số đếm (ví dụ: `iphone-15`, `iphone-15-1`)
- `priceAfterDiscount` được tính tự động: `price * (1 - discount / 100)`
- `inStock` được tính tự động: `stock > 0`

---

## 4. PATCH /api/products/:id (Admin Only)

### Mô tả
Cập nhật thông tin sản phẩm. Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### URL Parameters
- `id` (string): ID của sản phẩm cần cập nhật (MongoDB ObjectId)

### Request Body
```json
{
  "name": "iPhone 15 Pro Max 512GB",
  "price": 32990000,
  "discount": 10,
  "stock": 30,
  "isActive": true
}
```

**Tất cả các trường đều tùy chọn**:
- `name` (string): Tên sản phẩm, 3-200 ký tự
- `description` (string): Mô tả sản phẩm, tối thiểu 10 ký tự
- `price` (number): Giá sản phẩm, >= 0
- `discount` (number): Phần trăm giảm giá, 0-100
- `stock` (number): Số lượng tồn kho, >= 0
- `category` (string): ID của category (MongoDB ObjectId)
- `brand` (string): Thương hiệu, tối đa 100 ký tự
- `images` (array): Mảng URL ảnh (thay thế toàn bộ mảng)
- `specifications` (object): Đối tượng thông số kỹ thuật (thay thế toàn bộ)
- `isActive` (boolean): Trạng thái hoạt động

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "_id": "...",
      "name": "iPhone 15 Pro Max 512GB",
      "slug": "iphone-15-pro-max-512gb",
      "price": 32990000,
      "discount": 10,
      "stock": 30,
      "isActive": true,
      ...
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

**404 Not Found - Category không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Category not found"
}
```

### Ghi chú
- Khi thay đổi `name`, slug sẽ được tự động cập nhật
- Khi cập nhật `images` hoặc `specifications`, sẽ thay thế toàn bộ giá trị cũ

---

## 5. DELETE /api/products/:id (Admin Only)

### Mô tả
Soft delete sản phẩm (đánh dấu xóa, không xóa thực sự). Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `id` (string): ID của sản phẩm cần xóa (MongoDB ObjectId)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product deleted successfully",
  "data": null
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

### Ghi chú
- Soft delete: Sản phẩm được đánh dấu `isDeleted = true`, không bị xóa khỏi database
- Sản phẩm đã bị soft delete sẽ không xuất hiện trong danh sách sản phẩm

---

## 6. POST /api/products/:id/images (Admin Only)

### Mô tả
Upload ảnh bổ sung cho sản phẩm lên Cloudinary và cập nhật mảng images. Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### URL Parameters
- `id` (string): ID của sản phẩm (MongoDB ObjectId)

### Request Body (Form Data)
- `images` (file[]): Mảng file ảnh (tối đa 10 ảnh)
  - Định dạng: jpeg, jpg, png, gif, webp
  - Kích thước tối đa: 5MB mỗi ảnh

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Images uploaded successfully",
  "data": {
    "images": [
      "https://res.cloudinary.com/.../image1.jpg",
      "https://res.cloudinary.com/.../image2.jpg"
    ],
    "publicIds": [
      "it4409_shop/products/image1",
      "it4409_shop/products/image2"
    ],
    "totalImages": 5
  }
}
```

### Response lỗi

**400 Bad Request - Không có ảnh**:
```json
{
  "success": false,
  "status": 400,
  "message": "No images provided"
}
```

**404 Not Found - Sản phẩm không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Product not found"
}
```

**400 Bad Request - File không hợp lệ**:
```json
{
  "success": false,
  "status": 400,
  "message": "Only image files are allowed (jpeg, jpg, png, gif, webp)"
}
```

### Ghi chú
- Ảnh được upload lên Cloudinary trong folder `it4409_shop/products`
- Ảnh được tự động resize và optimize
- Ảnh mới được thêm vào cuối mảng `images` của sản phẩm
- File tạm được tự động xóa sau khi upload

### Ví dụ sử dụng (Postman)
1. Chọn method: `POST`
2. URL: `{{base_url}}/api/products/65a1b2c3d4e5f6g7h8i9j0k1/images`
3. Body → form-data
4. Key: `images` (chọn type: File)
5. Value: Chọn file ảnh (có thể chọn nhiều file)

---

## 7. DELETE /api/products/:id/images/:publicId (Admin Only)

### Mô tả
Xóa ảnh từ Cloudinary và cập nhật mảng images của sản phẩm. Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `id` (string): ID của sản phẩm (MongoDB ObjectId)
- `publicId` (string): Public ID của ảnh trên Cloudinary hoặc URL đầy đủ của ảnh

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Image deleted successfully",
  "data": {
    "deletedImage": "https://res.cloudinary.com/.../image1.jpg",
    "remainingImages": 4
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

**404 Not Found - Ảnh không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Image not found in product"
}
```

### Ghi chú
- `publicId` có thể là:
  - Public ID trên Cloudinary: `it4409_shop/products/image1`
  - URL đầy đủ: `https://res.cloudinary.com/.../image1.jpg`
- Hệ thống sẽ tự động extract publicId từ URL nếu cần
- Ảnh được xóa khỏi cả Cloudinary và database

### Ví dụ sử dụng

**Xóa bằng URL**:
```
DELETE /api/products/65a1b2c3d4e5f6g7h8i9j0k1/images/https://res.cloudinary.com/.../image1.jpg
```

**Xóa bằng publicId**:
```
DELETE /api/products/65a1b2c3d4e5f6g7h8i9j0k1/images/it4409_shop/products/image1
```

---

## Cấu trúc dữ liệu Product

Mỗi sản phẩm có cấu trúc:

```json
{
  "_id": "ObjectId",
  "name": "string (required, 3-200 chars)",
  "slug": "string (auto-generated, unique)",
  "description": "string (required, min 10 chars)",
  "price": "number (required, >= 0)",
  "discount": "number (0-100, default: 0)",
  "priceAfterDiscount": "number (virtual, auto-calculated)",
  "stock": "number (required, >= 0)",
  "inStock": "boolean (virtual, auto-calculated)",
  "category": "ObjectId (required, ref: Category)",
  "brand": "string (optional, max 100 chars)",
  "images": "array of strings (URLs)",
  "specifications": "Map<string, string>",
  "averageRating": "number (0-5, default: 0)",
  "numReviews": "number (default: 0)",
  "isActive": "boolean (default: true)",
  "isDeleted": "boolean (default: false)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Giải thích các trường:

- **name**: Tên sản phẩm, bắt buộc, unique (thông qua slug)
- **slug**: URL-friendly version của name, tự động tạo
- **description**: Mô tả chi tiết sản phẩm
- **price**: Giá gốc của sản phẩm
- **discount**: Phần trăm giảm giá (0-100)
- **priceAfterDiscount**: Giá sau giảm, tự động tính: `price * (1 - discount / 100)`
- **stock**: Số lượng tồn kho
- **inStock**: Trạng thái còn hàng, tự động tính: `stock > 0`
- **category**: ID của category
- **brand**: Thương hiệu sản phẩm
- **images**: Mảng URL ảnh sản phẩm
- **specifications**: Map các thông số kỹ thuật (key-value pairs)
- **averageRating**: Điểm đánh giá trung bình (tự động tính từ reviews)
- **numReviews**: Số lượng đánh giá (tự động tính)
- **isActive**: Trạng thái hoạt động (hiển thị/ẩn)
- **isDeleted**: Trạng thái soft delete

---

## Mã lỗi HTTP

| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Bad Request (validation failed, file không hợp lệ) |
| 401 | Unauthorized (token không hợp lệ, chưa đăng nhập) |
| 403 | Forbidden (không có quyền admin) |
| 404 | Not Found (product/category/image không tồn tại) |
| 500 | Internal Server Error |

---

## Lưu ý quan trọng

1. **Authentication & Authorization**: 
   - Các endpoint GET là public (không cần đăng nhập)
   - Các endpoint POST, PATCH, DELETE yêu cầu đăng nhập và role `admin`

2. **Auto Slug Generation**: 
   - Slug được tự động tạo từ `name` khi tạo hoặc cập nhật name
   - Format: lowercase, loại bỏ ký tự đặc biệt, thay khoảng trắng bằng dấu gạch ngang
   - Nếu slug đã tồn tại, sẽ thêm số đếm (ví dụ: `iphone-15`, `iphone-15-1`)

3. **Price Calculation**: 
   - `priceAfterDiscount` được tính tự động: `price * (1 - discount / 100)`
   - Ví dụ: price = 1000000, discount = 10 → priceAfterDiscount = 900000

4. **Image Management**: 
   - Ảnh được upload lên Cloudinary
   - Folder: `it4409_shop/products`
   - Ảnh được tự động resize và optimize
   - Khi xóa ảnh, cần cung cấp URL hoặc publicId

5. **Specifications**: 
   - Là một Map (key-value pairs)
   - Key và value đều là string
   - Ví dụ: `{ "RAM": "8GB", "Storage": "256GB" }`

6. **Rating System**: 
   - `averageRating` và `numReviews` được tự động tính từ reviews
   - Không thể cập nhật trực tiếp qua API

7. **Filter & Search**: 
   - Search (`q`) tìm kiếm trong: name, description, brand
   - Filter theo category, price range
   - Sort theo nhiều trường khác nhau

8. **Pagination**: 
   - Mặc định: page = 1, limit = 10
   - Limit tối đa: 100
   - Response bao gồm metadata pagination

---

## Ví dụ sử dụng

### Tạo sản phẩm với specifications
```json
POST /api/products
{
  "name": "MacBook Pro 16 inch",
  "description": "MacBook Pro 16 inch với chip M3 Pro",
  "price": 69990000,
  "discount": 0,
  "stock": 20,
  "category": "65a1b2c3d4e5f6g7h8i9j0k1",
  "brand": "Apple",
  "specifications": {
    "CPU": "M3 Pro",
    "RAM": "18GB",
    "Storage": "512GB SSD",
    "Screen": "16.2 inch Liquid Retina XDR",
    "Battery": "Up to 22 hours"
  }
}
```

### Tìm kiếm và lọc sản phẩm
```
GET /api/products?q=laptop&minPrice=10000000&maxPrice=50000000&sort=-price&page=1&limit=20
```

### Upload nhiều ảnh
- Sử dụng form-data với key `images` và chọn nhiều file
- Tối đa 10 ảnh mỗi lần upload

---

Chúc bạn sử dụng API thành công! 🚀


