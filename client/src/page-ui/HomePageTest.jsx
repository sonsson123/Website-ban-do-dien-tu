import React from "react";
import "./HomePageTest.css";
import { Link, useNavigate } from "react-router-dom";

const categories = [
  { name: "Máy tính", img: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png" },
  { name: "Điện thoại", img: "https://cdn-icons-png.flaticon.com/512/888/888857.png" },
  { name: "Tai nghe", img: "https://cdn-icons-png.flaticon.com/512/727/727240.png" },
  { name: "Máy ảnh", img: "https://cdn-icons-png.flaticon.com/512/2920/2920222.png" },
  { name: "Đồng hồ", img: "https://cdn-icons-png.flaticon.com/512/2948/2948005.png" },
  { name: "Phụ kiện", img: "https://cdn-icons-png.flaticon.com/512/869/869869.png" },
  { name: "Tablet", img: "https://cdn-icons-png.flaticon.com/512/2210/2210175.png" },
  { name: "Smartwatch", img: "https://cdn-icons-png.flaticon.com/512/3448/3448599.png" },
  { name: "Loa Bluetooth", img: "https://cdn-icons-png.flaticon.com/512/4059/4059389.png" },
  { name: "Máy chiếu", img: "https://cdn-icons-png.flaticon.com/512/2972/2972189.png" },
];

export default function HomePageTest() {
  const navigate = useNavigate();

  const bestSeller = [
    {
      name: "iPhone 17 Pro Max",
      price: "45.990.000đ",
      img: "https://cdn-media.sforum.vn/storage/app/media/doanphuong/anh-iphone-17/anh-iphone-17-th.jpg",
      link: "/product/iphone17",
    },
  ];


  const handleCategoryClick = (categoryName) => {
    if (categoryName === "Máy tính") {
      navigate("/products/may-tinh");
    } 
    else if 
      (categoryName === "Điện thoại") {
      navigate("/products/dien-thoai");}
      else if (categoryName === "Tai nghe") {
      navigate("/products/tai-nghe");}
      else if (categoryName === "Máy ảnh") {
      navigate("/products/may-anh");} 
      else if (categoryName === "Đồng hồ") {
      navigate("/products/dong-ho");}
      else if (categoryName === "Phụ kiện") {
      navigate("/products/phu-kien");}
      else if (categoryName === "Tablet") {
      navigate("/products/tablet");}
      else if (categoryName === "Smartwatch") {
      navigate("/products/smartwatch");}
      else if (categoryName === "Loa Bluetooth") {
      navigate("/products/loa-bluetooth");}
      else if (categoryName === "Máy chiếu") {
      navigate("/products/may-chieu");}
    else {
      alert(`Danh mục "${categoryName}" hiện chưa có sản phẩm!`);
    }
  };

  return (
    <div className="home-container">
      {/* Thanh tìm kiếm */}
      <div className="search-bar">
        <input type="text" placeholder="Nhập tên sản phẩm..." />
        <select>
          <option>Tất cả danh mục</option>
        </select>
        <button className="search-btn">Tìm Kiếm</button>
      </div>

      {/* Danh mục sản phẩm */}
      <div className="categories-section">
        {categories.map((cat, i) => (
          <div
            className="category-item"
            key={i}
            onClick={() => handleCategoryClick(cat.name)} 
            style={{ cursor: "pointer" }}
          >
            <img src={cat.img} alt={cat.name} />
            <p>{cat.name}</p>
          </div>
        ))}
      </div>

      {/* Bán chạy */}
      <div className="section">
        <h3>Bán chạy</h3>
        <div className="carousel">
          {bestSeller.map((p, i) => (
            <Link to={p.link} key={i} className="product-card">
              <img src={p.img} alt={p.name} className="product-image" />
              <div className="product-text">
                <p>
                  <strong>{p.name}</strong>
                </p>
                <p style={{ color: "#007bff", fontWeight: "bold" }}>{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Sản phẩm mới */}
      <div className="section">
        <h3>Sản phẩm mới</h3>
        <div className="carousel">
          {[...Array(7)].map((_, i) => (
            <div className="product-card" key={i}>
              <div className="product-image"></div>
              <div className="product-text"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
