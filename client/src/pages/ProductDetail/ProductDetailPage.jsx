import React, { useState } from "react";
import { useParams } from "react-router-dom";
import productsData from "./products";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = productsData.find((p) => p.id === id);

  const [mainImage, setMainImage] = useState(product ? product.images[0] : "");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState(product ? product.reviews : []);

  if (!product) {
    return <h2 style={{ padding: "50px" }}>Sản phẩm không tồn tại!</h2>;
  }

  // ======= TÍNH ĐIỂM TRUNG BÌNH =======
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        ).toFixed(1)
      : 0;

  const ratingStats = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return {
      star,
      count,
      percent: totalReviews ? (count / totalReviews) * 100 : 0,
    };
  });

  // ======= GỬI REVIEW =======
  const handleSubmit = () => {
    if (rating === 0) {
      alert("Bạn cần chọn số sao!");
      return;
    }
    if (comment.trim() === "") {
      alert("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    const newReview = {
      user: "Người dùng Ẩn danh",
      rating,
      comment,
      date: new Date().toLocaleDateString(),
    };

    setReviews([newReview, ...reviews]);
    setComment("");
    setRating(0);
  };

  return (
    <div className="product-page">
      <div className="product-container">

        {/* LEFT: Ảnh */}
        <div className="product-left">
          <img src={mainImage} alt={product.name} className="product-image" />

          <div className="thumbnail-list">
            {product.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="thumb"
                className={`thumbnail ${mainImage === img ? "active" : ""}`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>

          {/* Rating Summary */}
          <div className="rating-summary">
            <h4>User Rating: {avgRating} / 5 ★</h4>
            <p>From {totalReviews} reviews</p>

            <div className="rating-bars">
              {ratingStats.map((r) => (
                <div className="rating-row" key={r.star}>
                  <span>{r.star}★</span>
                  <div className="bar">
                    <div className="fill" style={{ width: `${r.percent}%` }}></div>
                  </div>
                  <span>{Math.round(r.percent)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Thông tin */}
        <div className="product-right">
          <h2 className="product-name">{product.name}</h2>
          <p className="product-price">{product.price}₫</p>

          <div className="product-actions">
            <button className="buy-btn">Mua ngay</button>
            <button className="cart-btn">Thêm vào giỏ hàng</button>
          </div>

          <div className="product-desc">
            <h3>Thông tin sản phẩm</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      {/* ======= FORM ĐÁNH GIÁ ======= */}
      <div className="review-section">
        <h3>Đánh giá sản phẩm</h3>

        <div className="review-form">
          <p>Chọn số sao:</p>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`star ${rating >= s ? "active" : ""}`}
                onClick={() => setRating(s)}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            placeholder="Nhập nhận xét của bạn..."
          ></textarea>

          <button className="submit-btn" onClick={handleSubmit}>
            Gửi đánh giá
          </button>
        </div>

        {/* DANH SÁCH REVIEW */}
        <div className="review-list">
          {reviews.length === 0 && <p>Chưa có đánh giá nào.</p>}

          {reviews.map((r, i) => (
            <div className="review-item" key={i}>
              <div className="review-header">
                <strong>{r.user}</strong>
                <span className="review-date">{r.date}</span>
              </div>

              <div className="review-stars">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>

              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
