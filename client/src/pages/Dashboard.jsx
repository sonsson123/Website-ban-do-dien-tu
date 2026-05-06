import React, { useState, useEffect } from "react";
import { Home, Package, Users, Shield, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { motion } from "framer-motion";
import { adminService } from "../services";

// Dashboard Page Component
const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStats();
      if (response.success) {
        // Map data từ API response
        const data = response.data;
        setStats({
          totalProducts: data.summary?.totalProducts || 0,
          totalUsers: data.summary?.totalUsers || 0,
          totalOrders: data.orders?.total || data.summary?.totalOrders || 0,
          totalRevenue: data.revenue?.total || 0,
          ordersByStatus: data.orders?.byStatus || null
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const statsData = [
    { 
      title: "Tổng sản phẩm", 
      value: stats?.totalProducts || 0, 
      icon: <Package size={24} />,
      color: "blue"
    },
    { 
      title: "Người dùng", 
      value: stats?.totalUsers || 0, 
      icon: <Users size={24} />,
      color: "green"
    },
    { 
      title: "Đơn hàng", 
      value: stats?.totalOrders || 0, 
      icon: <ShoppingCart size={24} />,
      color: "purple"
    },
    { 
      title: "Doanh thu", 
      value: formatCurrency(stats?.totalRevenue || 0), 
      icon: <DollarSign size={24} />,
      color: "orange"
    },
  ];

  const colorClasses = {
    blue: "text-blue-500 bg-blue-50",
    green: "text-green-500 bg-green-50",
    purple: "text-purple-500 bg-purple-50",
    orange: "text-orange-500 bg-orange-50"
  };

  return (
    <div className="p-8">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {statsData.map((stat, index) => (
          <Card key={index} className="shadow-md rounded-2xl hover:shadow-lg transition">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h4 className="text-gray-500 text-sm mb-1">{stat.title}</h4>
                <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${colorClasses[stat.color]} p-3 rounded-full`}>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Additional stats if available */}
      {stats?.ordersByStatus && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-md rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Đơn hàng theo trạng thái</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{stats.ordersByStatus.pending || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Chờ xử lý</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.ordersByStatus.processing || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Đang xử lý</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.ordersByStatus.completed || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Hoàn thành</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{stats.ordersByStatus.cancelled || 0}</p>
                  <p className="text-sm text-gray-600 mt-1">Đã hủy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;