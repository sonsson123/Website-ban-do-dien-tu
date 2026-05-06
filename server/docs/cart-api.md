# Tài liệu API Cart

## Tổng quan

Tài liệu này mô tả chi tiết các API endpoint liên quan đến quản lý giỏ hàng (Cart) trong hệ thống E-Commerce.

**Base URL**: `http://localhost:5000/api/cart`

---

## 1. GET /api/cart

### Mô tả
Lấy giỏ hàng của user hiện tại. Nếu user chưa có cart, hệ thống sẽ tự động tạo cart rỗng.

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
  "message": "Cart retrieved successfully",
  "data": {
    "cart": {
      "_id": "...",
      "user": "...",
      "items": [
        {
          "_id": "...",
          "product": {
            "_id": "...",
            "name": "iPhone 15 Pro Max",
            "slug": "iphone-15-pro-max",
            "price": 29990000,
            "discount": 5,
            "images": [
              "https://res.cloudinary.com/.../iphone15.jpg"
            ],
            "isActive": true,
            "stock": 50
          },
          "quantity": 2,
          "priceAtAdd": 28490500,
          "addedAt": "2024-01-01T00:00:00.000Z"
        },
        {
          "_id": "...",
          "product": {
            "_id": "...",
            "name": "MacBook Pro 16 inch",
            "slug": "macbook-pro-16-inch",
            "price": 69990000,
            "discount": 0,
            "images": [
              "https://res.cloudinary.com/.../macbook.jpg"
            ],
            "isActive": true,
            "stock": 20
          },
          "quantity": 1,
          "priceAtAdd": 69990000,
          "addedAt": "2024-01-02T00:00:00.000Z"
        }
      ],
      "totalItems": 3,
      "subtotal": 126971000,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
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

### Ghi chú
- Nếu user chưa có cart, hệ thống tự động tạo cart rỗng
- Các sản phẩm đã bị xóa hoặc không active sẽ tự động bị loại bỏ khỏi cart
- `totalItems`: Tổng số lượng items (tổng quantity của tất cả items)
- `subtotal`: Tổng tiền (tính theo giá tại thời điểm thêm vào cart - `priceAtAdd`)
- Product information được populate đầy đủ

---

## 2. POST /api/cart/items

### Mô tả
Thêm sản phẩm vào giỏ hàng hoặc tăng số lượng nếu sản phẩm đã có trong cart.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "quantity": 2
}
```

**Trường bắt buộc**:
- `productId` (string): ID của sản phẩm (MongoDB ObjectId)
- `quantity` (number): Số lượng thêm vào (>= 1)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "cart": {
      "_id": "...",
      "user": "...",
      "items": [
        {
          "_id": "...",
          "product": {
            "_id": "...",
            "name": "iPhone 15 Pro Max",
            "slug": "iphone-15-pro-max",
            "price": 29990000,
            "discount": 5,
            "images": [
              "https://res.cloudinary.com/.../iphone15.jpg"
            ],
            "isActive": true,
            "stock": 50
          },
          "quantity": 3,
          "priceAtAdd": 28490500,
          "addedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "totalItems": 3,
      "subtotal": 85471500,
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
  "message": "Product not found or not available"
}
```

**400 Bad Request - Không đủ hàng**:
```json
{
  "success": false,
  "status": 400,
  "message": "Insufficient stock. Available: 10"
}
```

**400 Bad Request - Không đủ hàng khi tăng quantity**:
```json
{
  "success": false,
  "status": 400,
  "message": "Insufficient stock. Available: 10, Current in cart: 8"
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
      "field": "quantity",
      "message": "Quantity must be a positive integer"
    }
  ]
}
```

### Ghi chú
- Nếu sản phẩm đã có trong cart, quantity sẽ được cộng thêm
- Nếu sản phẩm chưa có trong cart, sẽ thêm item mới
- Giá được lưu tại thời điểm thêm vào cart (`priceAtAdd`) - tính theo giá sau discount
- Hệ thống kiểm tra stock trước khi thêm/tăng quantity
- Chỉ cho phép thêm sản phẩm đang active và chưa bị xóa

---

## 3. PUT /api/cart/items/:productId

### Mô tả
Set số lượng chính xác cho item trong cart. Nếu quantity = 0, item sẽ bị xóa.

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
  "quantity": 5
}
```

**Trường bắt buộc**:
- `quantity` (number): Số lượng mới (>= 0, nếu = 0 sẽ xóa item)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "cart": {
      "_id": "...",
      "user": "...",
      "items": [
        {
          "_id": "...",
          "product": {
            "_id": "...",
            "name": "iPhone 15 Pro Max",
            "slug": "iphone-15-pro-max",
            "price": 29990000,
            "discount": 5,
            "images": [
              "https://res.cloudinary.com/.../iphone15.jpg"
            ],
            "isActive": true,
            "stock": 50
          },
          "quantity": 5,
          "priceAtAdd": 28490500,
          "addedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "totalItems": 5,
      "subtotal": 142452500,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**404 Not Found - Cart không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Cart not found"
}
```

