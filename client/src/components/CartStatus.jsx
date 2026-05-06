import React, { useState, useEffect } from "react";
import { X, Package, User, CheckCircle2 } from "lucide-react";

// Status Options
const statusOptions = [
  "Đang chờ xử lý", 
  "Đang giao hàng", 
  "Đã giao xong", 
  "Đã hủy"
];

const CartStatus = ({ order, onUpdate, onClose }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [isLoading, setIsLoading] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleUpdate = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    onUpdate(order.id, newStatus);
    setIsLoading(false);
  };

  // Click backdrop to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Cập nhật trạng thái
            </h3>
            <p className="text-sm text-gray-500">
              Thay đổi trạng thái xử lý đơn hàng
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* Order Info Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Mã đơn hàng</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                #{order.id}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Khách hàng</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {order.user.fullname}
              </span>
            </div>
          </div>

          {/* Current Status Badge */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm font-semibold text-gray-700">
              Trạng thái hiện tại
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              order.status === "Đã giao xong" 
                ? "bg-green-100 text-green-800 border border-green-200"
                : order.status === "Đang giao hàng"
                ? "bg-blue-100 text-blue-800 border border-blue-200"
                : order.status === "Đã hủy"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
            }`}>
              {order.status === "Đã giao xong" && <CheckCircle2 className="w-3 h-3" />}
              {order.status}
            </span>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trạng thái mới <span className="text-red-600">*</span>
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full h-11 bg-white border-2 border-gray-300 text-gray-900 rounded-lg px-4 text-[15px] font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%22%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-400"
              disabled={isLoading}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Chọn trạng thái mới cho đơn hàng này
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 p-6 pt-4 border-t border-gray-200 bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:bg-white hover:border-gray-400 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleUpdate}
            disabled={isLoading || newStatus === order.status}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Cập nhật
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
export default CartStatus;
