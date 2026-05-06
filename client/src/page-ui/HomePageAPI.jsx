import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Star, Package, TrendingUp, Zap, Phone, Mail, MapPin, Facebook, Youtube, MessageCircle } from "lucide-react";
import CustomerNavbar from "../components/CustomerNavbar";
import { productService, categoryService, cartService } from "../services";
import { emitCartUpdated } from "../utils/cartEvents";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getProducts({ limit: 8 }),
        categoryService.getCategories()
      ]);

      if (productsRes.success) {
        setFeaturedProducts(productsRes.data.products);
      }

      if (categoriesRes.success) {
        setCategories(categoriesRes.data.categories.slice(0, 8));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price * (1 - discount / 100);
  };

  const renderStars = (rating) => {
    const rounded = Math.round(rating || 0);
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={
              star <= rounded
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    if (product.stock === 0) {
      alert("Sản phẩm đã hết hàng!");
      return;
    }

    setAddingToCart(product._id);
    try {
      const response = await cartService.addItem(product._id, 1);
      if (response.success) {
        const totalItems = response.data?.cart?.totalItems ??
          response.data?.cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ??
          0;
        emitCartUpdated(totalItems);
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
      }
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white bg-gradient-to-r from-[#1d4ed8] via-[#5b21b6] to-[#a855f7]">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.25), transparent 45%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.2), transparent 40%)'
          }}
        />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '70px 70px'
          }}
        />
        <div className="absolute -right-32 top-10 w-80 h-80 bg-pink-400/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -left-24 bottom-0 w-72 h-72 bg-cyan-400/40 rounded-full blur-[140px] animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute right-1/3 -bottom-16 w-44 h-44 border border-white/30 rounded-full opacity-30 animate-spin-slow" />

        <div className="container relative mx-auto px-4 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto md:mx-0 text-center md:text-left animate-fade-in">
            <p className="uppercase tracking-[0.4em] text-sm text-blue-100/90 mb-6">
              Tech Store
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Chào mừng đến với<br />Tech Store
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Sản phẩm công nghệ chính hãng • Giá tốt nhất • Giao hàng nhanh
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                <ShoppingCart size={20} />
                Mua sắm ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Package, label: "Sản phẩm", value: "28+" },
              { icon: TrendingUp, label: "Đơn hàng", value: "100+" },
              { icon: Heart, label: "Khách hàng", value: "50+" },
              { icon: Zap, label: "Giao nhanh", value: "24h" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <stat.icon className="w-10 h-10 mx-auto text-blue-600 mb-3" />
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {!loading && categories.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center">
            Danh mục sản phẩm
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat.slug}`}
                className="group bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden border border-gray-100 bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/120x120/3b82f6/ffffff?text=Category";
                      }}
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-blue-600">
                      {cat.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.description || 'Khám phá ngay'}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-gray-600 text-lg">
              Những sản phẩm công nghệ hot nhất hiện nay
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 group"
                >
                  <Link to={`/product/${product.slug}`} className="block relative">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images[0] || "https://placehold.co/600x400/3b82f6/ffffff?text=Product"}
                        alt={product.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/600x400/3b82f6/ffffff?text=Product+Image";
                        }}
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          -{product.discount}%
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(product.averageRating ?? product.ratingsAverage ?? 0)}
                      {(product.numReviews ?? product.ratingsQuantity ?? 0) > 0 ? (
                        <span className="text-xs text-gray-500">
                          {Number(product.averageRating ?? product.ratingsAverage ?? 0).toFixed(1)} ({product.numReviews ?? product.ratingsQuantity ?? 0})
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Chưa có đánh giá</span>
                      )}
                    </div>

                    <div className="flex items-end justify-between mb-3">
                      <div>
                        {product.discount > 0 ? (
                          <>
                            <p className="text-lg font-bold text-blue-600">
                              {formatPrice(calculateDiscountedPrice(product.price, product.discount))}
                            </p>
                            <p className="text-sm text-gray-400 line-through">
                              {formatPrice(product.price)}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-blue-600">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>

                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={addingToCart === product._id || product.stock === 0}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-110 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        title={product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                      >
                        {addingToCart === product._id ? (
                          <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ShoppingCart size={18} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{product.brand}</span>
                      <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Xem tất cả sản phẩm →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Giao hàng nhanh",
              description: "Giao hàng trong 24h tại Hà Nội",
              icon: ""
            },
            {
              title: "Bảo hành chính hãng",
              description: "Cam kết sản phẩm chính hãng 100%",
              icon: ""
            },
            {
              title: "Hỗ trợ 24/7",
              description: "Đội ngũ tư vấn nhiệt tình",
              icon: ""
            }
          ].map((feature, idx) => (
            <div key={idx} className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section - Chỉ hiển thị khi chưa đăng nhập */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bạn đã sẵn sàng mua sắm?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Khám phá hàng ngàn sản phẩm công nghệ với giá tốt nhất
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Đăng ký ngay - Miễn phí
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Về chúng tôi */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Tech Store</h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                Hệ thống bán lẻ sản phẩm công nghệ chính hãng hàng đầu Việt Nam. 
                Chuyên cung cấp điện thoại, laptop, tablet, phụ kiện và thiết bị điện tử từ các thương hiệu lớn: Apple, Samsung, Dell, HP, Asus, Lenovo...
              </p>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                  <Facebook size={20} className="text-white" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition">
                  <Youtube size={20} className="text-white" />
                </a>
                <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                  <MessageCircle size={20} className="text-white" />
                </a>
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Liên hệ</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Hehe</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-blue-500 flex-shrink-0" />
                  <span>Hotline: 1900 1234 56</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-blue-500 flex-shrink-0" />
                  <span>support@techstore-it4409.vn</span>
                </li>
              </ul>
            </div>

            {/* Chính sách */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Chính sách</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition">Chính sách bảo hành</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Chính sách đổi trả</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Chính sách vận chuyển</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Hướng dẫn mua hàng</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Hướng dẫn thanh toán</a></li>
              </ul>
            </div>

            {/* Hỗ trợ khách hàng */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Hỗ trợ khách hàng</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition">Trung tâm hỗ trợ</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Tra cứu đơn hàng</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Tra cứu bảo hành</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Hệ thống showroom</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Đối tác kinh doanh</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Tuyển dụng</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 mt-10 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                © 2026 Tech Store. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-6 object-contain" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" className="h-6 object-contain" />
                <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="h-6 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
