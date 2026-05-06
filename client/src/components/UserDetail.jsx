import React from "react";
import { X } from "lucide-react";

// Component hiển thị modal chi tiết User
const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative animate-fadeIn">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Thông tin chi tiết tài khoản
        </h2>

        <div className="space-y-4 text-gray-700 text-base">
          <p><span className="font-semibold">Username:</span> {user.username}</p>
          <p><span className="font-semibold">Password (hash):</span> {user.password}</p>
          <p><span className="font-semibold">Họ và tên:</span> {user.adminrealname}</p>
          <p><span className="font-semibold">Số CCCD:</span> {user.civilcode}</p>
          <p><span className="font-semibold">Số điện thoại:</span> {user.phone || "Chưa cập nhật"}</p>
          <p><span className="font-semibold">Địa chỉ:</span> {user.address || "Chưa cập nhật"}</p>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;

/* Giao diện này cần thêm các thông tin như :
  - Ngày tạo tài khoản
  - Lần mua hàng cuối cùng
  - Tổng số đơn hàng đã mua
  - 1 bảng hiển thị lịch sử mua hàng (nếu có thời gian)
*/
