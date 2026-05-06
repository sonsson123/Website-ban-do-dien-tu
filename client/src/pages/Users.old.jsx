{/* 
  trang quản lý user , tại đây admin có thể:
  - xem danh sách user
  - xóa user
  - xem chi tiết thông tin user (khi bấm vào nút xem chi tiết sẽ hiện ra một modal hoặc chuyển trang mới hiển thị các thông tin chi tiết của user đó)
  thông tin về user bao gồm:
    + username : là tên đăng nhập
    + password : là mật khẩu đăng nhập , nhưng sẽ hiển thị dưới dạng mã hóa để bảo mật,
                 mật khẩu lưu trong CSDL cũng là mật khẩu đã mã hóa (hash) chứ không lưu bản gốc
  Khi user đăng ký tài khoản mới , hệ thống sẽ tự động thêm user đó vào CSDL và hiển thị ở trang quản lý này.
  */}



import React, { useState } from "react";
import { Trash2, Eye } from "lucide-react";
import UserDetail from "../components/UserDetail";

const initialData = [
  { id: 1, username: "admin001", password: "1225487", adminrealname: "Nguyen Van A", civilcode: "123456789", phone: "0901234567", address: "Hà Nội" },
  { id: 2, username: "admin002", password: "1422563", adminrealname: "Tran Thi B", civilcode: "987654321", phone: "0939876543", address: "Hồ Chí Minh" },
];

const Users = () => {
  const [users, setUsers] = useState(initialData);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const filtered = users.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    const user = users.find((c) => c.id === id);
    if (!user) return;
    if (window.confirm(`Xóa tài khoản "${user.username}"? Hành động không thể hoàn tác.`)) {
      setUsers((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="p-8 md:p-10 lg:p-12">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 leading-tight">Quản lý tài khoản user</h1>
        <p className="mt-2 text-base text-gray-600 leading-7">
          Theo dõi và quản lý tài khoản user trong hệ thống.
        </p>
      </header>

      {/* Input search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border text-black border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 bg-white"
        />
      </div>

      <section>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 text-center">ID</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 text-center">Username</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 text-center">Password</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 text-center">Ngày đăng ký</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 text-center">Số đơn hàng đã mua</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy tài khoản phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{user.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium text-center">{user.username}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium text-center">{user.password}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">01/01/2024</td> {/* Note : Cần cập nhật thêm */}
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">5</td> {/* Note : Cần cập nhật thêm */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex gap-3 items-center">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <Eye size={20} className="text-blue-800" />
                        </button>

                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <Trash2 size={20} className="text-red-800" />
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

      {/* Modal chi tiết user */}
      {selectedUser && (
        <UserDetail
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default Users;

