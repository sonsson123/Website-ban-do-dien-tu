# Tài liệu API Coupons

## Tổng quan

Tài liệu này mô tả chi tiết các API endpoint liên quan đến quản lý mã giảm giá (Coupons) trong hệ thống E-Commerce.

**Base URL**: `http://localhost:5000/api/coupons`

---

## 1. POST /api/coupons/validate

### Mô tả
Kiểm tra mã giảm giá có hợp lệ không. Kiểm tra các điều kiện: hạn sử dụng, đối tượng áp dụng, số lần sử dụng, giá trị đơn hàng tối thiểu, v.v.

### Yêu cầu xác thực
Không cần (Public endpoint)

### Request Body
```json
{
  "code": "SUMMER2024",
  "orderAmount": 1000000,
  "productIds": ["65a1b2c3d4e5f6g7h8i9j0k1"],
  "userId": "65a1b2c3d4e5f6g7h8i9j0k2"
}
```

**Trường bắt buộc**:
- `code` (string): Mã giảm giá, 3-50 ký tự

**Trường tùy chọn**:
- `orderAmount` (number): Giá trị đơn hàng (để kiểm tra minimum order amount và tính discount)
- `productIds` (array): Mảng ID sản phẩm trong đơn hàng (để kiểm tra applicable to products/categories)
- `userId` (string): ID của user (để kiểm tra user restrictions)

### Response thành công - Coupon hợp lệ (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Coupon validated successfully",
  "data": {
    "valid": true,
    "message": "Coupon is valid",
    "coupon": {
      "_id": "...",
      "code": "SUMMER2024",
      "name": "Giảm giá mùa hè 2024",
      "description": "Giảm 20% cho đơn hàng từ 500,000 VND",
      "discountType": "percentage",
      "discountValue": 20,
      "minimumOrderAmount": 500000,
      "maximumDiscountAmount": 500000,
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-08-31T23:59:59.000Z",
      "usageLimit": 1000,
      "usedCount": 150,
      "usageLimitPerUser": 1,
      "applicableTo": "all",
      "applicableToUsers": "all",
      "isActive": true,
      "createdAt": "2024-05-01T00:00:00.000Z",
      "updatedAt": "2024-05-01T00:00:00.000Z"
    },
    "discountAmount": 200000,
    "finalAmount": 800000
  }
}
```

### Response thành công - Coupon không hợp lệ (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Coupon validation failed",
  "data": {
    "valid": false,
    "message": "Coupon has expired",
    "coupon": null
  }
}
```

### Response lỗi

