import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const location = useLocation();

  const [items, setItems] = useState([]); 
  const [buyer, setBuyer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const toNumber = (str) => Number(str.replace(/,/g, ""));

  useEffect(() => {
    // ===============================

    if (location.state && location.state.type === "buyNow") {
      setItems([location.state.product]);
      return;
    }


    // ===============================
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setItems(savedCart);
  }, [location.state]);

  // ================================
  const totalPrice = items.reduce(
    (sum, item) => sum + toNumber(item.price) * item.quantity,
    0
  );

  const handleInput = (e) => {
    setBuyer({ ...buyer, [e.target.name]: e.target.value });
  };

  const handleOrder = () => {
    if (!buyer.name || !buyer.phone || !buyer.address) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    if (items.length === 0) {
      alert("Không có sản phẩm nào để thanh toán!");
      return;
    }

    alert("Đặt hàng thành công!");

    if (!location.state || location.state.type !== "buyNow") {
      localStorage.removeItem("cart");
    }

    window.location.href = "/";
  };

  return (
    <div className="checkout-container">
      <h2>Thanh toán</h2>

      <div className="checkout-content">
        
        {/* ----- THÔNG TIN NGƯỜI NHẬN ----- */}
        <div className="checkout-section">
          <h3>Thông tin người nhận</h3>

          <input
            name="name"
            placeholder="Họ và tên"
            value={buyer.name}
            onChange={handleInput}
          />

          <input
            name="phone"
            placeholder="Số điện thoại"
            value={buyer.phone}
            onChange={handleInput}
          />

          <textarea
            name="address"
            placeholder="Địa chỉ giao hàng"
            value={buyer.address}
            onChange={handleInput}
          />
        </div>

        {/* ----- DANH SÁCH SẢN PHẨM ----- */}
        <div className="checkout-section">
          <h3>Sản phẩm</h3>

          {items.length === 0 ? (
            <p>Không có sản phẩm nào.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="checkout-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
                <div className="item-price">
                  {(toNumber(item.price) * item.quantity).toLocaleString()}₫
                </div>
              </div>
            ))
          )}
        </div>

        {/* ----- PHƯƠNG THỨC THANH TOÁN ----- */}
        <div className="checkout-section">
          <h3>Phương thức thanh toán</h3>

          <label className="radio">
            <input type="radio" name="pay" defaultChecked /> Thanh toán khi nhận hàng
          </label>

          <label className="radio">
            <input type="radio" name="pay" /> Ví MoMo
          </label>

          <label className="radio">
            <input type="radio" name="pay" /> Chuyển khoản ngân hàng
          </label>
        </div>

        {/* ----- TỔNG TIỀN ----- */}
        <div className="checkout-total-box">
          <p>
            Tổng tiền: <span>{totalPrice.toLocaleString()}₫</span>
          </p>
          <button className="order-btn" onClick={handleOrder}>
            Đặt hàng
          </button>
        </div>

      </div>
    </div>
  );
}
