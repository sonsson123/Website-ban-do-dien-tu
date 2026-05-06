import React, { useState, useEffect } from "react";
import "./CartPage.css";
import { useNavigate } from "react-router-dom";
import { emitCartUpdated } from "../utils/cartEvents";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const toNumber = (str) => Number(str.replace(/,/g, ""));

  // Load giỏ hàng từ localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    const totalItems = newCart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    emitCartUpdated({ totalItems });
  };

  const increaseQty = (id) => {
    updateCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    updateCart(
      cart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id) => {
    updateCart(cart.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + toNumber(item.price) * item.quantity,
    0
  );

  // =============================
  //  HANDLE THANH TOÁN
  // =============================
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống! Không thể thanh toán.");
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="cart-container">
      <div className="cart-content">
        <h2 className="cart-title">Giỏ hàng của bạn</h2>

        {cart.length === 0 ? (
          <p className="empty-cart">Giỏ hàng trống!</p>
        ) : (
          <table className="cart-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th className="center">Số lượng</th>
                <th>Giá</th>
                <th>Thành tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td className="product-name">{item.name}</td>

                  <td className="quantity-box">
                    <button className="qty-btn" onClick={() => decreaseQty(item.id)}>
                      -
                    </button>
                    <span className="qty-number">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => increaseQty(item.id)}>
                      +
                    </button>
                  </td>

                  <td className="price">
                    {toNumber(item.price).toLocaleString()}₫
                  </td>

                  <td className="subtotal">
                    {(toNumber(item.price) * item.quantity).toLocaleString()}₫
                  </td>

                  <td>
                    <button className="remove-btn" onClick={() => removeItem(item.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="cart-summary">
          <p className="total-text">
            Tổng cộng: <span>{totalPrice.toLocaleString()}₫</span>
          </p>

          {/* NÚT THANH TOÁN */}
          <button className="checkout-btn" onClick={handleCheckout}>
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
