import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package, Eye, X, Calendar, MapPin, CreditCard, ArrowLeft, RefreshCw, XCircle, Clock, Truck, CheckCircle } from "lucide-react";
import CustomerNavbar from "../components/CustomerNavbar";
import { orderService, cartService } from "../services";
import { useAuth } from "../contexts/AuthContext";

const OrderHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  
  // Modal states
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [isAuthenticated, currentPage, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: filterStatus !== "all" ? filterStatus : undefined
      };

      const response = await orderService.getMyOrders(params);
      
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

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn!");
      return;
    }

    setCancelling(true);
    try {
      const response = await orderService.cancelOrder(selectedOrder._id, cancelReason);
      
      if (response.success) {
        alert("Đã hủy đơn hàng thành công!");
        setIsDetailVisible(false);
        setCancelReason("");
        fetchOrders();
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async (order) => {
    if (!window.confirm("Thêm tất cả sản phẩm từ đơn hàng này vào giỏ hàng?")) {
      return;
    }

    try {
      // Add each item from order to cart
      let successCount = 0;
      let failedCount = 0;
      
      for (const item of order.items) {
        try {
          // Only add if product still exists and has ID
          if (item.product && item.product._id) {
            await cartService.addItem(item.product._id, item.quantity);
            successCount++;
          } else {
            failedCount++;
          }
        } catch (err) {
          console.error(`Failed to add ${item.productName}:`, err);
          failedCount++;
        }
      }

      if (successCount > 0) {
        alert(` Đã thêm ${successCount} sản phẩm vào giỏ hàng!${failedCount > 0 ? `\n⚠️ ${failedCount} sản phẩm không thể thêm (có thể đã hết hàng).` : ''}`);
        navigate("/cart");
      } else {
        alert("❌ Không thể thêm sản phẩm nào. Có thể các sản phẩm đã ngừng kinh doanh.");
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Đơn hàng của tôi</h1>

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

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <Package size={64} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng</h2>
              <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào</p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const statusBadge = getStatusBadge(order.orderStatus);
              const paymentBadge = getPaymentStatusBadge(order.paymentStatus);

              return (
                <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Mã đơn hàng</p>
                          <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ngày đặt</p>
                          <p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${paymentBadge.class}`}>
                          {paymentBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4 mb-4">
                      {order.items?.slice(0, 2).map((item, index) => {
                        const product = item.product || {};
                        return (
                          <div key={index} className="flex gap-4">
                            <img
                              src={product.images?.[0] || "https://placehold.co/80x80/3b82f6/ffffff?text=IMG"}
                              alt={item.productName}
                              className="w-20 h-20 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/80x80/3b82f6/ffffff?text=IMG";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 line-clamp-2">{item.productName}</p>
                              <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                            </div>
                          </div>
                        );
                      })}
                      {order.items?.length > 2 && (
                        <p className="text-sm text-gray-500">+{order.items.length - 2} sản phẩm khác</p>
                      )}
                    </div>

                    {/* Total & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="text-2xl font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(order)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Eye size={18} />
                          <span>Chi tiết</span>
                        </button>
                        {order.orderStatus === 'completed' && (
                          <button
                            onClick={() => handleReorder(order)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                          >
                            <RefreshCw size={18} />
                            <span>Đặt lại</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
      </div>

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
              {/* Status */}
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

              {/* Shipping Address */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Địa chỉ giao hàng</h4>
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
                <h4 className="font-semibold text-gray-900 mb-3">Sản phẩm ({selectedOrder.items?.length || 0})</h4>
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
                <h4 className="font-semibold text-gray-900 mb-3">Thanh toán</h4>
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

              {/* Note */}
              {selectedOrder.note && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Ghi chú</h4>
                  <div className="bg-yellow-50 rounded-lg p-4 text-sm text-gray-700">
                    {selectedOrder.note}
                  </div>
                </div>
              )}

              {/* Cancel Order */}
              {selectedOrder.orderStatus === 'pending' && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-3">Hủy đơn hàng</h4>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    placeholder="Nhập lý do hủy đơn..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3 bg-white text-gray-900"
                  />
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {cancelling ? "Đang hủy..." : "Xác nhận hủy đơn"}
                  </button>
                </div>
              )}
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
    </div>
  );
};

export default OrderHistory;
