import React, { useState } from "react";
import "./CartPage.css";

export default function CartPage() {
  const [cart, setCart] = useState([
    { id: 1, name: "Tai nghe Bluetooth", code: "SP001", price: 250000, quantity: 1 },
    { id: 2, name: "Điện thoại iPhone", code: "SP002", price: 20000000, quantity: 1 },
    { id: 3, name: "Đồng hồ thông minh", code: "SP003", price: 1500000, quantity: 2 },
  ]);

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-container">
      

      {/* Nội dung giỏ hàng */}
      <div className="cart-content">
        <h2>Giỏ hàng của bạn</h2>
        {cart.length === 0 ? (
          <p>Giỏ hàng trống!</p>
        ) : (
          <table className="cart-table">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Mã sản phẩm</th>
                <th>Số lượng</th>
                <th>Giá</th>
                <th>Thành tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.code}</td>
                  <td>
                    <button onClick={() => decreaseQty(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQty(item.id)}>+</button>
                  </td>
                  <td>{item.price.toLocaleString()}₫</td>
                  <td>{(item.price * item.quantity).toLocaleString()}₫</td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Tổng tiền */}
        <div className="cart-summary">
          <p>
            Tổng cộng: <span>{totalPrice.toLocaleString()}₫</span>
          </p>
          <button className="checkout-btn">Thanh toán</button>
        </div>
      </div>
    </div>
  );
}