**404 Not Found - Coupon không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Coupon not found"
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
      "field": "code",
      "message": "Coupon code is required"
    }
  ]
}
```

### Các thông báo validation có thể có:

- `"Coupon is not active"` - Coupon không active
- `"Coupon has not started yet"` - Chưa đến thời gian bắt đầu
- `"Coupon has expired"` - Coupon đã hết hạn
- `"Coupon usage limit has been reached"` - Đã đạt giới hạn sử dụng
- `"Minimum order amount is X VND"` - Chưa đạt giá trị đơn hàng tối thiểu
- `"Coupon is not applicable to selected products"` - Không áp dụng cho sản phẩm đã chọn
- `"Coupon is not applicable to your account"` - Không áp dụng cho tài khoản của bạn

### Ghi chú
- Nếu `orderAmount` được cung cấp, response sẽ bao gồm `discountAmount` và `finalAmount`
- `discountAmount` được tính dựa trên `discountType` và `discountValue`
- Nếu là percentage, sẽ áp dụng `maximumDiscountAmount` nếu có
- Nếu là fixed, sẽ không vượt quá `orderAmount`

---

## 2. GET /api/coupons (Admin Only)

### Mô tả
Lấy danh sách tất cả coupons với pagination và filter. Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `page` (number, optional): Số trang (mặc định: 1)
- `limit` (number, optional): Số lượng items mỗi trang (mặc định: 10, tối đa: 100)
- `isActive` (string, optional): Lọc theo trạng thái active (`true`, `false`)
- `code` (string, optional): Tìm kiếm theo code (case-insensitive)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Coupons retrieved successfully",
  "data": {
    "coupons": [
      {
        "_id": "...",
        "code": "SUMMER2024",
        "name": "Giảm giá mùa hè 2024",
        "description": "Giảm 20% cho đơn hàng từ 500,000 VND",
        "discountType": "percentage",
        "discountValue": 20,
        "minimumOrderAmount": 500000,
        "maximumDiscountAmount": 500000,
        "startDate": "2024-06-01T00:00:00.000Z",
        "endDate": "2024-08-31T23:59:59.000Z",
        "usageLimit": 1000,
        "usedCount": 150,
        "usageLimitPerUser": 1,
        "applicableTo": "all",
        "categories": [],
        "products": [],
        "applicableToUsers": "all",
        "specificUsers": [],
        "isActive": true,
        "createdAt": "2024-05-01T00:00:00.000Z",
        "updatedAt": "2024-05-01T00:00:00.000Z"
      },
      {
        "_id": "...",
        "code": "NEWUSER10",
        "name": "Giảm giá cho user mới",
        "description": "Giảm 10% cho user mới",
        "discountType": "percentage",
        "discountValue": 10,
        "minimumOrderAmount": 0,
        "maximumDiscountAmount": null,
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-12-31T23:59:59.000Z",
        "usageLimit": null,
        "usedCount": 500,
        "usageLimitPerUser": 1,
        "applicableTo": "all",
        "applicableToUsers": "first_time",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
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

**Lấy trang 1, 20 items**:
```
GET /api/coupons?page=1&limit=20
```

**Lọc theo active**:
```
GET /api/coupons?isActive=true
```

**Tìm kiếm theo code**:
```
GET /api/coupons?code=SUMMER
```

**Kết hợp filter**:
```
GET /api/coupons?isActive=true&code=SUMMER&page=1&limit=10
```

---

## 3. POST /api/coupons (Admin Only)

### Mô tả
Tạo coupon mới. Chỉ dành cho admin.

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
  "code": "SUMMER2024",
  "name": "Giảm giá mùa hè 2024",
  "description": "Giảm 20% cho đơn hàng từ 500,000 VND, tối đa 500,000 VND",
  "discountType": "percentage",
  "discountValue": 20,
  "minimumOrderAmount": 500000,
  "maximumDiscountAmount": 500000,
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.000Z",
  "usageLimit": 1000,
  "usageLimitPerUser": 1,
  "applicableTo": "all",
  "applicableToUsers": "all",
  "isActive": true
}
```

**Trường bắt buộc**:
- `code` (string): Mã giảm giá, 3-50 ký tự, unique, tự động uppercase
- `name` (string): Tên coupon, tối đa 200 ký tự
- `discountType` (string): Loại giảm giá (`percentage` hoặc `fixed`)
- `discountValue` (number): Giá trị giảm giá (>= 0)
  - Nếu `percentage`: 0-100
  - Nếu `fixed`: số tiền giảm
- `startDate` (string): Ngày bắt đầu (ISO 8601)
- `endDate` (string): Ngày kết thúc (ISO 8601)

**Trường tùy chọn**:
- `description` (string): Mô tả, tối đa 500 ký tự
- `minimumOrderAmount` (number): Giá trị đơn hàng tối thiểu (mặc định: 0)
- `maximumDiscountAmount` (number): Số tiền giảm tối đa (chỉ áp dụng với percentage, mặc định: null = không giới hạn)
- `usageLimit` (number): Số lần sử dụng tối đa (mặc định: null = không giới hạn)
- `usageLimitPerUser` (number): Số lần sử dụng tối đa mỗi user (mặc định: 1)
- `applicableTo` (string): Áp dụng cho (`all`, `categories`, `products`, mặc định: `all`)
- `categories` (array): Mảng ID categories (chỉ khi `applicableTo = 'categories'`)
- `products` (array): Mảng ID products (chỉ khi `applicableTo = 'products'`)
- `applicableToUsers` (string): Áp dụng cho users (`all`, `specific`, `first_time`, mặc định: `all`)
- `specificUsers` (array): Mảng ID users (chỉ khi `applicableToUsers = 'specific'`)
- `isActive` (boolean): Trạng thái active (mặc định: true)

