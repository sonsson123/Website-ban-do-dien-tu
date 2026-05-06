import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";
import "./AccountPage.css";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({
    name: "Nguyễn Văn A",
    dob: "01/01/2000",
    address: "Hà Nội, Việt Nam",
    gender: "Nam",
  });
  const [editField, setEditField] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [editField]: e.target.value,
    });
  };

  const handleSave = () => {
    setEditField(null);
  };

  const handleLogout = () => {

  };

  return (
    <div className="account-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="profile-card">
          <div className="avatar">👤</div>
          <p className="email">example@gmail.com</p>
        </div>

        <ul className="menu">
          <li
            className={activeTab === "info" ? "active" : ""}
            onClick={() => setActiveTab("info")}
          >
            Thông tin cá nhân
          </li>
          <li
            className={activeTab === "password" ? "active" : ""}
            onClick={() => setActiveTab("password")}
          >
            Đổi mật khẩu
          </li>
          <li
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            Lịch sử mua hàng
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <div className="header">
          <h2>Tài khoản của tôi</h2>
          <button className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>

        {activeTab === "info" && (
          <div className="tab-content">
            <h3>Thông tin cá nhân</h3>
            <p>Quản lý thông tin cá nhân của bạn.</p>

            <div className="info-grid">
              {["name", "dob", "address", "gender"].map((field) => (
                <div className="info-box" key={field}>
                  <div className="info-header">
                    <label>
                      {field === "name"
                        ? "Tên"
                        : field === "dob"
                        ? "Ngày sinh"
                        : field === "address"
                        ? "Địa chỉ"
                        : "Giới tính"}
                    </label>
                    <FaEdit
                      className="edit-icon"
                      onClick={() => setEditField(field)}
                    />
                  </div>

                  {editField === field ? (
                    <input
                      type="text"
                      value={formData[field]}
                      onChange={handleChange}
                      onBlur={handleSave}
                      autoFocus
                    />
                  ) : (
                    <p>{formData[field]}</p>
                  )}
                </div>
              ))}
            </div>

            <button className="save-btn" onClick={handleSave}>
              Lưu thay đổi
            </button>
          </div>
        )}

        {activeTab === "password" && (
          <div className="tab-content">
            <h3>Đổi mật khẩu</h3>
            <div className="form-group">
              <label>Mật khẩu hiện tại</label>
              <input type="password" placeholder="Nhập mật khẩu hiện tại" />
            </div>
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input type="password" placeholder="Nhập mật khẩu mới" />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <input type="password" placeholder="Nhập lại mật khẩu mới" />
            </div>
            <button className="save-btn">Lưu mật khẩu</button>
          </div>
        )}

        {activeTab === "history" && (
          <div className="tab-content">
            <h3>Lịch sử mua hàng</h3>
            <p>Bạn chưa có đơn hàng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
