import React, { useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";

const initialData = [
  { id: 1, name: "Tai nghe", description: "Tai nghe không dây, có dây" },
  { id: 2, name: "Chuột", description: "Chuột chơi game & văn phòng" },
];

const Categories = () => {
  const [categories, setCategories] = useState(initialData);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ id: null, name: "", description: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const [nextId, setNextId] = useState(3);

  // Filtering
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Submit (create / update)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Tên danh mục không được để trống.");
      return;
    }

    if (isEditing) {
      setCategories((prev) => prev.map((p) => (p.id === form.id ? { ...form } : p)));
      setIsEditing(false);
    } else {
      setCategories((prev) => [
        ...prev,
        { id: nextId, name: form.name.trim(), description: form.description.trim() },
      ]);
      setNextId((id) => id + 1);
    }

    setForm({ id: null, name: "", description: "" });
  };

  const handleEdit = (cat) => {
    setForm(cat);
    setIsEditing(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    if (window.confirm(`Xóa danh mục "${cat.name}"? Hành động không thể hoàn tác.`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="p-8 md:p-10 lg:p-12">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 leading-tight">Quản lý Danh mục</h1>
        <p className="mt-2 text-base text-gray-600 leading-7">
          Thêm, chỉnh sửa hoặc xóa danh mục sản phẩm.
        </p>
      </header>

      {/* Form card */}
      <section className="mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ví dụ: Tai nghe"
                className="w-full bg-white border border-gray-200 text-black rounded-md px-4 py-3 placeholder:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                aria-label="Tên danh mục"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả ngắn (tùy chọn)"
                className="w-full bg-white border border-gray-200 text-black rounded-md px-4 py-3 placeholder:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                aria-label="Mô tả danh mục"
              />
            </div>

            <div className="flex items-center md:justify-end">
              <div className="w-full">
                <button
                  type="submit"
                  className={`w-full md:w-auto inline-flex items-center justify-center px-6 py-3 rounded-md text-white font-medium transition-transform transform ${
                    isEditing ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
                  } active:scale-95`}
                >
                  {isEditing ? "Cập nhật" : "Thêm mới"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ id: null, name: "", description: "" });
                      setIsEditing(false);
                      setError("");
                    }}
                    className="mt-2 md:mt-0 md:ml-3 text-sm text-gray-600 hover:underline"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </form>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </section>

      {/* Search & meta */}
      <section className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-1/2">
          <label htmlFor="search" className="sr-only">Tìm kiếm</label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            className="w-full pl-10 bg-white border border-gray-200 rounded-md px-4 py-3 placeholder:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            aria-label="Tìm kiếm danh mục"
          />
        </div>

        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">{filtered.length}</span>{" "}
          danh mục (tổng {categories.length})
        </div>
      </section>

      {/* Table card */}
      <section>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">ID</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Tên</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Mô tả</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Chưa có danh mục phù hợp. Hãy thử thay đổi từ khoá tìm kiếm hoặc thêm danh mục mới.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 focus-within:bg-gray-50">
                    <td className="px-6 py-4 align-middle text-sm text-gray-600">{cat.id}</td>
                    <td className="px-6 py-4 align-middle text-sm text-gray-800 font-medium">{cat.name}</td>
                    <td className="px-6 py-4 align-middle text-sm text-gray-600">{cat.description}</td>
                    <td className="px-6 py-4 align-middle text-sm text-center">
                      <div className="inline-flex gap-3 items-center">
                        <button
                          onClick={() => handleEdit(cat)}
                          title="Chỉnh sửa"
                          className="p-2 hover:bg-gray-100 rounded-full"
                          aria-label={`Chỉnh sửa ${cat.name}`}
                        >
                          <Pencil size={15} className="text-blue-800" />
                        </button>

                        <button
                          onClick={() => handleDelete(cat.id)}
                          title="Xóa"
                          className="p-2 hover:bg-gray-100 rounded-full"
                          aria-label={`Xóa ${cat.name}`}
                        >
                          <Trash2 size={15} className="text-red-800" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Categories;