### Response thành công (201 Created)
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "coupon": {
      "_id": "...",
      "code": "SUMMER2024",
      "name": "Giảm giá mùa hè 2024",
      "description": "Giảm 20% cho đơn hàng từ 500,000 VND, tối đa 500,000 VND",
      "discountType": "percentage",
      "discountValue": 20,
      "minimumOrderAmount": 500000,
      "maximumDiscountAmount": 500000,
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-08-31T23:59:59.000Z",
      "usageLimit": 1000,
      "usedCount": 0,
      "usageLimitPerUser": 1,
      "applicableTo": "all",
      "categories": [],
      "products": [],
      "applicableToUsers": "all",
      "specificUsers": [],
      "isActive": true,
      "createdAt": "2024-05-01T00:00:00.000Z",
      "updatedAt": "2024-05-01T00:00:00.000Z"
    }
  }
}
```

### Response lỗi

**409 Conflict - Code đã tồn tại**:
```json
{
  "success": false,
  "status": 409,
  "message": "Coupon code already exists"
}
```

**400 Bad Request - End date phải sau start date**:
```json
{
  "success": false,
  "status": 400,
  "message": "End date must be after start date"
}
```

**400 Bad Request - Percentage discount vượt quá 100%**:
```json
{
  "success": false,
  "status": 400,
  "message": "Percentage discount cannot exceed 100%"
}
```

**404 Not Found - Categories/Products không tồn tại**:
```json
{
  "success": false,
  "status": 400,
  "message": "Some categories not found"
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
- Code được tự động chuyển thành uppercase
- Code phải unique trong hệ thống
- End date phải sau start date
- Nếu `applicableTo = 'categories'` hoặc `'products'`, cần cung cấp mảng tương ứng
- Nếu `applicableToUsers = 'specific'`, cần cung cấp mảng `specificUsers`

---

## 4. PATCH /api/coupons/:id (Admin Only)

### Mô tả
Cập nhật thông tin coupon. Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### URL Parameters
- `id` (string): ID của coupon cần cập nhật (MongoDB ObjectId)

### Request Body
```json
{
  "name": "Giảm giá mùa hè 2024 - Cập nhật",
  "discountValue": 25,
  "maximumDiscountAmount": 600000,
  "isActive": false
}
```

**Tất cả các trường đều tùy chọn** (giống như create, nhưng tất cả đều optional)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    "coupon": {
      "_id": "...",
      "code": "SUMMER2024",
      "name": "Giảm giá mùa hè 2024 - Cập nhật",
      "discountType": "percentage",
      "discountValue": 25,
      "maximumDiscountAmount": 600000,
      "isActive": false,
      ...
    }
  }
}
```

### Response lỗi

**404 Not Found - Coupon không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Coupon not found"
}
```

**409 Conflict - Code đã tồn tại**:
```json
{
  "success": false,
  "status": 409,
  "message": "Coupon code already exists"
}
```

**400 Bad Request - End date phải sau start date**:
```json
{
  "success": false,
  "status": 400,
  "message": "End date must be after start date"
}
```

### Ghi chú
- Chỉ cập nhật các trường được gửi trong request body
- Code được tự động uppercase nếu có thay đổi
- Kiểm tra validation tương tự như create

---

## 5. DELETE /api/coupons/:id (Admin Only)

