import React, { useState, useEffect } from 'react';
import { Eye, Trash, Star, Search, X, MessageSquare, Filter } from 'lucide-react';
import { productService, reviewService } from '../services';

/**
 * REFACTORED REVIEWS PAGE - Connected to Real API
 * 
 * This replaces the old Reviews.jsx with mock data
 * 
 * Features:
 * - Fetch real products with reviews from API
 * - Admin can view and delete reviews
 * - Filter by product, rating, date
 * - Pagination support
 */

const ReviewsRefactored = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  
  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({ 
        limit: 50,
        sort: '-averageRating' 
      });
      
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReviews = async (productId) => {
    try {
      setLoading(true);
      const response = await reviewService.getProductReviews(productId, {
        page: 1,
        limit: 100,
        sort: '-createdAt'
      });
      
      if (response.success) {
        setReviews(response.data.reviews || []);
        const product = products.find(p => p._id === productId);
        setSelectedProduct(product);
      }
    } catch (err) {
      setError('Không thể tải đánh giá');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      alert('Đã xóa đánh giá thành công!');
      
      // Refresh reviews list
      if (selectedProduct) {
        fetchProductReviews(selectedProduct._id);
      }
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = reviews.filter(review => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-10 lg:p-12">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Quản lý Đánh giá</h1>
        <p className="mt-2 text-gray-600">
          Xem và quản lý đánh giá sản phẩm từ khách hàng.
        </p>
      </header>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>
        
        {selectedProduct && (
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="all">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Sản phẩm ({filteredProducts.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredProducts.map((product) => {
                const ratingValue = product?.averageRating ?? product?.ratingsAverage ?? 0;
                const reviewCount = product?.numReviews ?? product?.ratingsQuantity ?? 0;

                return (
                  <button
                    key={product._id}
                    onClick={() => fetchProductReviews(product._id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                      selectedProduct?._id === product._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={product.images?.[0] || 'https://placehold.co/50x50'}
                        alt={product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm line-clamp-2">
                          {product.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          {renderStars(ratingValue)}
                          <span>{ratingValue ? `${ratingValue.toFixed(1)}/5` : '0/5'}</span>
                          <span>({reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          {!selectedProduct ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chọn sản phẩm
              </h3>
              <p className="text-gray-600">
                Chọn một sản phẩm bên trái để xem đánh giá
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredReviews.length} đánh giá
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setReviews([]);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredReviews.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    Chưa có đánh giá nào
                  </div>
                ) : (
                  filteredReviews.map((review) => (
                    <div key={review._id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            {review.user?.fullName || 'Anonymous'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewReview(review)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Xóa"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Detail Modal */}
      {showReviewModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Chi tiết đánh giá</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Người đánh giá</div>
                <div className="font-medium text-gray-900">
                  {selectedReview.user?.fullName || 'Anonymous'}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedReview.user?.email || ''}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Đánh giá</div>
                {renderStars(selectedReview.rating)}
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Nội dung</div>
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Ngày đánh giá</div>
                <div className="text-gray-700">
                  {new Date(selectedReview.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleDeleteReview(selectedReview._id);
                  setShowReviewModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xóa đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsRefactored;
