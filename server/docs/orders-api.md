# Tài liệu API Orders

## Tổng quan

Các API này quản lý vòng đời đơn hàng cho cả khách hàng và admin.  
Base URL chung: `http://localhost:5000`

| Endpoint | Mô tả |
|----------|-------|
| `GET /api/orders` | Danh sách đơn của user (có lọc trạng thái + phân trang) |
| `GET /api/orders/:id` | Chi tiết đơn của user hiện tại |
| `GET /api/admin/orders` | Danh sách tất cả đơn (admin, có lọc status/date/user/payment) |
| `PATCH /api/admin/orders/:id/status` | Cập nhật trạng thái đơn (admin) |

Các trạng thái hợp lệ: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`.

---

## 1. GET /api/orders

### Mô tả
Trả về danh sách đơn hàng của user hiện tại. Có hỗ trợ phân trang và filter theo trạng thái.

### Xác thực
Yêu cầu Bearer Token.

### Query Params
| Tên | Kiểu | Mặc định | Ghi chú |
|-----|------|----------|---------|
| `page` | number | 1 | Trang hiện tại (>=1) |
| `limit` | number | 10 | Số bản ghi mỗi trang (1-100) |
| `status` | string | - | Một trong các trạng thái hợp lệ |

### Response mẫu (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "675a02f1c2b5ed0b9465cb11",
        "orderNumber": "ORD1203450001",
        "user": "6759fed7da5b6ba994f8e0c7",
        "orderStatus": "processing",
        "paymentStatus": "paid",
        "paymentMethod": "vnpay",
        "subtotal": 25980000,
        "shippingFee": 30000,
        "taxAmount": 0,
        "discountAmount": 1000000,
        "totalAmount": 24980000,
        "shippingAddress": {
          "fullName": "Nguyễn Văn A",
          "phone": "0901234567",
          "street": "12 Láng Hạ",
          "ward": "Láng Hạ",
          "district": "Đống Đa",
          "city": "Hà Nội"
        },
        "createdAt": "2024-11-12T04:13:21.149Z",
        "updatedAt": "2024-11-13T02:05:11.002Z",
        "items": [
          {
            "_id": "675a02f1c2b5ed0b9465cb13",
            "order": "675a02f1c2b5ed0b9465cb11",
            "product": {
              "_id": "674ff4690b6e9cd41eb04710",
              "name": "iPhone 15 Pro Max",
              "slug": "iphone-15-pro-max",
              "images": [
                "https://res.cloudinary.com/demo/image/upload/v1/products/iphone15.jpg"
              ],
              "price": 29990000,
              "discount": 5,
              "stock": 8
            },
            "productName": "iPhone 15 Pro Max",
            "productImage": "https://res.cloudinary.com/demo/image/upload/v1/products/iphone15.jpg",
            "price": 12990000,
            "quantity": 2,
            "subtotal": 25980000,
            "createdAt": "2024-11-12T04:13:21.170Z",
            "updatedAt": "2024-11-12T04:13:21.170Z"
          }
        ]
      }
    ],
    "pagination": {
      "total": 4,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Response lỗi
- `401 Unauthorized`: Thiếu hoặc token không hợp lệ.
- `400 Bad Request`: Tham số không hợp lệ (`Validation failed`).

---

## 2. GET /api/orders/:id

### Mô tả
Trả về chi tiết một đơn của user hiện tại. Nếu user không sở hữu đơn sẽ trả 404.

### Xác thực
Yêu cầu Bearer Token.

### Params
- `id` (ObjectId) – ID của đơn.

### Response mẫu (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "order": {
      "_id": "675a02f1c2b5ed0b9465cb11",
      "orderNumber": "ORD1203450001",
      "orderStatus": "processing",
      "paymentStatus": "paid",
      "shippingAddress": {
        "fullName": "Nguyễn Văn A",
        "phone": "0901234567",
        "street": "12 Láng Hạ",
        "ward": "Láng Hạ",
        "district": "Đống Đa",
        "city": "Hà Nội"
      },
      "subtotal": 25980000,
      "totalAmount": 24980000,
      "createdAt": "2024-11-12T04:13:21.149Z",
      "items": [
        {
          "_id": "675a02f1c2b5ed0b9465cb13",
          "order": "675a02f1c2b5ed0b9465cb11",
          "productName": "iPhone 15 Pro Max",
          "price": 12990000,
          "quantity": 2,
          "subtotal": 25980000,
          "product": {
            "_id": "674ff4690b6e9cd41eb04710",
            "name": "iPhone 15 Pro Max",
            "slug": "iphone-15-pro-max"
          }
        }
      ]
    }
  }
}
```

### Response lỗi
- `404 Not Found`: Đơn không tồn tại hoặc không thuộc về user hiện tại.

---

## 3. GET /api/admin/orders

