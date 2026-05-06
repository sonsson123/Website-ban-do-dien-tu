import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  // Load số lượng giỏ hàng từ localStorage
  useEffect(() => {
    const updateCount = () => {
       const cart = JSON.parse(localStorage.getItem("cart")) || [];
       setCartCount(cart.length);
    };

    updateCount();
    window.addEventListener("cartUpdated", updateCount);

    return () => window.removeEventListener("cartUpdated", updateCount);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">Shop</span>
      </div>

      <div className="navbar-right">
        <Link to="/">Trang chủ</Link>

        <Link to="/cart" className="cart-link">
          Giỏ hàng
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        <Link to="/account">Tài khoản</Link>
      </div>
    </nav>
  );
}
