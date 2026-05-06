import React, { useState, useEffect } from 'react';
import { Eye, Trash, Star, Search, X, TrendingUp, TrendingDown } from 'lucide-react';

// Mock Data
const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    category: 'Điện thoại',
    totalReviews: 234,
    avgRating: 4.8,
    reviews: [
      { id: 1, user: 'Nguyễn Văn A', date: '2024-11-10', rating: 5, content: 'Sản phẩm tuyệt vời, camera chụp ảnh đẹp, pin trâu, đáng đồng tiền bát gạo!' },
      { id: 2, user: 'Trần Thị B', date: '2024-11-09', rating: 5, content: 'Hiệu năng mạnh mẽ, màn hình sắc nét. Rất hài lòng với sản phẩm.' },
      { id: 3, user: 'Lê Văn C', date: '2024-11-08', rating: 4, content: 'Máy tốt nhưng giá hơi cao. Tuy nhiên chất lượng xứng đáng.' },
      { id: 4, user: 'Phạm Thị D', date: '2024-11-07', rating: 5, content: 'Thiết kế sang trọng, cầm nắm chắc chắn. Đáng mua!' },
      { id: 5, user: 'Hoàng Văn E', date: '2024-11-06', rating: 4, content: 'Tốt, nhưng cần thời gian làm quen với iOS nếu chuyển từ Android.' },
    ]
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Điện thoại',
    totalReviews: 189,
    avgRating: 4.6,
    reviews: [
      { id: 6, user: 'Đỗ Văn F', date: '2024-11-11', rating: 5, content: 'S Pen rất tiện dụng, màn hình đẹp lung linh. Recommend!' },
      { id: 7, user: 'Bùi Thị G', date: '2024-11-10', rating: 4, content: 'Máy khỏe, nhưng hơi nặng. Pin dùng được cả ngày.' },
      { id: 8, user: 'Vũ Văn H', date: '2024-11-09', rating: 5, content: 'Camera zoom 100x ấn tượng. Chất lượng hình ảnh tuyệt vời.' },
      { id: 9, user: 'Đinh Thị I', date: '2024-11-08', rating: 4, content: 'Sản phẩm tốt nhưng giá không mềm lắm.' },
      { id: 10, user: 'Cao Văn K', date: '2024-11-07', rating: 5, content: 'Flagship đỉnh cao, xứng đáng với giá tiền!' },
    ]
  },
  {
    id: 3,
    name: 'MacBook Air M3',
    category: 'Laptop',
    totalReviews: 156,
    avgRating: 4.9,
    reviews: [
      { id: 11, user: 'Phan Văn L', date: '2024-11-12', rating: 5, content: 'Mỏng nhẹ, pin khủng, hiệu năng vượt trội. Perfect!' },
      { id: 12, user: 'Ngô Thị M', date: '2024-11-11', rating: 5, content: 'Dùng làm việc cả ngày không lo hết pin. Màn hình đẹp.' },
      { id: 13, user: 'Trương Văn N', date: '2024-11-10', rating: 5, content: 'Chip M3 quá mạnh, render video nhanh hơn máy cũ nhiều.' },
      { id: 14, user: 'Lý Thị O', date: '2024-11-09', rating: 4, content: 'Rất tốt, chỉ tiếc là cổng kết nối ít.' },
    ]
  },
  {
    id: 4,
    name: 'Sony WH-1000XM5',
    category: 'Tai nghe',
    totalReviews: 312,
    avgRating: 4.7,
    reviews: [
      { id: 15, user: 'Đặng Văn P', date: '2024-11-13', rating: 5, content: 'Chống ồn đỉnh cao, âm thanh trong trẻo. Đáng từng xu!' },
      { id: 16, user: 'Hồ Thị Q', date: '2024-11-12', rating: 5, content: 'Đeo cả ngày không mỏi tai. Pin trâu, chất âm chuẩn.' },
      { id: 17, user: 'Mai Văn R', date: '2024-11-11', rating: 4, content: 'Tốt nhưng giá hơi đắt so với mặt bằng chung.' },
      { id: 18, user: 'Võ Thị S', date: '2024-11-10', rating: 5, content: 'Tai nghe tốt nhất từng dùng. ANC hoàn hảo!' },
      { id: 19, user: 'Dương Văn T', date: '2024-11-09', rating: 4, content: 'Chất lượng tuyệt vời, nhưng nên có thêm màu sắc.' },
    ]
  },
  {
    id: 5,
    name: 'iPad Pro M2 11 inch',
    category: 'Máy tính bảng',
    totalReviews: 98,
    avgRating: 4.5,
    reviews: [
      { id: 20, user: 'Lương Văn U', date: '2024-11-11', rating: 5, content: 'Vẽ trên Procreate mượt mà, màn hình 120Hz đẹp xuất sắc.' },
      { id: 21, user: 'Tô Thị V', date: '2024-11-10', rating: 4, content: 'Tốt cho làm việc và giải trí, nhưng giá cao.' },
      { id: 22, user: 'Hà Văn W', date: '2024-11-09', rating: 5, content: 'Hiệu năng mạnh mẽ, thay thế laptop hoàn toàn được.' },
      { id: 23, user: 'Chu Thị X', date: '2024-11-08', rating: 4, content: 'Sản phẩm tốt, Magic Keyboard hơi đắt.' },
    ]
  },
  {
    id: 6,
    name: 'Dell XPS 15',
    category: 'Laptop',
    totalReviews: 127,
    avgRating: 4.3,
    reviews: [
      { id: 24, user: 'Lưu Văn Y', date: '2024-11-12', rating: 4, content: 'Màn hình 4K đẹp, cấu hình mạnh. Hơi nóng khi chơi game.' },
      { id: 25, user: 'Doãn Thị Z', date: '2024-11-11', rating: 5, content: 'Laptop làm việc chuyên nghiệp, đáng tiền!' },
      { id: 26, user: 'Ông Văn A1', date: '2024-11-10', rating: 4, content: 'Thiết kế đẹp, bàn phím gõ êm. Pin hơi yếu.' },
      { id: 27, user: 'Nghiêm Thị B1', date: '2024-11-09', rating: 3, content: 'Tốt nhưng có vài lỗi nhỏ về phần mềm.' },
    ]
  },
];

