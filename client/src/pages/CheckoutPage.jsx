import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShoppingCart, MapPin, CreditCard, Package, ArrowLeft, Plus, CheckCircle, Tag } from "lucide-react";
import CustomerNavbar from "../components/CustomerNavbar";
import { cartService, orderService, userService } from "../services";
import { useAuth } from "../contexts/AuthContext";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  // Get coupon from CartPage if passed
  const passedCoupon = location.state?.appliedCoupon;
  const passedDiscount = location.state?.discountAmount || 0;
  
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(passedCoupon);
  const [discountAmount, setDiscountAmount] = useState(passedDiscount);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Add new address modal
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch cart and addresses in parallel
      const [cartRes, addressRes] = await Promise.all([
        cartService.getCart(),
        userService.getAddresses()
      ]);

      if (cartRes.success) {
        setCart(cartRes.data.cart);
        
        // Redirect if cart is empty
        if (!cartRes.data.cart?.items || cartRes.data.cart.items.length === 0) {
          alert("Giỏ hàng trống! Vui lòng thêm sản phẩm.");
          navigate("/cart");
          return;
        }
      }

      if (addressRes.success) {
        const userAddresses = addressRes.data.addresses || [];
        setAddresses(userAddresses);
        
        // Auto-select default address
        const defaultAddr = userAddresses.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else if (userAddresses.length > 0) {
          setSelectedAddressId(userAddresses[0]._id);
        }
      }
    } catch (err) {
      setError("Không thể tải dữ liệu");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const response = await userService.addAddress(newAddress);
      if (response.success) {
        alert("Thêm địa chỉ thành công!");
        setShowAddressForm(false);
        setNewAddress({
          fullName: "",
          phone: "",
          street: "",
          ward: "",
          district: "",
          city: "",
          isDefault: false
        });
        fetchData();
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handlePlaceOrderClick = () => {
    if (!selectedAddressId) {
      alert("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    try {
      const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
      
      const orderData = {
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          street: selectedAddress.street,
          ward: selectedAddress.ward,
          district: selectedAddress.district,
          city: selectedAddress.city
        },
        paymentMethod: paymentMethod,
        note: note.trim(),
        couponCode: appliedCoupon?.code || undefined
      };

      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        const paymentIntent = response.data?.paymentIntent;
        setShowConfirmModal(false);

        if (paymentMethod === 'payos' && paymentIntent?.redirectUrl) {
          alert("Đang chuyển hướng đến PayOS để thanh toán...");
          window.location.href = paymentIntent.redirectUrl;
          return;
        }

        alert(" Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
        navigate("/orders");
      }
    } catch (err) {
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Lấy đơn giá mỗi item từ cart (ưu tiên priceAtAdd do backend tính sẵn)
  const getItemUnitPrice = (item) => {
    const product = item.product || {};

    if (typeof item.priceAtAdd === "number") {
      return item.priceAtAdd;
    }

    const fallback = (product.price || 0) * (1 - (product.discount || 0) / 100);
    return Number.isFinite(fallback) ? fallback : 0;
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      return sum + getItemUnitPrice(item) * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discountAmount);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán đơn hàng</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="text-blue-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Địa chỉ giao hàng</h2>
                </div>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={16} />
                  Thêm địa chỉ
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">Bạn chưa có địa chỉ giao hàng nào</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Thêm địa chỉ mới
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedAddressId === addr._id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          value={addr._id}
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{addr.phone}</p>
                          <p className="text-sm text-gray-600">
                            {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3">
                <label className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </div>
                </label>

                <label className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'payos' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover-border-gray-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="payos"
                      checked={paymentMethod === 'payos'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Thanh toán qua PayOS</p>
                      <p className="text-sm text-gray-600">Thanh toán trực tuyến qua PayOS (mã QR/Bank)</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Note */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ghi chú đơn hàng</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn..."
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Package className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Đơn hàng</h2>
              </div>

              {/* Products */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {cart?.items?.map((item) => {
                  const product = item.product || {};
                  const unitPrice = getItemUnitPrice(item);
                  return (
                    <div key={product._id} className="flex gap-3">
                      <img
                        src={product.images?.[0] || "https://placehold.co/60x60/3b82f6/ffffff?text=IMG"}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/60x60/3b82f6/ffffff?text=IMG";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
                        <p className="text-sm text-gray-600">SL: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(unitPrice * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <div className="flex items-center gap-1">
                      <Tag size={16} />
                      <span>Giảm giá ({appliedCoupon.code}):</span>
                    </div>
                    <span className="font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                <span className="text-2xl font-bold text-blue-600">{formatPrice(calculateTotal())}</span>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrderClick}
                disabled={submitting || !selectedAddressId}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang xử lý..." : "Đặt hàng"}
              </button>

              <p className="mt-4 text-xs text-gray-500 text-center">
                Bằng việc đặt hàng, bạn đồng ý với <a href="#" className="text-blue-600 hover:underline">Điều khoản sử dụng</a> của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Thêm địa chỉ mới</h3>
              <button
                onClick={() => setShowAddressForm(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  placeholder="Số nhà, tên đường..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã</label>
                  <input
                    type="text"
                    value={newAddress.ward}
                    onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                  <input
                    type="text"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
            </form>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowAddressForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleAddAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Thêm địa chỉ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-900">Xác nhận đặt hàng</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Bạn có chắc chắn muốn đặt hàng với thông tin sau không?
              </p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số lượng sản phẩm:</span>
                  <span className="font-medium">{cart?.items?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                </div>
                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span className="font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium uppercase">{paymentMethod}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Lưu ý:</strong> Đơn hàng không thể chỉnh sửa sau khi đặt. Vui lòng kiểm tra kỹ thông tin.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
