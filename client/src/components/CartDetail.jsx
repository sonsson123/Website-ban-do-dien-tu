import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CartDetail = () => {
  const { id } = useParams();
  
  // Note : Fetch Data from localStorage (or API)
  const orders = JSON.parse(localStorage.getItem("ordersData")) || [];
  const order = orders.find(o => o.id === Number(id));

  if (!order) {
    return (
      <div className="p-8 text-black">
        <h2 className="text-xl font-semibold mb-4">Không tìm thấy đơn hàng</h2>
        <Link to="/carts" className="text-blue-600 underline">
          ← Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 text-black">
      <Link
        to="/admin/carts" // note: có thể sửa
        className="flex items-center gap-2 text-blue-600 hover:underline mb-4"
      >
        <ArrowLeft size={20} /> Quay lại
      </Link>

      <h2 className="text-2xl font-semibold mb-6">Chi tiết đơn hàng #{order.id}</h2>

      {/* ====== THÔNG TIN NGƯỜI DÙNG ===== */}
      <div className="bg-white shadow p-4 rounded-lg mb-6 border">
        <h3 className="text-xl font-semibold mb-3">👤 Thông tin khách hàng</h3>
        <p><strong>Họ tên:</strong> {order.user.fullname}</p>
        <p><strong>Email:</strong> {order.user.email}</p>
        <p><strong>Số điện thoại:</strong> {order.user.phone}</p>
      </div>

      {/* ==== DANH SÁCH SẢN PHẨM ===== */}
      <div className="bg-white shadow p-4 rounded-lg mb-6 border">
        <h3 className="text-xl font-semibold mb-3">🛒 Sản phẩm</h3>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Ảnh</th>
              <th className="p-2">Tên SP</th>
              <th className="p-2">Giá</th>
              <th className="p-2">SL</th>
              <th className="p-2">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id} className="border-b">
                <td className="p-2 text-center">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded" />
                </td>
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.price.toLocaleString()} VND</td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-right">
                  {(item.price * item.quantity).toLocaleString()} VND
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== SHIPPING ===== */}
      <div className="bg-white shadow p-4 rounded-lg mb-6 border">
        <h3 className="text-xl font-semibold mb-3">🚚 Thông tin giao hàng</h3>
        <p><strong>Người nhận:</strong> {order.shipping.receiver}</p>
        <p><strong>Địa chỉ:</strong> {order.shipping.address}</p>
        <p><strong>Phương thức:</strong> {order.shipping.method}</p>
        <p><strong>Ghi chú:</strong> {order.shipping.note || "Không có"}</p>
      </div>

      {/* ===== PAYMENT ===== */}
      <div className="bg-white shadow p-4 rounded-lg mb-6 border">
        <h3 className="text-xl font-semibold mb-3">💳 Thanh toán</h3>
        <p><strong>Phương thức:</strong> {order.payment.method}</p>
        <p><strong>Mã giao dịch:</strong> {order.payment.transactionId}</p>
        <p><strong>Trạng thái:</strong> {order.payment.status}</p>
      </div>

      {/* ===== TOTAL ===== */}
      <div className="bg-white shadow p-4 rounded-lg border">
        <h3 className="text-xl font-semibold mb-3">📦 Tổng đơn hàng</h3>
        <p className="text-lg"><strong>Tổng tiền:</strong> {order.total.toLocaleString()} VND</p>
      </div>
    </div>
  );
};

export default CartDetail;
