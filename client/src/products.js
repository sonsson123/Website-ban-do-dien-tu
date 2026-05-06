
const products = [
  // ---  may-tinh ---
  {
    id: "1",
    name: "MacBook Air M2",
    price: "27,990,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg"],
    description: "MacBook Air M2 hiệu năng mạnh, siêu mỏng nhẹ, pin 18 giờ.",
    reviews: []
  },
  {
    id: "2",
    name: "Asus Vivobook 15",
    price: "15,990,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg"],
    description: "Laptop Asus Vivobook 15 hiệu năng tốt cho sinh viên và văn phòng.",
    reviews: [
      {
        user: "Lê Minh C",
        rating: 4,
        comment: "Ổn trong tầm giá, gõ phê.",
        date: "01/11/2025",
      }
    ]
  },
  {
    id: "3",
    name: "HP Pavilion 14",
    price: "13,490,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-85.jpg"],
    description: "HP Pavilion 14 — laptop cân bằng hiệu năng/giá, phù hợp học sinh/sinh viên.",
    reviews: []
  },
  {
    id: "4",
    name: "Dell Inspiron 3520",
    price: "16,290,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-86.jpg"],
    description: "Dell Inspiron 3520 — laptop văn phòng bền bỉ.",
    reviews: []
  },

  // --- dien-thoai ---
  {
    id: "5",
    name: "iPhone 15 Pro Max",
    price: "29,990,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg"],
    description: "iPhone 15 Pro Max — camera tốt, hiệu năng cao.",
    reviews: []
  },
  {
    id: "6",
    name: "Samsung S24 Ultra",
    price: "27,490,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg"],
    description: "Samsung S24 Ultra — màn to, camera mạnh.",
    reviews: []
  },
  {
    id: "7",
    name: "Xiaomi 14",
    price: "19,990,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg"],
    description: "Xiaomi 14 — hiệu năng tốt, giá hợp lý.",
    reviews: []
  },
  {
    id: "8",
    name: "Oppo Reno10",
    price: "10,490,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg"],
    description: "Oppo Reno10 — thiết kế đẹp, giá mềm.",
    reviews: []
  },

  // --- tai-nghe ---
  {
    id: "9",
    name: "AirPods Pro 2",
    price: "5,490,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg"],
    description: "AirPods Pro 2 — chống ồn chủ động, âm tốt.",
    reviews: []
  },
  {
    id: "10",
    name: "Sony WH-1000XM5",
    price: "9,490,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg"],
    description: "Sony WH-1000XM5 — tai nghe chụp ồn hàng đầu.",
    reviews: []
  },
  {
    id: "11",
    name: "JBL Tune 720",
    price: "1,590,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg"],
    description: "JBL Tune 720 — tai nghe on-ear giá rẻ.",
    reviews: []
  },
  {
    id: "12",
    name: "Samsung Buds FE",
    price: "1,890,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg"],
    description: "Samsung Buds FE — tai nghe true wireless cơ bản.",
    reviews: []
  },

  // --- may-anh ---
  {
    id: "13",
    name: "Canon EOS R6",
    price: "45,990,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg"],
    description: "Canon EOS R6 — mirrorless mạnh cho cả ảnh và video.",
    reviews: []
  },
  {
    id: "14",
    name: "Sony A7 IV",
    price: "54,990,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg"],
    description: "Sony A7 IV — cảm biến lớn, video tốt.",
    reviews: []
  },
  {
    id: "15",
    name: "Fujifilm X-S20",
    price: "28,490,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-85.jpg"],
    description: "Fujifilm X-S20 — màu film đẹp, cho creator.",
    reviews: []
  },

  // --- dong-ho ---
  {
    id: "16",
    name: "Apple Watch S9",
    price: "10,990,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg"],
    description: "Apple Watch S9 — smartwatch cao cấp của Apple.",
    reviews: []
  },
  {
    id: "17",
    name: "Samsung Watch 6",
    price: "7,490,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg"],
    description: "Samsung Watch 6 — đồng hồ thông minh Android.",
    reviews: []
  },

  // --- phu-kien ---
  {
    id: "18",
    name: "Cáp sạc Anker",
    price: "290,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg"],
    description: "Cáp sạc Anker chất lượng, bền.",
    reviews: []
  },
  {
    id: "19",
    name: "Sạc nhanh 20W",
    price: "350,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg"],
    description: "Sạc nhanh 20W cho điện thoại phổ thông.",
    reviews: []
  },

  // --- tablet ---
  {
    id: "20",
    name: "iPad Pro M2",
    price: "28,990,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg"],
    description: "iPad Pro M2 — tablet mạnh cho sáng tạo và làm việc.",
    reviews: []
  },
  {
    id: "21",
    name: "Xiaomi Pad 6",
    price: "8,990,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg"],
    description: "Xiaomi Pad 6 — tablet giá tốt cho giải trí.",
    reviews: []
  },

  // --- smartwatch (ultra) ---
  {
    id: "22",
    name: "Apple Watch Ultra",
    price: "18,990,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-83.jpg"],
    description: "Apple Watch Ultra — bản siêu bền cho hoạt động ngoài trời.",
    reviews: []
  },

  // --- loa-bluetooth ---
  {
    id: "23",
    name: "JBL Charge 5",
    price: "3,090,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-84.jpg"],
    description: "JBL Charge 5 — loa di động trâu về pin và âm lượng.",
    reviews: []
  },

  // --- may-chieu ---
  {
    id: "24",
    name: "Xiaomi Projector 2 Pro",
    price: "18,990,000",
    images: ["https://cdn-media.sforum.vn/storage/app/media/anh-dep-85.jpg"],
    description: "Xiaomi Projector 2 Pro — máy chiếu nhỏ gọn cho gia đình.",
    reviews: []
  },

  {
  id: "iphone17",
  name: "iPhone 17 Pro Max",
  price: "45,990,000",
  images: ["https://cdn-media.sforum.vn/storage/app/media/doanphuong/anh-iphone-17/anh-iphone-17-th.jpg"],
  description: "iPhone 17 Pro Max — smartphone mới nhất của Apple.",
  reviews: []
}

];


export default products;
  