// ReviewItem Component
const ReviewItem = ({ review, onDelete }) => {
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
        <span className="ml-2 text-sm font-semibold text-gray-700">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-800">{review.user}</h4>
          <p className="text-xs text-gray-500">{review.date}</p>
        </div>
        <button
          onClick={() => onDelete(review.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
      <div className="mb-2">{renderStars(review.rating)}</div>
      <p className="text-gray-700 text-sm leading-relaxed">{review.content}</p>
    </div>
  );
};

// ReviewDetailModal Component
const ReviewDetailModal = ({ product, onClose, onDeleteReview }) => {
  const [selectedRating, setSelectedRating] = useState('all');
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    if (selectedRating === 'all') {
      setFilteredReviews(product.reviews);
    } else {
      setFilteredReviews(
        product.reviews.filter((r) => r.rating === parseInt(selectedRating))
      );
    }
  }, [selectedRating, product.reviews]);

  const handleDeleteClick = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDeleteReview(product.id, reviewToDelete);
    setShowDeleteConfirm(false);
    setReviewToDelete(null);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const ratingFilters = [
    { value: 'all', label: 'Tất cả' },
    { value: '5', label: '5 sao' },
    { value: '4', label: '4 sao' },
    { value: '3', label: '3 sao' },
    { value: '2', label: '2 sao' },
    { value: '1', label: '1 sao' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                <p className="text-blue-100 text-sm">Danh mục: {product.category}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-800 bg-white hover:bg-gray-100 p-2 rounded-lg transition-all duration-200 shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mt-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                {renderStars(product.avgRating)}
                <span className="text-xl font-bold">{product.avgRating}</span>
              </div>
              <div className="text-blue-100">
                <span className="font-semibold">{product.totalReviews}</span> đánh giá
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {ratingFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedRating(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedRating === filter.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Không có đánh giá nào</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-slideUp">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ProductTable Component
const ProductTable = ({ products, onViewDetails }) => {
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 font-semibold text-gray-700">{rating}</span>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="text-left p-4 font-semibold text-gray-700">Tên sản phẩm</th>
            <th className="text-left p-4 font-semibold text-gray-700">Danh mục</th>
            <th className="text-center p-4 font-semibold text-gray-700">Số lượng đánh giá</th>
            <th className="text-left p-4 font-semibold text-gray-700">Số sao TB</th>
            <th className="text-center p-4 font-semibold text-gray-700">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150"
            >
              <td className="p-4 font-medium text-gray-800">{product.name}</td>
              <td className="p-4 text-gray-600">{product.category}</td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {product.totalReviews}
                </span>
              </td>
              <td className="p-4">{renderStars(product.avgRating)}</td>
              <td className="p-4 text-center">
                <button
                  onClick={() => onViewDetails(product)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Reviews Component
const Reviews = () => {
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOrder === 'asc') {
      filtered = [...filtered].sort((a, b) => a.avgRating - b.avgRating);
    } else if (sortOrder === 'desc') {
      filtered = [...filtered].sort((a, b) => b.avgRating - a.avgRating);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, sortOrder, products]);

  const handleDeleteReview = (productId, reviewId) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
          const updatedReviews = product.reviews.filter((r) => r.id !== reviewId);
          const newTotalReviews = updatedReviews.length;
          const newAvgRating =
            newTotalReviews > 0
              ? parseFloat(
                  (
                    updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
                    newTotalReviews
                  ).toFixed(1)
                )
              : 0;

          const updatedProduct = {
            ...product,
            reviews: updatedReviews,
            totalReviews: newTotalReviews,
            avgRating: newAvgRating,
          };

          if (selectedProduct && selectedProduct.id === productId) {
            setSelectedProduct(updatedProduct);
          }

          return updatedProduct;
        }
        return product;
      })
    );
  };

  const toggleSort = () => {
    if (sortOrder === 'none') setSortOrder('asc');
    else if (sortOrder === 'asc') setSortOrder('desc');
    else setSortOrder('none');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quản lý Đánh giá Sản phẩm
          </h1>
          <p className="text-gray-600">Theo dõi và quản lý đánh giá của khách hàng</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort Button */}
            <button
              onClick={toggleSort}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-medium flex items-center gap-2 whitespace-nowrap"
            >
              {sortOrder === 'none' && (
                <>
                  <Star className="w-5 h-5" />
                  Sắp xếp theo sao
                </>
              )}
              {sortOrder === 'asc' && (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Thấp đến cao
                </>
              )}
              {sortOrder === 'desc' && (
                <>
                  <TrendingDown className="w-5 h-5" />
                  Cao đến thấp
                </>
              )}
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredProducts.length > 0 ? (
            <ProductTable
              products={filteredProducts}
              onViewDetails={setSelectedProduct}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Không tìm thấy sản phẩm nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedProduct && (
        <ReviewDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onDeleteReview={handleDeleteReview}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Reviews;