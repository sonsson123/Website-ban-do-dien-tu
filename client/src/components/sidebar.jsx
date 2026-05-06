import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Home, Package, Users, DollarSign, Car, Star } from "lucide-react";
import { Button } from "./ui/Button";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/admin" },
    { name: "Danh mục", icon: <Package size={18} />, path: "/admin/categories" },
    { name: "Sản phẩm", icon: <Package size={18} />, path: "/admin/products" },
    { name: "Người dùng", icon: <Users size={18} />, path: "/admin/users" },
    { name: "Đơn hàng", icon: <Car size={18} />, path: "/admin/orders" },
    { name: "Đánh giá", icon: <Star size={18} />, path: "/admin/reviews" },
    { name: "Thống kê doanh thu", icon: <DollarSign size={18} />, path: "/admin/income" },
  ];

  return (
    <div className="bg-white border-r border-gray-200 h-screen w-64 p-6 hidden md:flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-10 pb-4 border-b-2 border-blue-600">
          <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={`${import.meta.env.BASE_URL}logowebsite.jpg`}
              alt="ZAS Tech Team"
              className="w-full h-full object-cover"
              style={{display: 'block'}}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">ZAS</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
        <ul className="space-y-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="pt-4 border-t border-gray-200">
        <Link
          to="/"
          className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
        >
          <Home size={16} />
          <span className="text-sm">Về trang chủ</span>
        </Link>
      </div>
    </div>
  );
};
export default Sidebar;