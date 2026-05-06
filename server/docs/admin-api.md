# Tài liệu API Admin/Analytics

## Tổng quan

Tài liệu này mô tả chi tiết các API endpoint liên quan đến quản trị và thống kê (Admin/Analytics) trong hệ thống E-Commerce.

**Base URL**: `http://localhost:5000/api/admin`

---

## 1. GET /api/admin/stats

### Mô tả
Lấy thống kê tổng quan của hệ thống: doanh thu, số đơn hàng, top sản phẩm bán chạy, giá trị đơn hàng trung bình, v.v. Có thể filter theo khoảng thời gian.

### Yêu cầu xác thực
Cần (Bearer Token) + Admin role

### Request Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `startDate` (string, optional): Ngày bắt đầu (ISO 8601 format, ví dụ: `2024-01-01T00:00:00.000Z`)
- `endDate` (string, optional): Ngày kết thúc (ISO 8601 format, ví dụ: `2024-12-31T23:59:59.000Z`)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "revenue": {
      "total": 500000000,
      "averageOrderValue": 2500000,
      "totalPaidOrders": 200
    },
    "orders": {
      "total": 250,
      "byStatus": {
        "pending": 10,
        "confirmed": 20,
        "processing": 30,
        "shipped": 40,
        "delivered": 150,
        "cancelled": 0
      }
    },
    "topProducts": [
      {
        "productId": "...",
        "productName": "iPhone 15 Pro Max",
        "productSlug": "iphone-15-pro-max",
        "productImage": "https://res.cloudinary.com/.../iphone15.jpg",
        "totalQuantity": 500,
        "totalRevenue": 15000000000,
        "orderCount": 200
      },
      {
        "productId": "...",
        "productName": "MacBook Pro 16 inch",
        "productSlug": "macbook-pro-16-inch",
        "productImage": "https://res.cloudinary.com/.../macbook.jpg",
        "totalQuantity": 100,
        "totalRevenue": 7000000000,
        "orderCount": 80
      }
    ],
    "summary": {
      "totalUsers": 1000,
      "totalProducts": 500,
      "totalCoupons": 50,
      "totalOrders": 250
    },
    "monthlyRevenue": [
      {
        "period": "2024-01",
        "revenue": 100000000,
        "orderCount": 50
      },
      {
        "period": "2024-02",
        "revenue": 150000000,
        "orderCount": 75
      },
      {
        "period": "2024-03",
        "revenue": 200000000,
        "orderCount": 100
      }
    ],
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z"
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

### Giải thích các trường trong Response

#### Revenue
- `total`: Tổng doanh thu (tổng `totalAmount` của các đơn đã thanh toán và không bị hủy)
- `averageOrderValue`: Giá trị đơn hàng trung bình
- `totalPaidOrders`: Tổng số đơn đã thanh toán

#### Orders
- `total`: Tổng số đơn hàng (trong khoảng thời gian nếu có)
- `byStatus`: Số đơn theo từng trạng thái
  - `pending`: Đang chờ xử lý
  - `confirmed`: Đã xác nhận
  - `processing`: Đang xử lý
  - `shipped`: Đã giao hàng
  - `delivered`: Đã nhận hàng
  - `cancelled`: Đã hủy

#### Top Products
- Top 10 sản phẩm bán chạy nhất (theo số lượng đã bán)
- Mỗi sản phẩm bao gồm:
  - `productId`: ID sản phẩm
  - `productName`: Tên sản phẩm
  - `productSlug`: Slug sản phẩm
  - `productImage`: Ảnh đầu tiên của sản phẩm
  - `totalQuantity`: Tổng số lượng đã bán
  - `totalRevenue`: Tổng doanh thu từ sản phẩm này
  - `orderCount`: Số đơn hàng chứa sản phẩm này

#### Summary
- `totalUsers`: Tổng số users (chưa bị xóa)
- `totalProducts`: Tổng số sản phẩm (active, chưa bị xóa)
- `totalCoupons`: Tổng số coupons (active, chưa bị xóa)
- `totalOrders`: Tổng số đơn hàng (trong khoảng thời gian nếu có)

#### Monthly Revenue
- Chỉ có khi có cả `startDate` và `endDate`
- Doanh thu theo tháng trong khoảng thời gian
- Mỗi tháng bao gồm:
  - `period`: Tháng (format: YYYY-MM)
  - `revenue`: Doanh thu trong tháng
  - `orderCount`: Số đơn hàng trong tháng

### Ví dụ sử dụng

**Lấy thống kê tổng quan (không filter thời gian)**:
```
GET /api/admin/stats
```

**Lấy thống kê theo khoảng thời gian**:
```
GET /api/admin/stats?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.000Z
```

