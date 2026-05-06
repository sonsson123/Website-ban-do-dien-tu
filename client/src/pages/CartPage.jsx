import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Tag, X, ShoppingBag } from "lucide-react";
import CustomerNavbar from "../components/CustomerNavbar";
import { cartService, couponService } from "../services";
import { emitCartUpdated } from "../utils/cartEvents";
import { useAuth } from "../contexts/AuthContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      
      if (response.success) {
        setCart(response.data.cart);
      }
    } catch (err) {
      setError("Không thể tải giỏ hàng");
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Validate stock before updating
    const item = cart.items.find(i => i.product._id === productId);
    const availableStock = item?.product?.stock || 0;
    
    if (newQuantity > availableStock) {
      alert(`❌ Chỉ còn ${availableStock} sản phẩm trong kho!`);
      return;
    }
    
    setUpdating({ ...updating, [productId]: true });
    try {
      const response = await cartService.updateItem(productId, newQuantity);
      if (response.success) {
        fetchCart();
        emitCartUpdated(response.data?.cart?.totalItems ?? 0);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      alert("Lỗi: " + message);
    } finally {
      setUpdating({ ...updating, [productId]: false });
    }
  };

  const handleRemoveItem = async (productId, productName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${productName}" khỏi giỏ hàng?`)) {
      try {
        const response = await cartService.removeItem(productId);
        if (response.success) {
          fetchCart();
          emitCartUpdated(response.data?.cart?.totalItems ?? 0);
          alert("Đã xóa sản phẩm khỏi giỏ hàng!");
        }
      } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
      try {
        const response = await cartService.clearCart();
        if (response.success) {
          fetchCart();
          emitCartUpdated(0);
          alert("Đã xóa tất cả sản phẩm!");
        }
      } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert("Vui lòng nhập mã giảm giá!");
      return;
    }

    setApplyingCoupon(true);
    try {
      const subtotal = calculateSubtotal();
      const response = await couponService.validateCoupon(couponCode, subtotal);
      
      if (response.success) {
        setAppliedCoupon(response.data.coupon);
        setDiscountAmount(response.data.discountAmount);
        alert(` Áp dụng mã thành công! Giảm ${formatPrice(response.data.discountAmount)}`);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Mã giảm giá không hợp lệ!";
      alert(message);
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
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

    const fallback = product.price * (1 - (product.discount || 0) / 100);
    return Number.isFinite(fallback) ? fallback : 0;
  };

  const calculateItemTotal = (item) => {
    return getItemUnitPrice(item) * item.quantity;
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discountAmount); // Ensure non-negative
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

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {isEmpty ? (
          /* Empty Cart */
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-gray-900">
                      Sản phẩm ({cart.items.length})
                    </h2>
                    {cart.items.length > 0 && (
                      <button
                        onClick={handleClearCart}
                        className="text-sm text-red-600 hover:text-red-800 transition"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => {
                    const product = item.product || {};
                    const isUpdating = updating[product._id];
                    const unitPrice = getItemUnitPrice(item);
                    const itemTotal = calculateItemTotal(item);

                    return (
                      <div key={product._id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex gap-4">
                          {/* Image */}
                          <Link 
                            to={`/product/${product.slug}`}
                            className="flex-shrink-0"
                          >
                            <img
                              src={product.images?.[0] || "https://placehold.co/150x150/3b82f6/ffffff?text=Product"}
                              alt={product.name}
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/150x150/3b82f6/ffffff?text=IMG";
                              }}
                            />
                          </Link>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={`/product/${product.slug}`}
                              className="font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-2 mb-1"
                            >
                              {product.name || "Sản phẩm"}
                            </Link>
                            
                            {product.brand && (
                              <p className="text-sm text-gray-500 mb-2">Thương hiệu: {product.brand}</p>
                            )}

                            {/* Price */}
                            <div className="mb-3">
                              {product.discount > 0 ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-blue-600">
                                    {formatPrice(unitPrice)}
                                  </span>
                                  {typeof product.price === "number" && (
                                    <span className="text-sm text-gray-400 line-through">
                                      {formatPrice(product.price)}
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                                    -{product.discount}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-blue-600">
                                  {formatPrice(unitPrice)}
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || isUpdating}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                                >
                                  <span className="text-black font-bold text-lg">−</span>
                                </button>
                                <span className="w-12 text-center font-medium text-gray-900">
                                  {isUpdating ? "..." : item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                                  disabled={item.quantity >= (product.stock || 999) || isUpdating}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                                >
                                  <span className="text-black font-bold text-lg">+</span>
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveItem(product._id, product.name)}
                                className="text-red-600 hover:text-red-800 transition"
                                title="Xóa"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(itemTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                {/* Coupon */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã giảm giá
                  </label>
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="text-green-600" size={18} />
                          <div>
                            <div className="font-semibold text-green-900">{appliedCoupon.code}</div>
                            <div className="text-sm text-green-700">Giảm {formatPrice(discountAmount)}</div>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-800 text-sm font-medium transition"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Tag className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Nhập mã..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingCoupon ? "..." : "Áp dụng"}
                      </button>
                    </div>
                  )}
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
                      <span>Giảm giá ({appliedCoupon.code}):</span>
                      <span className="font-medium">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(calculateTotal())}</span>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/checkout", { 
                      state: { 
                        appliedCoupon, 
                        discountAmount 
                      } 
                    })}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Tiến hành thanh toán
                  </button>
                  <Link
                    to="/"
                    className="block text-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>

                {/* Note */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Sản phẩm trong giỏ hàng được giữ trong 24 giờ. Vui lòng thanh toán để hoàn tất đơn hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
