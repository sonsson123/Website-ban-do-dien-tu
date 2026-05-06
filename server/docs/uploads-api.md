# Tài liệu API Uploads

## Tổng quan

Tài liệu này mô tả chi tiết các API endpoint liên quan đến upload và quản lý ảnh trên Cloudinary.

**Base URL**: `http://localhost:5000/api/uploads`

---

## 1. POST /api/uploads/images

### Mô tả
Upload một hoặc nhiều ảnh lên Cloudinary. Ảnh được tự động resize và optimize. Trả về URL và publicId.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

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
      {
        "url": "https://res.cloudinary.com/.../it4409_shop/uploads/image1.jpg",
        "publicId": "it4409_shop/uploads/image1"
      },
      {
        "url": "https://res.cloudinary.com/.../it4409_shop/uploads/image2.jpg",
        "publicId": "it4409_shop/uploads/image2"
      }
    ]
  }
}
```

### Response lỗi

**400 Bad Request - Không có file**:
```json
{
  "success": false,
  "status": 400,
  "message": "No image files provided"
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

**500 Internal Server Error - Upload thất bại**:
```json
{
  "success": false,
  "status": 500,
  "message": "Failed to upload images: <error message>"
}
```

### Ghi chú
- Ảnh được upload lên Cloudinary trong folder `it4409_shop/uploads`
- Ảnh được tự động resize (max 1000x1000) và optimize
- File tạm được tự động xóa sau khi upload
- Tối đa 10 ảnh mỗi lần upload
- Kích thước tối đa: 5MB mỗi ảnh

### Ví dụ sử dụng (Postman)
1. Chọn method: `POST`
2. URL: `{{base_url}}/api/uploads/images`
3. Body → form-data
4. Key: `images` (chọn type: File)
5. Value: Chọn file ảnh (có thể chọn nhiều file)

---

## 2. DELETE /api/uploads/:publicId

### Mô tả
Xóa ảnh khỏi Cloudinary bằng publicId.

### Yêu cầu xác thực
Cần (Bearer Token)

### Request Headers
```
Authorization: Bearer <access_token>
```

### URL Parameters
- `publicId` (string): Public ID của ảnh trên Cloudinary (có thể bị encode trong URL)

### Response thành công (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Image deleted successfully",
  "data": {
    "publicId": "it4409_shop/uploads/image1",
    "deleted": true
  }
}
```

### Response lỗi

**400 Bad Request - Thiếu publicId**:
```json
{
  "success": false,
  "status": 400,
  "message": "Public ID is required"
}
```

**500 Internal Server Error - Xóa thất bại**:
```json
{
  "success": false,
  "status": 500,
  "message": "Failed to delete image: <error message>"
}
```

### Ghi chú
- PublicId sẽ được tự động decode nếu bị encode trong URL
- Ảnh bị xóa hoàn toàn khỏi Cloudinary
- Không thể khôi phục sau khi xóa

### Ví dụ sử dụng

**Xóa ảnh**:
```
DELETE /api/uploads/it4409_shop/uploads/image1
```

**Xóa ảnh với publicId có ký tự đặc biệt (tự động decode)**:
```
DELETE /api/uploads/it4409_shop%2Fuploads%2Fimage1
```

---

## Cấu trúc PublicId

PublicId trên Cloudinary có format:
```
it4409_shop/{folder}/{filename}
```

Ví dụ:
- `it4409_shop/uploads/image1`
- `it4409_shop/products/product1`
- `it4409_shop/categories/category1`

---

## Mã lỗi HTTP

| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 400 | Bad Request (không có file, file không hợp lệ) |
| 401 | Unauthorized (token không hợp lệ, chưa đăng nhập) |
| 500 | Internal Server Error (upload/delete thất bại) |

---

## Lưu ý quan trọng

1. **Authentication**: 
   - Tất cả endpoints yêu cầu đăng nhập (Bearer Token)

2. **File Format**: 
   - Chỉ chấp nhận: jpeg, jpg, png, gif, webp
   - Kích thước tối đa: 5MB mỗi ảnh

3. **Auto Optimization**: 
   - Ảnh được tự động resize (max 1000x1000)
   - Quality được tự động optimize
   - Format được tự động chọn (auto)

4. **Temp File Cleanup**: 
   - File tạm được tự động xóa sau khi upload
   - File tạm cũng được xóa nếu upload thất bại

5. **PublicId**: 
   - PublicId được trả về sau khi upload
   - Cần lưu publicId để xóa ảnh sau này
   - PublicId có thể chứa ký tự đặc biệt, sẽ được tự động decode

---

## Ví dụ sử dụng

### Upload một ảnh
- Sử dụng form-data với key `images` và chọn 1 file

### Upload nhiều ảnh
- Sử dụng form-data với key `images` và chọn nhiều file (tối đa 10)

### Xóa ảnh
```
DELETE /api/uploads/it4409_shop/uploads/image1
```

---

Chúc bạn sử dụng API thành công! 🚀

