import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Home, Package, Users, Shield, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

// Sidebar Component
const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/" },
    { name: "Danh mục", icon: <Package size={18} />, path: "/categories" },
    { name: "Sản phẩm", icon: <Package size={18} />, path: "/products" },
    { name: "Người dùng", icon: <Users size={18} />, path: "/users" },
    { name: "Quản trị viên", icon: <Shield size={18} />, path: "/admins" },
    { name: "Cài đặt", icon: <Settings size={18} />, path: "/settings" },
  ];

  return (
    <div className="bg-white border-r border-gray-200 h-screen w-64 p-6 hidden md:flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold text-blue-600 mb-10">TechStore Admin</h1>
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
      <Button variant="outline" className="flex items-center gap-2 text-gray-600 hover:text-red-500">
        <LogOut size={16} /> Đăng xuất
      </Button>
    </div>
  );
};

// Navbar Component
const Navbar = () => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="md:hidden">
          <Menu size={20} />
        </Button>
        <h2 className="text-xl font-semibold text-gray-700">Bảng điều khiển</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">Xin chào, <b>Admin</b></span>
        <img src="https://i.pravatar.cc/40" alt="avatar" className="w-10 h-10 rounded-full border" />
      </div>
    </div>
  );
};

// Dashboard Page Component
const DashboardPage = () => {
  const stats = [
    { title: "Tổng sản phẩm", value: 124, icon: <Package size={24} /> },
    { title: "Người dùng", value: 98, icon: <Users size={24} /> },
    { title: "Đơn hàng", value: 56, icon: <Home size={24} /> },
    { title: "Doanh thu", value: "$12,430", icon: <Shield size={24} /> },
  ];

  return (
    <motion.div
      className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-md rounded-2xl hover:shadow-lg transition">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h4 className="text-gray-500 text-sm mb-1">{stat.title}</h4>
              <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
            </div>
            <div className="text-blue-500 bg-blue-50 p-3 rounded-full">{stat.icon}</div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
};

// Layout Wrapper
const AdminLayout = () => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <DashboardPage />
        </main>
      </div>
    </div>
  );
};

// Root App
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AdminLayout />} />
      </Routes>
    </Router>
  );
}

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Users from "./pages/Users";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
