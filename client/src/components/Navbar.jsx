import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          <img 
            src={`${import.meta.env.BASE_URL}logowebsite.jpg`}
            alt="ZAS Tech Team" 
            className="logo-image"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span>Tech Store</span>
        </Link>
      </div>

      <div className="navbar-right">
        <Link to="/">Trang chủ</Link>
        <Link to="/cart">Giỏ hàng</Link>
        <Link to="/account">Tài khoản</Link>
      </div>
    </nav>
  );
}
