import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash } from "lucide-react";
import CartStatus from "../components/CartStatus";
import CartDetail from "../components/CartDetail";

const sampleOrders = [
  {
    id: 101,
    user: {
      username: "nguyenvana",
      fullname: "Nguyễn Văn A",
      email: "a@gmail.com",
      phone: "0987654321",
    },
    createdAt: "2025-01-11",
    total: 1250000,
    status: "Đang chờ xử lý",
    items: [
      { id: 1, name: "Sản phẩm 1", price: 250000, quantity: 2, image: "/img/p1.png" },
      { id: 2, name: "Sản phẩm 2", price: 250000, quantity: 1, image: "/img/p2.png" },
    ],
    shipping: {
      receiver: "Nguyễn Văn A",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      method: "Giao hàng nhanh",
      note: "",
    },
    payment: { method: "Momo", transactionId: "123123123", status: "Đã thanh toán" },
  },
  // Thêm các đơn hàng mẫu khác nếu muốn
];

const statusColors = {
  "Đang chờ xử lý": "bg-gray-200 text-gray-800",
  "Đang giao hàng": "bg-blue-200 text-blue-800",
  "Đã giao xong": "bg-green-200 text-green-800",
  "Đã hủy": "bg-red-200 text-red-800",
};

const Carts = () => {
  const [orders, setOrders] = useState(sampleOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
    setIsModalOpen(false);
  };

  const handleDelete = (order) => {
    if (order.status !== "Đã hủy") {
      alert("Chỉ có thể xóa đơn hàng đã hủy!");
      return;
    }
    setOrders(prev => prev.filter(o => o.id !== order.id));
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Danh sách đơn hàng</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-black text-center border-b">STT</th>
              <th className="p-3 text-black text-center  border-b">ID</th>
              <th className="p-3 text-black text-center  border-b">User</th>
              <th className="p-3 text-black text-center  border-b">Ngày đặt</th>
              <th className="p-3 text-black text-center  border-b">Tổng tiền</th>
              <th className="p-3 text-black text-center  border-b">Trạng thái</th>
              <th className="p-3 text-black text-center  border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-3 text-black text-center  border-b text-center">{idx + 1}</td>
                <td className="p-3 text-black text-center  border-b text-center">{order.id}</td>
                <td className="p-3 text-black text-center  border-b">{order.user.fullname}</td>
                <td className="p-3 text-black text-center  border-b text-center">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="p-3 text-black text-center  border-b text-right">{order.total.toLocaleString()} VND</td>
                <td className="p-3 text-black text-center  border-b text-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3 border-b text-center space-x-2">
                  <Link className="p-2 hover:bg-gray-100 rounded-full" to={`/carts/${order.id}`}>
                    <Eye size={26} className="text-blue-800" />
                  </Link>
                  <button className="p-2 hover:bg-gray-100 rounded-full"  onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}>
                    <Pencil size={26} className="text-blue-800" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full"  onClick={() => handleDelete(order)}>
                    <Trash size={26} className="text-red-800" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedOrder && (
        <CartStatus
          order={selectedOrder}
          onUpdate={handleUpdateStatus}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Carts;
