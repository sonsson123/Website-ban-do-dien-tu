import React from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import HomePageTest from "./HomePageTest";
import CartPage from "./CartPage";
import Navbar from "./Navbar";
import AccountPage from "./AccountPage";
import ProductDetailPage from "./ProductDetailPage";
import ProductListPage from "./ProductListPage";
import products from "./products";
import CheckoutPage from "./CheckoutPage";

// --------------------- DỮ LIỆU 10 DANH MỤC ---------------------
const allProducts = {
  "may-tinh": [
    { id: 1,name: "MacBook Air M2", price: "27,990,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg" },
    { id: 2,name: "Asus Vivobook 15", price: "15,990,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg" },
    { id: 3,name: "HP Pavilion 14", price: "13,490,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-85.jpg" },
    { id: 4,name: "Dell Inspiron 3520", price: "16,290,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-86.jpg" },
  ],

  "dien-thoai": [
    { id: 5,name: "iPhone 15 Pro Max", price: "29,990,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg" },
    { id: 6,name: "Samsung S24 Ultra", price: "27,490,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg" },
    { id: 7,name: "Xiaomi 14", price: "19,990,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg" },
    { id: 8,name: "Oppo Reno10", price: "10,490,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg" },
  ],

  "tai-nghe": [
    { id: 9,name: "AirPods Pro 2", price: "5,490,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg" },
    { id: 10,name: "Sony WH-1000XM5", price: "9,490,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg" },
    { id: 11,name: "JBL Tune 720", price: "1,590,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg" },
    { id: 12,name: "Samsung Buds FE", price: "1,890,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg" },
  ],

  "may-anh": [
    { id: 13,name: "Canon EOS R6", price: "45,990,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg" },
    { id: 14,name: "Sony A7 IV", price: "54,990,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg" },
    { id: 15,name: "Fujifilm X-S20", price: "28,490,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-85.jpg" },
  ],

  "dong-ho": [
    { id: 16,name: "Apple Watch S9", price: "10,990,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg" },
    { id: 17,name: "Samsung Watch 6", price: "7,490,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg" },
  ],

  "phu-kien": [
    { id: 18,name: "Cáp sạc Anker", price: "290,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg" },
    { id: 19,name: "Sạc nhanh 20W", price: "350,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg" },
  ],

  "tablet": [
    { id: 20,name: "iPad Pro M2", price: "28,990,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg" },
    { id: 21,name: "Xiaomi Pad 6", price: "8,990,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg" },
  ],

  "smartwatch": [
    { id: 22,name: "Apple Watch Ultra", price: "18,990,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg" },
  ],

  "loa-bluetooth": [
    { id: 23,name: "JBL Charge 5", price: "3,090,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg" },
  ],

  "may-chieu": [
    { id: 24,name: "Xiaomi Projector 2 Pro", price: "18,990,000", image: "https://cdn-media.sforum.vn/storage/app/media/anh-dep-85.jpg" },
  ],
};

function CategoryRouteWrapper() {
  const { category } = useParams();

  const products = allProducts[category] || [];
  const title = category.replaceAll("-", " ");

  return <ProductListPage title={title} products={products} />;
}

// --------------------- APP ---------------------
export default function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePageTest />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/products/:category" element={<CategoryRouteWrapper />} />
        <Route path="/product/:id" element={<ProductDetailPage products={products} />}
        />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </Router>
  );
}