### Mô tả
Danh sách tất cả đơn, dành cho admin. Hỗ trợ nhiều bộ lọc.

### Xác thực
Yêu cầu Bearer Token + quyền admin.

### Query Params
| Tên | Kiểu | Ghi chú |
|-----|------|---------|
| `page`, `limit` | number | Phân trang (1-100) |
| `status` | string | Filter theo `orderStatus` |
| `paymentStatus` | string | `pending`, `paid`, `failed`, `refunded` |
| `user` | string | MongoId của user |
| `orderNumber` | string | Tìm kiếm theo orderNumber (>=3 ký tự, hỗ trợ fuzzy) |
| `startDate`, `endDate` | ISO date | Filter theo khoảng thời gian tạo |

### Response mẫu (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Admin orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "675a02f1c2b5ed0b9465cb11",
        "orderNumber": "ORD1203450001",
        "orderStatus": "processing",
        "paymentStatus": "paid",
        "user": {
          "_id": "6759fed7da5b6ba994f8e0c7",
          "fullName": "Nguyễn Văn A",
          "email": "customer@it4409.com",
          "phone": "0901234567",
          "role": "customer"
        },
        "totalAmount": 24980000,
        "items": [
          {
            "_id": "675a02f1c2b5ed0b9465cb13",
            "productName": "iPhone 15 Pro Max",
            "quantity": 2,
            "product": {
              "_id": "674ff4690b6e9cd41eb04710",
              "name": "iPhone 15 Pro Max",
              "slug": "iphone-15-pro-max",
              "images": [
                "https://res.cloudinary.com/demo/image/upload/v1/products/iphone15.jpg"
              ],
              "price": 29990000,
              "discount": 5,
              "stock": 8
            }
          }
        ],
        "createdAt": "2024-11-12T04:13:21.149Z"
      }
    ],
    "pagination": {
      "total": 34,
      "page": 1,
      "limit": 20,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Response lỗi
- `401 Unauthorized`: Không có token.
- `403 Forbidden`: Không phải admin.
- `400 Bad Request`: Sai định dạng filter.

---

## 4. PATCH /api/admin/orders/:id/status

### Mô tả
Cập nhật trạng thái đơn hàng. Admin được phép chuyển trạng thái sang `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`.

### Xác thực
Yêu cầu Bearer Token + quyền admin.

### Request Body
```json
{
  "status": "shipped",
  "reason": "Khách đổi địa chỉ giao hàng" // optional, nên cung cấp khi cancel
}
```

| Trường | Bắt buộc | Ghi chú |
|--------|----------|---------|
| `status` | Có | Một trong các trạng thái cho phép |
| `reason` | Không | Ghi chú nội bộ, nên gửi khi huỷ đơn |

### Response mẫu (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "order": {
      "_id": "675a02f1c2b5ed0b9465cb11",
      "orderStatus": "shipped",
      "deliveredAt": null,
      "cancelledAt": null,
      "user": {
        "_id": "6759fed7da5b6ba994f8e0c7",
        "fullName": "Nguyễn Văn A",
        "email": "customer@it4409.com"
      },
      "items": [
        {
          "_id": "675a02f1c2b5ed0b9465cb13",
          "productName": "iPhone 15 Pro Max",
          "quantity": 2
        }
      ],
      "updatedAt": "2024-11-13T02:05:11.002Z"
    }
  }
}
```

### Response lỗi
- `404 Not Found`: Đơn không tồn tại.
- `400 Bad Request`: Trạng thái không hợp lệ / thiếu body.

---

## Ghi chú triển khai

- Tất cả responses dùng chung `ApiResponse`, gồm `statusCode`, `success`, `message`, `data`.
- Danh sách luôn đi kèm `pagination` (total/page/limit/hasNext/hasPrev).
- `items` luôn chứa snapshot thông tin sản phẩm tại thời điểm đặt hàng (`productName`, `price`, `quantity`, `subtotal`) và đồng thời populate thông tin sản phẩm hiện tại (name, slug, images, price, discount, stock) để admin có thể tham chiếu nhanh.
- `updateOrderStatus` tự động set:
  - `deliveredAt` khi status = `delivered`
  - `cancelledAt` và `cancellationReason` khi status = `cancelled`
  - reset các timestamp nếu chuyển sang trạng thái khác.

---

## Kiểm thử nhanh

```
# Khách hàng - lấy danh sách đơn
GET /api/orders?page=1&limit=10&status=processing
Authorization: Bearer <user_token>

# Admin - danh sách đơn
GET /api/admin/orders?status=confirmed&startDate=2024-11-01&endDate=2024-11-30
Authorization: Bearer <admin_token>

# Admin - cập nhật trạng thái
PATCH /api/admin/orders/675a02f1c2b5ed0b9465cb11/status
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "status": "shipped"
}
```

---

Chúc bạn tích hợp API thành công! 🚀



