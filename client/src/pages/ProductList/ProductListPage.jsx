import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";   
import "./ProductListPage.css";

const ProductListPage = ({ title, products }) => {
  const [sortedProducts, setSortedProducts] = useState(products);
  const [sortType, setSortType] = useState("asc");
  const parsePrice = (price) => Number(price.replace(/[\.,]/g, ""));

  useEffect(() => {
    let newProducts = [...products];

    if (sortType === "asc") {
      newProducts.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else {
      newProducts.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }

    setSortedProducts(newProducts);
  }, [sortType, products]);

  return (
    <div className="product-list-container">
      <h2 className="page-title">{title}</h2>
      <p className="page-subtitle">
        Khám phá danh sách sản phẩm {title.toLowerCase()} chất lượng nhất!
      </p>

      <div className="filter-sort-bar">
        <button className="filter-btn">Bộ lọc</button>

        <select
          className="sort-select"
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="asc">Giá tăng dần</option>
          <option value="desc">Giá giảm dần</option>
        </select>
      </div>

      <div className="product-grid">
        {sortedProducts.map((product, index) => (
          <Link
            to={`/product/${product.id}`}
            key={index}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="product-card">
              <img src={product.image} alt={product.name} />
              <h4>{product.name}</h4>
              <p className="price">{product.price}₫</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductListPage;