### Mô tả
Soft delete coupon (đánh dấu xóa, không xóa thực sự). Chỉ dành cho admin.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `id` (string): ID của coupon cần xóa (MongoDB ObjectId)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Coupon deleted successfully",
  "data": null
}
```

### Response lỗi

**404 Not Found - Coupon không tồn tại**:
```json
{
  "success": false,
  "status": 404,
  "message": "Coupon not found"
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
- Soft delete: Coupon được đánh dấu `isDeleted = true`, không bị xóa khỏi database
- Coupon đã bị soft delete sẽ không xuất hiện trong danh sách và không thể validate

---

## Cấu trúc dữ liệu Coupon

Mỗi coupon có cấu trúc:

```json
{
  "_id": "ObjectId",
  "code": "string (required, 3-50 chars, unique, uppercase)",
  "name": "string (required, max 200 chars)",
  "description": "string (optional, max 500 chars)",
  "discountType": "string (required, enum: 'percentage' | 'fixed')",
  "discountValue": "number (required, >= 0)",
  "minimumOrderAmount": "number (default: 0, >= 0)",
  "maximumDiscountAmount": "number (optional, >= 0, chỉ áp dụng với percentage)",
  "startDate": "Date (required)",
  "endDate": "Date (required)",
  "usageLimit": "number (optional, >= 1, null = unlimited)",
  "usedCount": "number (default: 0, >= 0)",
  "usageLimitPerUser": "number (default: 1, >= 1)",
  "applicableTo": "string (default: 'all', enum: 'all' | 'categories' | 'products')",
  "categories": "array of ObjectId (ref: Category, optional)",
  "products": "array of ObjectId (ref: Product, optional)",
  "applicableToUsers": "string (default: 'all', enum: 'all' | 'specific' | 'first_time')",
  "specificUsers": "array of ObjectId (ref: User, optional)",
  "isActive": "boolean (default: true)",
  "isDeleted": "boolean (default: false)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Giải thích các trường:

- **code**: Mã giảm giá, unique, tự động uppercase
- **name**: Tên coupon
- **description**: Mô tả coupon
- **discountType**: Loại giảm giá
  - `percentage`: Giảm theo phần trăm (0-100%)
  - `fixed`: Giảm số tiền cố định
- **discountValue**: Giá trị giảm giá
- **minimumOrderAmount**: Giá trị đơn hàng tối thiểu để áp dụng coupon
- **maximumDiscountAmount**: Số tiền giảm tối đa (chỉ áp dụng với percentage)
- **startDate**: Ngày bắt đầu hiệu lực
- **endDate**: Ngày kết thúc hiệu lực
- **usageLimit**: Số lần sử dụng tối đa (null = không giới hạn)
- **usedCount**: Số lần đã sử dụng
- **usageLimitPerUser**: Số lần sử dụng tối đa mỗi user
- **applicableTo**: Phạm vi áp dụng
  - `all`: Tất cả sản phẩm
  - `categories`: Chỉ các category được chỉ định
  - `products`: Chỉ các sản phẩm được chỉ định
- **categories**: Mảng ID categories (khi `applicableTo = 'categories'`)
- **products**: Mảng ID products (khi `applicableTo = 'products'`)
- **applicableToUsers**: Đối tượng users
  - `all`: Tất cả users
  - `specific`: Chỉ các users được chỉ định
  - `first_time`: Chỉ users lần đầu mua hàng
- **specificUsers**: Mảng ID users (khi `applicableToUsers = 'specific'`)
- **isActive**: Trạng thái active
- **isDeleted**: Trạng thái soft delete

---

## Logic Validation

Hệ thống kiểm tra coupon theo thứ tự:

1. **Active & Deleted**: Coupon phải active và chưa bị xóa
2. **Thời gian**: Hiện tại phải nằm trong khoảng `[startDate, endDate]`
3. **Usage Limit**: `usedCount < usageLimit` (nếu có limit)
4. **Minimum Order Amount**: `orderAmount >= minimumOrderAmount`
5. **Applicable To**: 
   - Nếu `applicableTo = 'products'`: Đơn hàng phải chứa ít nhất 1 sản phẩm trong danh sách
   - Nếu `applicableTo = 'categories'`: Đơn hàng phải chứa sản phẩm thuộc ít nhất 1 category trong danh sách
6. **User Restrictions**:
   - Nếu `applicableToUsers = 'specific'`: User phải nằm trong danh sách `specificUsers`
   - Nếu `applicableToUsers = 'first_time'`: User chưa từng đặt hàng (có thể implement sau)

---

## Tính toán Discount

### Percentage Discount
```
discountAmount = (orderAmount * discountValue) / 100

Nếu có maximumDiscountAmount:
  discountAmount = min(discountAmount, maximumDiscountAmount)
```

**Ví dụ**:
- `orderAmount = 1,000,000 VND`
- `discountValue = 20%`
- `maximumDiscountAmount = 500,000 VND`
- → `discountAmount = min(200,000, 500,000) = 200,000 VND`

### Fixed Discount
```
discountAmount = discountValue

Nếu discountAmount > orderAmount:
  discountAmount = orderAmount
```

**Ví dụ**:
- `orderAmount = 500,000 VND`
- `discountValue = 1,000,000 VND`
- → `discountAmount = 500,000 VND` (không vượt quá orderAmount)

---

## Mã lỗi HTTP

| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Bad Request (validation failed, logic error) |
| 401 | Unauthorized (token không hợp lệ, chưa đăng nhập) |
| 403 | Forbidden (không có quyền admin) |
| 404 | Not Found (coupon không tồn tại) |
| 409 | Conflict (code đã tồn tại) |
| 500 | Internal Server Error |

---

## Lưu ý quan trọng

1. **Authentication & Authorization**: 
   - Endpoint `POST /api/coupons/validate` là public (không cần đăng nhập)
   - Các endpoint GET, POST, PATCH, DELETE yêu cầu đăng nhập và role `admin`

2. **Code Uniqueness**: 
   - Code phải unique trong hệ thống
   - Code được tự động chuyển thành uppercase

3. **Date Validation**: 
   - End date phải sau start date
   - Coupon chỉ hợp lệ trong khoảng thời gian `[startDate, endDate]`

4. **Discount Calculation**: 
   - Percentage: Tính theo phần trăm, có thể có maximum
   - Fixed: Số tiền cố định, không vượt quá orderAmount

5. **Usage Tracking**: 
   - `usedCount` được tăng tự động khi coupon được sử dụng (trong order flow)
   - `usageLimitPerUser` cần được kiểm tra trong order flow

6. **Applicable To**: 
   - `all`: Áp dụng cho tất cả sản phẩm
   - `categories`: Chỉ áp dụng cho sản phẩm thuộc categories được chỉ định
   - `products`: Chỉ áp dụng cho các sản phẩm được chỉ định

7. **User Restrictions**: 
   - `all`: Tất cả users có thể sử dụng
   - `specific`: Chỉ users trong danh sách `specificUsers`
   - `first_time`: Chỉ users chưa từng đặt hàng (cần implement logic check)

8. **Soft Delete**: 
   - Coupon bị soft delete (`isDeleted = true`) vẫn tồn tại trong database
   - Coupon đã bị soft delete không thể validate

---

## Ví dụ sử dụng

### Tạo coupon percentage với maximum
```json
POST /api/coupons
{
  "code": "SUMMER20",
  "name": "Giảm 20% mùa hè",
  "discountType": "percentage",
  "discountValue": 20,
  "minimumOrderAmount": 500000,
  "maximumDiscountAmount": 500000,
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.000Z",
  "usageLimit": 1000
}
```

### Tạo coupon fixed amount
```json
POST /api/coupons
{
  "code": "FIXED50K",
  "name": "Giảm 50,000 VND",
  "discountType": "fixed",
  "discountValue": 50000,
  "minimumOrderAmount": 200000,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z"
}
```

### Tạo coupon cho specific products
```json
POST /api/coupons
{
  "code": "IPHONE10",
  "name": "Giảm 10% cho iPhone",
  "discountType": "percentage",
  "discountValue": 10,
  "applicableTo": "products",
  "products": ["65a1b2c3d4e5f6g7h8i9j0k1", "65a1b2c3d4e5f6g7h8i9j0k2"],
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z"
}
```

### Tạo coupon cho specific users
```json
POST /api/coupons
{
  "code": "VIP50",
  "name": "Giảm 50% cho VIP",
  "discountType": "percentage",
  "discountValue": 50,
  "applicableToUsers": "specific",
  "specificUsers": ["65a1b2c3d4e5f6g7h8i9j0k1", "65a1b2c3d4e5f6g7h8i9j0k2"],
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z"
}
```

### Validate coupon
```json
POST /api/coupons/validate
{
  "code": "SUMMER20",
  "orderAmount": 1000000,
  "productIds": ["65a1b2c3d4e5f6g7h8i9j0k1"],
  "userId": "65a1b2c3d4e5f6g7h8i9j0k2"
}
```

---

Chúc bạn sử dụng API thành công! 🚀