**404 Not Found - Item không tồn tại trong cart**:
```json
{
  "success": false,
  "status": 404,
  "message": "Item not found in cart"
}
```

**404 Not Found - Sản phẩm không tồn tại (đã bị xóa khỏi cart)**:
```json
{
  "success": false,
  "status": 404,
  "message": "Product not found or not available. Item removed from cart"
}
```

**400 Bad Request - Không đủ hàng**:
```json
{
  "success": false,
  "status": 400,
  "message": "Insufficient stock. Available: 10"
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
      "field": "quantity",
      "message": "Quantity must be a non-negative integer"
    }
  ]
}
```

### Ghi chú
- Nếu `quantity = 0`, item sẽ bị xóa khỏi cart
- Nếu sản phẩm không còn tồn tại hoặc không active, item sẽ tự động bị xóa
- Hệ thống kiểm tra stock trước khi cập nhật quantity
- `priceAtAdd` không thay đổi khi cập nhật quantity

---

## 4. DELETE /api/cart/items/:productId

### Mô tả
Xóa một item khỏi giỏ hàng.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `productId` (string): ID của sản phẩm cần xóa (MongoDB ObjectId)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Item removed from cart successfully",
  "data": {
    "cart": {
      "_id": "...",
      "user": "...",
      "items": [
        {
          "_id": "...",
          "product": {
            "_id": "...",
            "name": "MacBook Pro 16 inch",
            "slug": "macbook-pro-16-inch",
            "price": 69990000,
            "discount": 0,
            "images": [
              "https://res.cloudinary.com/.../macbook.jpg"
            ],
            "isActive": true,
            "stock": 20
          },
          "quantity": 1,
          "priceAtAdd": 69990000,
          "addedAt": "2024-01-02T00:00:00.000Z"
        }
      ],
      "totalItems": 1,
      "subtotal": 69990000,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**404 Not Found - Cart không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Cart not found"
}
```

**404 Not Found - Item không tồn tại trong cart**:
```json
{
  "success": false,
  "status": 404,
  "message": "Item not found in cart"
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
- Item được xóa hoàn toàn khỏi cart
- `totalItems` và `subtotal` được tự động cập nhật

---

## 5. DELETE /api/cart

### Mô tả
Xóa toàn bộ items trong giỏ hàng (clear cart).

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
  "message": "Cart cleared successfully",
  "data": {
    "cart": {
      "_id": "...",
      "user": "...",
      "items": [],
      "totalItems": 0,
      "subtotal": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**404 Not Found - Cart không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Cart not found"
}
```

### Ghi chú
- Tất cả items trong cart sẽ bị xóa
- Cart vẫn tồn tại nhưng rỗng
- `totalItems` và `subtotal` được reset về 0

---

## Cấu trúc dữ liệu Cart

Cart có cấu trúc:

```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User, unique, required)",
  "items": [
    {
      "_id": "ObjectId",
      "product": "ObjectId (ref: Product, required)",
      "quantity": "number (required, min: 1)",
      "priceAtAdd": "number (required, giá tại thời điểm thêm)",
      "addedAt": "Date (default: Date.now)"
    }
  ],
  "totalItems": "number (auto-calculated, tổng quantity)",
  "subtotal": "number (auto-calculated, tổng tiền)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Giải thích các trường:

- **user**: ID của user sở hữu cart (unique, mỗi user chỉ có 1 cart)
- **items**: Mảng các items trong cart (embedded documents)
  - **product**: ID của sản phẩm
  - **quantity**: Số lượng sản phẩm
  - **priceAtAdd**: Giá tại thời điểm thêm vào cart (sau discount)
  - **addedAt**: Thời gian thêm vào cart
- **totalItems**: Tổng số lượng items (tự động tính: tổng quantity của tất cả items)
- **subtotal**: Tổng tiền (tự động tính: tổng `priceAtAdd * quantity`)

---

## Tính năng tự động

### 1. Auto Create Cart
- Nếu user chưa có cart, hệ thống tự động tạo cart rỗng khi GET /api/cart

### 2. Auto Calculate Totals
- `totalItems` và `subtotal` được tự động tính mỗi khi save cart
- Công thức:
  - `totalItems = sum(items.quantity)`
  - `subtotal = sum(items.priceAtAdd * items.quantity)`

### 3. Auto Clean Invalid Items
- Khi GET cart, hệ thống tự động loại bỏ:
  - Sản phẩm đã bị xóa (`isDeleted = true`)
  - Sản phẩm không active (`isActive = false`)

### 4. Price Snapshot
- Giá được lưu tại thời điểm thêm vào cart (`priceAtAdd`)
- Giá này không thay đổi khi giá sản phẩm thay đổi
- Đảm bảo tính nhất quán cho đơn hàng

---

## Mã lỗi HTTP

| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 400 | Bad Request (validation failed, không đủ hàng) |
| 401 | Unauthorized (token không hợp lệ, chưa đăng nhập) |
| 404 | Not Found (cart/product/item không tồn tại) |
| 500 | Internal Server Error |

---

## Lưu ý quan trọng

1. **Authentication**: 
   - Tất cả endpoints yêu cầu đăng nhập (Bearer Token)

2. **One Cart Per User**: 
   - Mỗi user chỉ có một cart duy nhất
   - Cart được tự động tạo khi cần

3. **Stock Validation**: 
   - Hệ thống kiểm tra stock trước khi thêm/tăng quantity
   - Không cho phép thêm quá số lượng có sẵn

4. **Price Snapshot**: 
   - Giá được lưu tại thời điểm thêm vào cart
   - Giá này không thay đổi khi giá sản phẩm thay đổi
   - Đảm bảo tính nhất quán cho đơn hàng

5. **Auto Clean**: 
   - Sản phẩm đã bị xóa hoặc không active sẽ tự động bị loại bỏ
   - Đảm bảo cart chỉ chứa sản phẩm hợp lệ

6. **Embedded Items**: 
   - Items được lưu embedded trong cart document
   - Không có collection riêng cho cart items

7. **Quantity Management**: 
   - POST: Thêm hoặc tăng quantity (cộng thêm)
   - PUT: Set quantity chính xác (thay thế)
   - DELETE: Xóa item hoàn toàn

---

## Ví dụ sử dụng

### Lấy giỏ hàng
```
GET /api/cart
Authorization: Bearer <token>
```

### Thêm sản phẩm vào cart
```json
POST /api/cart/items
{
  "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "quantity": 2
}
```

### Tăng số lượng sản phẩm (nếu đã có trong cart)
```json
POST /api/cart/items
{
  "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "quantity": 1
}
```
→ Nếu đã có 2 items, sẽ thành 3 items

### Set số lượng chính xác
```json
PUT /api/cart/items/65a1b2c3d4e5f6g7h8i9j0k1
{
  "quantity": 5
}
```
→ Set chính xác 5 items (không cộng thêm)

### Xóa một item
```
DELETE /api/cart/items/65a1b2c3d4e5f6g7h8i9j0k1
```

### Xóa toàn bộ cart
```
DELETE /api/cart
```

---

## Workflow điển hình

1. **User thêm sản phẩm vào cart**:
   - POST /api/cart/items với productId và quantity
   - Hệ thống kiểm tra stock
   - Thêm item hoặc tăng quantity nếu đã có
   - Lưu giá tại thời điểm thêm

2. **User xem giỏ hàng**:
   - GET /api/cart
   - Hệ thống tự động clean invalid items
   - Trả về cart với product information đầy đủ

3. **User cập nhật số lượng**:
   - PUT /api/cart/items/:productId với quantity mới
   - Hệ thống kiểm tra stock
   - Cập nhật quantity hoặc xóa nếu quantity = 0

4. **User xóa item**:
   - DELETE /api/cart/items/:productId
   - Item bị xóa khỏi cart

5. **User clear cart**:
   - DELETE /api/cart
   - Tất cả items bị xóa

---

Chúc bạn sử dụng API thành công! 🚀

