import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cartService } from '../services';
import { subscribeCartUpdated } from '../utils/cartEvents';

/**
 * Customer-facing Navbar with user dropdown
 * Shows login/register buttons for guests
 * Shows user info and dropdown for authenticated users
 */
const CustomerNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Fetch cart count when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setCartItemCount(0);
      return;
    }

    fetchCartCount();
    const unsubscribe = subscribeCartUpdated((totalItems) => {
      setCartItemCount(totalItems);
    });

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [isAuthenticated]);

  const fetchCartCount = async () => {
    try {
      const response = await cartService.getCart();
      if (response.success && response.data.cart?.items) {
        const totalItems = response.data.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemCount(totalItems);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition">
            <img
              src={`${import.meta.env.BASE_URL}logowebsite.jpg`}
              alt="ZAS Tech Team"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="hidden sm:inline">Tech Store</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Trang chủ
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Sản phẩm
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                Đơn hàng
              </Link>
            )}
          </div>

          {/* Right side - Cart & User */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            {isAuthenticated && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 hover:text-blue-600 transition"
                title="Giỏ hàng"
              >
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
                >
                  <img
                    src={user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.fullName || 'User')}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                  />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {user?.fullName || user?.email}
                  </span>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                    ></div>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          Khách hàng
                        </span>
                      </div>

                      {/* Menu Items */}
                      <Link
                        to="/orders"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        <Package size={16} />
                        Đơn hàng của tôi
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        <ShoppingCart size={16} />
                        Giỏ hàng
                      </Link>

                      {/* Admin Link if user is admin */}
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition border-t border-gray-200"
                        >
                          <Store size={16} />
                          Quản trị viên
                        </Link>
                      )}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-200"
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Guest Buttons */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
              >
                Sản phẩm
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
                  >
                    Đơn hàng
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
                  >
                    Giỏ hàng
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default CustomerNavbar;
