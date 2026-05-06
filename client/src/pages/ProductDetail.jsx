import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Star, Package, Truck, Shield, ArrowLeft, Minus, Plus, User, MessageSquare, Send } from "lucide-react";
import CustomerNavbar from "../components/CustomerNavbar";
import { productService, reviewService, cartService } from "../services";
import { emitCartUpdated } from "../utils/cartEvents";
import { useAuth } from "../contexts/AuthContext";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [userReview, setUserReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?._id) {
      fetchReviews();
    }
  }, [product?._id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductBySlug(slug);
      
      if (response.success) {
        setProduct(response.data.product);
        
        // Fetch related products (same category)
        if (response.data.product.category) {
          fetchRelatedProducts(response.data.product.category._id, response.data.product._id);
        }
      }
    } catch (err) {
      setError("Không thể tải thông tin sản phẩm");
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId, excludeId) => {
    try {
      const response = await productService.getProducts({
        category: categoryId,
        limit: 4
      });
      
      if (response.success) {
        const filtered = response.data.products.filter(p => p._id !== excludeId);
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };
 
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await reviewService.getProductReviews(product._id);
      if (response.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!userReview.comment.trim()) {
      alert("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await reviewService.createReview(product._id, {
        rating: userReview.rating,
        comment: userReview.comment
      });
      
      if (response.success) {
        alert("Đánh giá của bạn đã được gửi thành công!");
        setUserReview({ rating: 5, comment: '' });
        fetchReviews();
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, interactive = false, onSelect = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 24 : 16}
            className={`${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition' : ''}`}
            onClick={() => interactive && onSelect && onSelect(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    setAdding(true);
    try {
      const response = await cartService.addItem(product._id, quantity);
      if (response.success) {
        const totalItems = response.data?.cart?.totalItems ??
          response.data?.cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ??
          0;
        emitCartUpdated(totalItems);
        alert("Đã thêm sản phẩm vào giỏ hàng!");
        setQuantity(1);
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price * (1 - discount / 100);
  };

  const averageRating = (() => {
    const productRating = product?.averageRating ?? product?.ratingsAverage;
    if (typeof productRating === "number") {
      return productRating;
    }
    if (reviews.length > 0) {
      const sum = reviews.reduce((total, r) => total + (r.rating || 0), 0);
      return Math.round((sum / reviews.length) * 10) / 10;
    }
    return 0;
  })();

  const ratingsCount = product?.numReviews ?? product?.ratingsQuantity ?? reviews.length;

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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Không tìm thấy sản phẩm</h2>
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          {product.category && (
            <>
              <span>{product.category.name}</span>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage] || "https://placehold.co/600x600/3b82f6/ffffff?text=Product"}
                alt={product.name}
                className="w-full h-96 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/600x600/3b82f6/ffffff?text=Product";
                }}
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/100x100/3b82f6/ffffff?text=IMG";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Brand */}
              {product.brand && (
                <div className="text-sm text-gray-500 mb-2">Thương hiệu: <span className="font-medium text-gray-700">{product.brand}</span></div>
              )}

              {/* Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {renderStars(averageRating)}
                </div>
                {ratingsCount > 0 ? (
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)}/5 ({ratingsCount} đánh giá)
                  </span>
                ) : (
                  <span className="text-sm text-gray-600">Chưa có đánh giá</span>
                )}
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-600">
                  Đã bán: {product.soldCount || product.sold || 0}
                </span>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                {product.discount > 0 ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl font-bold text-blue-600">
                        {formatPrice(calculateDiscountedPrice(product.price, product.discount))}
                      </span>
                      <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">
                        -{product.discount}%
                      </span>
                    </div>
                    <div className="text-lg text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </div>
                  </>
                ) : (
                  <div className="text-4xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <Package size={20} className={product.stock > 0 ? "text-green-500" : "text-red-500"} />
                  <span className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : "Hết hàng"}
                  </span>
                </div>
              </div>

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition bg-white text-gray-700"
                    >
                      <span className="text-black font-bold text-xl">−</span>
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center border border-gray-300 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition bg-white text-gray-700"
                    >
                      <span className="text-black font-bold text-xl">+</span>
                    </button>
                    <span className="text-sm text-gray-500">({product.stock} sản phẩm có sẵn)</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || adding}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={20} />
                  <span>{adding ? "Đang thêm..." : "Thêm vào giỏ"}</span>
                </button>
              </div>

              {/* Benefits */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={18} className="text-blue-600" />
                  <span>Giao hàng toàn quốc - Miễn phí vận chuyển đơn {">"} 500k</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield size={18} className="text-blue-600" />
                  <span>Bảo hành chính hãng - Đổi trả trong 30 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông số kỹ thuật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex py-3 border-b border-gray-200">
                  <span className="w-1/3 font-medium text-gray-700">{key}:</span>
                  <span className="w-2/3 text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Đánh giá sản phẩm ({reviews.length})</h2>
          </div>

          {/* Write Review Form */}
          {isAuthenticated && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Viết đánh giá của bạn</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá sao</label>
                  {renderStars(userReview.rating, true, (star) => setUserReview(prev => ({ ...prev, rating: star })))}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung đánh giá</label>
                  <textarea
                    value={userReview.comment}
                    onChange={(e) => setUserReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Send size={16} />
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </form>
            </div>
          )}

          {!isAuthenticated && (
            <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg mb-6">
              <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập</Link> để xem và viết đánh giá.
            </p>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">
                          {review.user?.name || 'Người dùng'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <Link
                  key={item._id}
                  to={`/product/${item.slug}`}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-all transform hover:-translate-y-2 overflow-hidden group"
                >
                  <div className="relative">
                    <img
                      src={item.images[0] || "https://placehold.co/300x300/3b82f6/ffffff?text=Product"}
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/300x300/3b82f6/ffffff?text=Product";
                      }}
                    />
                    {item.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        -{item.discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {item.name}
                    </h3>
                    <div className="flex items-end justify-between">
                      <div>
                        {item.discount > 0 ? (
                          <>
                            <p className="text-lg font-bold text-blue-600">
                              {formatPrice(calculateDiscountedPrice(item.price, item.discount))}
                            </p>
                            <p className="text-sm text-gray-400 line-through">
                              {formatPrice(item.price)}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-blue-600">
                            {formatPrice(item.price)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
