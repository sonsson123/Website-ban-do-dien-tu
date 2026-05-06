
import React, { useState } from "react";
import { Eye, Pencil, Trash2, Search, Plus } from "lucide-react";


const initialProducts = [
  { id: 1, name: "Tai nghe Bluetooth", description: "Tai nghe không dây, pin 20h", price: 590000, quantity: 20 },
  { id: 2, name: "Chuột Logitech G102", description: "Chuột chơi game RGB", price: 390000, quantity: 50 },
];

const Products = () => {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ id: null, name: "", description: "", price: "", quantity: "" }); // note : cần update thêm các trường khác nếu cần
  const [isEditing, setIsEditing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState("");
  const [nextId, setNextId] = useState(3);

  // Lọc sản phẩm theo từ khóa tìm kiếm
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  // Mở form thêm sản phẩm mới
  const handleAddNew = () => {
    setForm({ id: null, name: "", description: "", price: "", quantity: "" });
    setIsEditing(false);
    setError("");
    setIsFormVisible(true);
  };

  // Mở form chỉnh sửa
  const handleEdit = (product) => {
    setForm(product);
    setIsEditing(true);
    setError("");
    setIsFormVisible(true);
  };

  // Mở giao diện chi tiết
  const handleView = (product) => {
    setSelectedProduct(product);
    setIsDetailVisible(true);
  };

  // Xóa sản phẩm
  const handleDelete = (id) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${prod.name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Lưu sản phẩm (Thêm / Cập nhật)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Tên sản phẩm không được để trống.");
      return;
    }
    if (!form.price || form.price <= 0) {
      setError("Giá sản phẩm phải lớn hơn 0.");
      return;
    }
    if (isEditing) {
      setProducts((prev) => prev.map((p) => (p.id === form.id ? { ...form, price: Number(form.price), quantity: Number(form.quantity) } : p)));
    } else {
      setProducts((prev) => [
        ...prev,
        {
          id: nextId,
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          quantity: Number(form.quantity),
        },
      ]);
      setNextId((id) => id + 1);
    }
    setForm({ id: null, name: "", description: "", price: "", quantity: "" });
    setIsFormVisible(false);
    setIsEditing(false);
  };

  return (
    <div className="p-8 md:p-10 lg:p-12">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Quản lý Sản phẩm</h1>
          <p className="mt-2 text-gray-600">Thêm, chỉnh sửa, xem chi tiết hoặc xóa sản phẩm.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Thêm sản phẩm mới
        </button>
      </header>

      {/* Thanh tìm kiếm */}
      {!isFormVisible && !isDetailVisible && (
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-1/2">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white pl-10 text-black border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">{filtered.length}</span> sản phẩm (tổng {products.length})
          </div>
        </div>
      )}

      {/* Giao diện danh sách sản phẩm */}
      {!isFormVisible && !isDetailVisible && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên sản phẩm</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Danh mục</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mô tả</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Giá</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số lượng</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy sản phẩm nào. Hãy thử thêm mới hoặc thay đổi từ khóa tìm kiếm.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-600">{p.id}</td>
                    <td className="px-6 py-3 text-gray-800 font-medium">{p.name}</td>
                    <td className="px-6 py-3 text-gray-600">{p.category || "Chưa có thông tin danh mục"}</td>
                    <td className="px-6 py-3 text-gray-600">{p.description}</td>
                    <td className="px-6 py-3 text-gray-600">{p.price.toLocaleString()} ₫</td>
                    <td className="px-6 py-3 text-gray-600">{p.quantity}</td>
                    <td className="px-6 py-3 text-center">
                      <div className="inline-flex gap-3">
                        <button onClick={() => handleView(p)} title="Xem chi tiết" className="p-2 hover:bg-gray-100 rounded-full">
                          <Eye size={20} className="text-blue-600" />
                        </button>
                        <button onClick={() => handleEdit(p)} title="Chỉnh sửa" className="p-2 hover:bg-gray-100 rounded-full">
                          <Pencil size={20} className="text-amber-600" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} title="Xóa" className="p-2 hover:bg-red-50 rounded-full">
                          <Trash2 size={20} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

{/* Form thêm / sửa sản phẩm */}
{isFormVisible && (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">
      {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
    </h2>

    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >

      {/* TÊN SẢN PHẨM */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tên sản phẩm
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-white border border-gray-200 text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* GIÁ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Giá (₫)
        </label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full border bg-white border-gray-200 text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* SỐ LƯỢNG */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số lượng
        </label>
        <input
          type="number"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="w-full border bg-white border-gray-200 text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* DANH MỤC SẢN PHẨM */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Danh mục
        </label>
        <select
          value={form.category || ""}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border bg-white border-gray-200 text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {/* Note : Các danh mục cần được lấy ra từ CSDL */}
          <option value="">— Chọn danh mục —</option>
          <option value="Điện thoại">Điện thoại</option>
          <option value="Laptop">Laptop</option>
          <option value="Phụ kiện">Phụ kiện</option>
          <option value="Gia dụng">Gia dụng</option>
          <option value="Khác">Khác</option>
        </select>
      </div>

      {/* HÌNH ẢNH MINH HỌA (Note : Chọn từ thư mục ở trên máy tính)*/}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hình ảnh minh họa (URL)
        </label>
        <input
          type="text"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          placeholder="https://link-to-your-image.com/image.jpg"
          className="w-full border bg-white border-gray-200 text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="Preview"
            className="mt-3 w-40 h-40 object-cover rounded shadow border"
          />
        )}
      </div>

      {/* MÔ TẢ NGẮN */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả ngắn
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border bg-white border-gray-200 text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          rows={3}
        />
      </div>

      {/* MÔ TẢ CHI TIẾT */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả chi tiết
        </label>
        <textarea
          value={form.longDescription}
          onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
          className="w-full border bg-white border-gray-200 text-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          rows={6}
        />
      </div>

      {/* HIỂN THỊ LỖI */}
      {error && (
        <p className="text-sm text-red-600 col-span-2">
          {error}
        </p>
      )}

      {/* BUTTONS */}
      <div className="md:col-span-2 flex gap-4 mt-4">
        <button
          type="submit"
          className={`px-6 py-3 rounded-md text-white font-medium ${
            isEditing
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isEditing ? "Cập nhật" : "Thêm mới"}
        </button>

        <button
          type="button"
          onClick={() => setIsFormVisible(false)}
          className="px-6 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Hủy
        </button>
      </div>

    </form>
  </div>
)}


{/* Trang xem chi tiết sản phẩm */}
{isDetailVisible && selectedProduct && (
  <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">

    {/* Header + nút quay lại */}
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={() => setIsDetailVisible(false)}
        className="px-4 py-2 flex items-center gap-2 rounded-md bg-gray-100 hover:bg-gray-200 transition text-gray-700"
      >
        <span className="text-lg">←</span> Quay lại
      </button>

      <h2 className="text-3xl font-bold text-gray-900">
        Chi tiết sản phẩm
      </h2>
    </div>

    {/* Layout chính */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

      {/* Cột trái: Hình ảnh */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md aspect-square rounded-xl border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
          <img
            src={selectedProduct.imageUrl || "https://via.placeholder.com/350?text=No+Image"}
            alt={selectedProduct.name}
            className="object-cover w-full h-full"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">Hình ảnh minh họa sản phẩm</p>
      </div>

      {/* Cột phải: Thông tin */}
      <div className="space-y-6 text-gray-800">

        {/* Tên sản phẩm */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-1">
            {selectedProduct.name}
          </h3>

          {/* Trạng thái */}
          <span
            className={
              "inline-block px-3 py-1 text-sm font-medium rounded-full " +
              (selectedProduct.quantity > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700")
            }
          >
            {selectedProduct.quantity > 0 ? "Còn hàng" : "Hết hàng"}
          </span>
        </div>

        {/* Giá */}
        <div>
          <p className="font-semibold text-gray-600 text-sm">Giá bán</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {selectedProduct.price.toLocaleString()} ₫
          </p>
        </div>

        {/* Thông tin cơ bản */}
        <div className="space-y-1">
          <p><span className="font-semibold text-gray-600">ID:</span> {selectedProduct.id}</p>
          <p>
            <span className="font-semibold text-gray-600">Danh mục:</span>{" "}
            {selectedProduct.category || "Chưa có"}
          </p>
          <p>
            <span className="font-semibold text-gray-600">Số lượng:</span>{" "}
            {selectedProduct.quantity}
          </p>
        </div>

        {/* Mô tả ngắn */}
        <div>
          <p className="font-semibold text-gray-600">Mô tả ngắn</p>
          <p className="mt-1 text-gray-700 leading-relaxed">
            {selectedProduct.description || "Chưa có mô tả."}
          </p>
        </div>

        {/* Mô tả chi tiết */}
        <div>
          <p className="font-semibold text-gray-600">Mô tả chi tiết</p>
          <p className="mt-1 text-gray-700 whitespace-pre-line leading-relaxed">
            {selectedProduct.longDescription || "Chưa có mô tả chi tiết."}
          </p>
        </div>

        {/* Thời gian */}
        <div className="space-y-1">
          <p>
            <span className="font-semibold text-gray-600">Ngày tạo:</span>{" "}
            {selectedProduct.createdAt
              ? new Date(selectedProduct.createdAt).toLocaleString()
              : "Không có dữ liệu"}
          </p>

          <p>
            <span className="font-semibold text-gray-600">Ngày cập nhật:</span>{" "}
            {selectedProduct.updatedAt
              ? new Date(selectedProduct.updatedAt).toLocaleString()
              : "Không có dữ liệu"}
          </p>
        </div>
      </div>
    </div>

  </div>
)}


    </div>
  );
};

export default Products;

