'use client';

import React, { useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';
import { CheckCircle, XCircle, ArrowLeft, ClipboardCheck } from 'lucide-react';

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const provider = params.get('provider') || 'unknown';
  const success = params.get('success') === 'true';
  const orderId = params.get('orderId');

  const handleBackToOrders = () => {
    navigate('/orders');
  };

  const handleBackToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            {success ? (
              <CheckCircle className="text-green-500" size={72} />
            ) : (
              <XCircle className="text-red-500" size={72} />
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4 text-gray-900">
            {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>

          <p className="text-gray-600 mb-6">
            {success
              ? 'Cảm ơn bạn đã thanh toán qua PayOS. Đơn hàng của bạn đang được xử lý.'
              : 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức khác.'}
          </p>

          <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Chi tiết thanh toán</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Phương thức:</span>
                <span className="font-medium uppercase">{provider}</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span className={`font-semibold ${success ? 'text-green-600' : 'text-red-600'}`}>
                  {success ? 'Thành công' : 'Thất bại'}
                </span>
              </div>
              {orderId && (
                <div className="flex justify-between">
                  <span>Mã đơn hàng:</span>
                  <span className="font-mono">{orderId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBackToOrders}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ClipboardCheck size={18} />
              Xem đơn hàng của tôi
            </button>

            {!success && (
              <button
                onClick={handleBackToCheckout}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                <ArrowLeft size={18} />
                Quay lại thanh toán
              </button>
            )}
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <Link to="/home" className="text-blue-600 hover:underline">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