**Lấy thống kê từ ngày cụ thể đến hiện tại**:
```
GET /api/admin/stats?startDate=2024-01-01T00:00:00.000Z
```

**Lấy thống kê từ đầu đến ngày cụ thể**:
```
GET /api/admin/stats?endDate=2024-12-31T23:59:59.000Z
```

### Ghi chú
- Doanh thu chỉ tính các đơn đã thanh toán (`paymentStatus = 'paid'`) và không bị hủy (`orderStatus != 'cancelled'`)
- Top products được sắp xếp theo `totalQuantity` giảm dần
- Top products chỉ tính các đơn không bị hủy
- Monthly revenue chỉ có khi có cả `startDate` và `endDate`
- Nếu không có date filter, thống kê sẽ tính cho toàn bộ dữ liệu

---

## Cấu trúc dữ liệu Stats

```json
{
  "revenue": {
    "total": "number (tổng doanh thu)",
    "averageOrderValue": "number (giá trị đơn hàng trung bình)",
    "totalPaidOrders": "number (số đơn đã thanh toán)"
  },
  "orders": {
    "total": "number (tổng số đơn)",
    "byStatus": {
      "pending": "number",
      "confirmed": "number",
      "processing": "number",
      "shipped": "number",
      "delivered": "number",
      "cancelled": "number"
    }
  },
  "topProducts": [
    {
      "productId": "ObjectId",
      "productName": "string",
      "productSlug": "string",
      "productImage": "string (URL)",
      "totalQuantity": "number",
      "totalRevenue": "number",
      "orderCount": "number"
    }
  ],
  "summary": {
    "totalUsers": "number",
    "totalProducts": "number",
    "totalCoupons": "number",
    "totalOrders": "number"
  },
  "monthlyRevenue": [
    {
      "period": "string (YYYY-MM)",
      "revenue": "number",
      "orderCount": "number"
    }
  ],
  "period": {
    "startDate": "string (ISO 8601) hoặc null",
    "endDate": "string (ISO 8601) hoặc null"
  }
}
```

---

## Mã lỗi HTTP

| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 401 | Unauthorized (token không hợp lệ, chưa đăng nhập) |
| 403 | Forbidden (không có quyền admin) |
| 500 | Internal Server Error |

---

## Lưu ý quan trọng

1. **Authentication & Authorization**: 
   - Endpoint yêu cầu đăng nhập và role `admin`

2. **Date Filter**: 
   - `startDate` và `endDate` là optional
   - Format: ISO 8601 (ví dụ: `2024-01-01T00:00:00.000Z`)
   - Nếu không có date filter, thống kê tính cho toàn bộ dữ liệu

3. **Revenue Calculation**: 
   - Chỉ tính các đơn đã thanh toán (`paymentStatus = 'paid'`)
   - Không tính các đơn đã hủy (`orderStatus != 'cancelled'`)
   - `averageOrderValue = totalRevenue / totalPaidOrders`

4. **Top Products**: 
   - Sắp xếp theo `totalQuantity` (số lượng đã bán) giảm dần
   - Chỉ lấy top 10
   - Chỉ tính các đơn không bị hủy

5. **Monthly Revenue**: 
   - Chỉ có khi có cả `startDate` và `endDate`
   - Được nhóm theo tháng (YYYY-MM)
   - Sắp xếp theo thời gian tăng dần

6. **Performance**: 
   - Sử dụng MongoDB aggregation pipeline để tính toán hiệu quả
   - Có thể mất thời gian nếu dữ liệu lớn

---

## Ví dụ sử dụng

### Lấy thống kê tổng quan
```
GET /api/admin/stats
```

### Lấy thống kê năm 2024
```
GET /api/admin/stats?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.000Z
```

### Lấy thống kê tháng 1/2024
```
GET /api/admin/stats?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.000Z
```

### Lấy thống kê từ đầu năm đến hiện tại
```
GET /api/admin/stats?startDate=2024-01-01T00:00:00.000Z
```

---

## Công thức tính toán

### Total Revenue
```
totalRevenue = sum(totalAmount) của tất cả đơn hàng thỏa mãn:
  - paymentStatus = 'paid'
  - orderStatus != 'cancelled'
  - createdAt trong khoảng [startDate, endDate] (nếu có)
```

### Average Order Value
```
averageOrderValue = totalRevenue / totalPaidOrders
```

### Top Products
```
Sắp xếp theo totalQuantity giảm dần
totalQuantity = sum(quantity) của tất cả OrderItems
totalRevenue = sum(subtotal) của tất cả OrderItems
orderCount = số đơn hàng chứa sản phẩm
```

---

Chúc bạn sử dụng API thành công! 🚀

