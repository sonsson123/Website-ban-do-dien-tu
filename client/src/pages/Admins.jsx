import React, { useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";

const initialData = [
  { id: 1, username: "admin001", password: "1225487" , adminrealname: "Nguyen Van A" , civilcode: "123456789"  },
  { id: 2, username: "admin002", password: "1422563" , adminrealname: "Tran Thi B" , civilcode: "987654321"  },
];

const Admins = () => {
  const [categories, setCategories] = useState(initialData);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ id: null, username: "", password: "", adminrealname: "", civilcode: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const [nextId, setNextId] = useState(3); 

  // Filtering
  const filtered = categories.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  // Submit (create / update)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim()) {
      setError("Admin Usercode không được để trống.");
      return;
    }
    if (!form.password.trim()) {
      setError("Password không được để trống.");
      return;
    }

    if (isEditing) {
      setCategories((prev) => prev.map((p) => (p.id === form.id ? { ...form } : p)));
      setIsEditing(false);
    } else {
      setCategories((prev) => [
        ...prev,
        { 
          id: nextId, 
          username: form.username.trim(), 
          password: form.password.trim(),
          adminrealname: form.adminrealname.trim(),
          civilcode: form.civilcode.trim()
        },
      ]);
      setNextId((id) => id + 1);
    }

    setForm({ id: null, username: "", password: "", adminrealname: "", civilcode: "" });
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
    if (window.confirm(`Xóa admin "${cat.username}"? Hành động không thể hoàn tác.`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="p-8 md:p-10 lg:p-12">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 leading-tight">Quản lý tài khoản admin</h1>
        <p className="mt-2 text-base text-gray-600 leading-7">
          Theo dõi , thêm hoặc xóa tài khoản quản trị viên để quản lý hệ thống.
        </p>
      </header>

      {/* Form card */}
      <section className="mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end"
          >
            {/* Admin usercode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Usercode</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Ví dụ: admin001"
                className="w-full bg-white border border-gray-200 text-black rounded-md px-4 py-3 placeholder:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                aria-label="Admin Usercode"
              />
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Set password here"
                className="w-full bg-white border border-gray-200 text-black rounded-md px-4 py-3 placeholder:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                aria-label="Password"
              />
            </div>
            {/* Admin realname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Real Name</label>
              <input
                type="text"
                value={form.adminrealname}
                onChange={(e) => setForm({ ...form, adminrealname: e.target.value })}
                placeholder="Enter real name here"
                className="w-full bg-white border border-gray-200 text-black rounded-md px-4 py-3 placeholder:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                aria-label="Real Name"
              />
            </div>
            {/* Admin civilcode*/}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin civilcode</label>
              <input
                type="text"
                value={form.civilcode}
                onChange={(e) => setForm({ ...form, civilcode: e.target.value })}
                placeholder="Enter admin civilcode here"
                className="w-full bg-white border border-gray-200 text-black rounded-md px-4 py-3 placeholder:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                aria-label="Civilcode"
              />
            </div>
            {/* Admin usercode */}
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
                      setForm({ id: null, username: "", password: "", adminrealname: "", civilcode: "" });
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
      
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 leading-tight">Danh sách tài khoản</h1>
      </header>

      {/* Table card */}
      <section>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">ID</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">AdminCode</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Password</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">AdminName</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Civilcode</th>
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
                    <td className="px-6 py-4 align-middle text-sm text-gray-800 font-medium">{cat.username}</td>
                    <td className="px-6 py-4 align-middle text-sm text-gray-800 font-medium">{cat.password}</td>
                    <td className="px-6 py-4 align-middle text-sm text-gray-800 font-medium">{cat.adminrealname}</td>
                    <td className="px-6 py-4 align-middle text-sm text-gray-800 font-medium">{cat.civilcode}</td>
                    <td className="px-6 py-4 align-middle text-sm text-center">
                      <div className="inline-flex gap-3 items-center">
                        <button
                          onClick={() => handleEdit(cat)}
                          title="Chỉnh sửa"
                          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                          aria-label={`Chỉnh sửa ${cat.name}`}
                        >
                          <Pencil size={20} className="text-blue-800" />
                        </button>

                        <button
                          onClick={() => handleDelete(cat.id)}
                          title="Xóa"
                          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-red-50 transition"
                          aria-label={`Xóa ${cat.name}`}
                        >
                          <Trash2 size={50} className="text-red-800" />
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

export default Admins;