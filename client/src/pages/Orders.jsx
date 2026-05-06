import React, { useState, useEffect } from "react";
import { Package, Eye, Clock, CheckCircle, XCircle, Truck, AlertCircle, X, User, MapPin, CreditCard, DollarSign } from "lucide-react";
import { orderService } from "../services";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  
  // Modal states
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isStatusUpdateVisible, setIsStatusUpdateVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updateReason, setUpdateReason] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: filterStatus !== "all" ? filterStatus : undefined
      };

      const response = await orderService.getAdminOrders(params);
      
      if (response.success) {
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setIsDetailVisible(true);
  };

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setUpdateReason("");
    setIsStatusUpdateVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    setUpdating(true);
    try {
      const trimmedReason = updateReason?.trim();
      const payloadReason = trimmedReason && trimmedReason.length >= 5 ? trimmedReason : undefined;
      const response = await orderService.updateOrderStatus(
        selectedOrder._id, 
        newStatus, 
        payloadReason
      );
      
      if (response.success) {
        fetchOrders();
        setIsStatusUpdateVisible(false);
        alert("Cập nhật trạng thái đơn hàng thành công!");
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    const labels = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      completed: "Hoàn thành",
      cancelled: "Đã hủy"
    };
    return { class: badges[status] || "bg-gray-100 text-gray-800", label: labels[status] || status };
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800"
    };
    const labels = {
      pending: "Chờ thanh toán",
      completed: "Đã thanh toán",
      failed: "Thất bại"
    };
    return { class: badges[status] || "bg-gray-100 text-gray-800", label: labels[status] || status };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="p-8 md:p-10 lg:p-12">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Quản lý Đơn hàng</h1>
        <p className="mt-2 text-gray-600">Xem và cập nhật trạng thái đơn hàng.</p>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "all", label: "Tất cả", icon: Package },
          { value: "pending", label: "Chờ xử lý", icon: Clock },
          { value: "processing", label: "Đang xử lý", icon: Truck },
          { value: "completed", label: "Hoàn thành", icon: CheckCircle },
          { value: "cancelled", label: "Đã hủy", icon: XCircle }
        ].map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => handleFilterChange(filter.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === filter.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {filter.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusBadge = getStatusBadge(order.orderStatus);
                  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);
                  
                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.user?.fullName || "N/A"}</div>
                        <div className="text-sm text-gray-500">{order.user?.email || ""}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</div>
                        {order.discountAmount > 0 && (
                          <div className="text-xs text-green-600">-{formatPrice(order.discountAmount)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 mb-1">{order.paymentMethod?.toUpperCase() || "N/A"}</div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentBadge.class}`}>
                          {paymentBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(order)}
                            className="text-blue-600 hover:text-blue-900 transition"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(order)}
                            className="text-green-600 hover:text-green-900 transition"
                            title="Cập nhật trạng thái"
                          >
                            <Package size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Trước
          </button>
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Sau
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailVisible && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Chi tiết đơn hàng #{selectedOrder.orderNumber}</h3>
              <button
                onClick={() => setIsDetailVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Trạng thái đơn hàng</div>
                    <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${getStatusBadge(selectedOrder.orderStatus).class}`}>
                      {getStatusBadge(selectedOrder.orderStatus).label}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Thanh toán</div>
                    <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${getPaymentStatusBadge(selectedOrder.paymentStatus).class}`}>
                      {getPaymentStatusBadge(selectedOrder.paymentStatus).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="text-gray-400" size={20} />
                  <h4 className="font-semibold text-gray-900">Thông tin khách hàng</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div><span className="font-medium">Tên:</span> {selectedOrder.user?.fullName || "N/A"}</div>
                  <div><span className="font-medium">Email:</span> {selectedOrder.user?.email || "N/A"}</div>
                  <div><span className="font-medium">Phone:</span> {selectedOrder.user?.phone || "N/A"}</div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="text-gray-400" size={20} />
                  <h4 className="font-semibold text-gray-900">Địa chỉ giao hàng</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.shippingAddress ? (
                    <>
                      <div className="font-medium">{selectedOrder.shippingAddress.fullName}</div>
                      <div className="text-sm text-gray-600">{selectedOrder.shippingAddress.phone}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500">Chưa có địa chỉ</div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="text-gray-400" size={20} />
                  <h4 className="font-semibold text-gray-900">Sản phẩm ({selectedOrder.items?.length || 0})</h4>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">SL</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.product?.images?.[0] && (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.productName}
                                  className="w-12 h-12 rounded object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/100x100/3b82f6/ffffff?text=IMG";
                                  }}
                                />
                              )}
                              <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900">{formatPrice(item.price)}</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="text-gray-400" size={20} />
                  <h4 className="font-semibold text-gray-900">Thanh toán</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatPrice(selectedOrder.subtotal || selectedOrder.totalAmount)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">-{formatPrice(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Phương thức:</span> {selectedOrder.paymentMethod?.toUpperCase() || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.note && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="text-gray-400" size={20} />
                    <h4 className="font-semibold text-gray-900">Ghi chú</h4>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-sm text-gray-700">
                    {selectedOrder.note}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Lịch sử đơn hàng</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <div className="text-sm font-medium">Đơn hàng được tạo</div>
                      <div className="text-xs text-gray-500">{formatDate(selectedOrder.createdAt)}</div>
                    </div>
                  </div>
                  {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Cập nhật gần nhất</div>
                        <div className="text-xs text-gray-500">{formatDate(selectedOrder.updatedAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                onClick={() => setIsDetailVisible(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isStatusUpdateVisible && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Cập nhật trạng thái</h3>
              <button
                onClick={() => setIsStatusUpdateVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn hàng: #{selectedOrder.orderNumber}
                </label>
                <div className="text-sm text-gray-600">
                  Trạng thái hiện tại: <span className={`px-2 py-1 rounded ${getStatusBadge(selectedOrder.orderStatus).class}`}>
                    {getStatusBadge(selectedOrder.orderStatus).label}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái mới <span className="text-red-500">*</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Có thể chuyển sang: Chờ xử lý, Đang xử lý, Hoàn thành, Đã hủy
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do (tùy chọn)
                </label>
                <textarea
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Nhập lý do cập nhật (nếu có)..."
                />
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setIsStatusUpdateVisible(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                disabled={updating}
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating || !newStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
