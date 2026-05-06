
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { Download, Eye, Trash2 } from 'lucide-react';
import Papa from 'papaparse';
import { orderService, categoryService } from '../services';

const COLOR_PALETTE = [
  '#2563eb',
  '#f97316',
  '#10b981',
  '#f43f5e',
  '#a78bfa',
  '#14b8a6',
  '#f59e0b',
  '#ec4899',
  '#22c55e',
  '#8b5cf6'
];

const mergeCategoryOptions = (currentOptions, names = []) => {
  if (!Array.isArray(names) || names.length === 0) {
    return currentOptions;
  }

  const map = new Map(currentOptions.map(opt => [opt.value, opt]));
  let changed = false;

  names.forEach(name => {
    if (!name) return;
    if (!map.has(name)) {
      map.set(name, { value: name, label: name });
      changed = true;
    }
  });

  if (!changed) {
    return currentOptions;
  }

  return Array.from(map.values());
};

// ------------------------- Helpers -------------------------
const currency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const formatAxisTick = (value) => {
  if (!value) return '0';
  const abs = Math.abs(value);
  const formatUnit = (num, suffix) => {
    const formatted = (num).toFixed(1);
    return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}${suffix}`;
  };

  if (abs >= 1e9) return formatUnit(value / 1e9, 'B');
  if (abs >= 1e6) return formatUnit(value / 1e6, 'M');
  if (abs >= 1e3) return formatUnit(value / 1e3, 'K');
  return value.toLocaleString('en-US');
};

const groupByDate = (orders) => {
  const map = {};
  orders.forEach(o => {
    const d = new Date(o.date);
    const key = d.toISOString().slice(0,10); // YYYY-MM-DD
    map[key] = (map[key] || 0) + o.amount;
  });
  const arr = Object.keys(map).sort().map(k => ({ date: k, revenue: map[k] }));
  return arr;
};

const breakdownByCategory = (orders, colorMap = {}) => {
  const map = {};
  orders.forEach(o => {
    o.items.forEach(it => {
      map[it.category] = (map[it.category] || 0) + it.qty * it.unitPrice;
    });
  });
  return Object.keys(map)
    .map(k => ({
      name: k,
      value: map[k],
      color: colorMap[k]
    }))
    .sort((a, b) => b.value - a.value);
};

// ------------------------- Components -------------------------

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const calcPercentage = (current, previous) => {
  if (!previous) {
    return null;
  }
  return ((current - previous) / previous) * 100;
};

const formatChange = (value) => {
  if (value === null) return '—';
  const rounded = value.toFixed(1);
  return `${value > 0 ? '+' : ''}${rounded}%`;
};

const changeColor = (value) => {
  if (value === null) return 'text-gray-400';
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-400';
};

const RevenueKPI = ({orders}) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = endOfDay(yesterdayStart);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(monthStart.getTime() - 1);

  const sumRevenueBetween = (start, end) =>
    orders
      .filter(o => {
        const date = new Date(o.date);
        return date >= start && date <= end;
      })
      .reduce((sum, order) => sum + order.amount, 0);

  const countOrdersBetween = (start, end) =>
    orders.filter(o => {
      const date = new Date(o.date);
      return date >= start && date <= end;
    }).length;

  const revenueToday = sumRevenueBetween(todayStart, endOfDay(now));
  const revenueYesterday = sumRevenueBetween(yesterdayStart, yesterdayEnd);
  const revenueTodayChange = calcPercentage(revenueToday, revenueYesterday);

  const revenueMonth = sumRevenueBetween(monthStart, now);
  const revenuePrevMonth = sumRevenueBetween(prevMonthStart, prevMonthEnd);
  const revenueMonthChange = calcPercentage(revenueMonth, revenuePrevMonth);

  const ordersThisMonth = countOrdersBetween(monthStart, now);
  const ordersPrevMonth = countOrdersBetween(prevMonthStart, prevMonthEnd);
  const ordersChange = calcPercentage(ordersThisMonth, ordersPrevMonth);

  const ordersCount = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const avgOrder = ordersCount ? Math.round(totalRevenue / ordersCount) : 0;

  const prevAvgOrder =
    ordersPrevMonth ? Math.round(revenuePrevMonth / ordersPrevMonth) : 0;
  const avgChange = calcPercentage(avgOrder, prevAvgOrder);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-500">Revenue Today</div>
            <div className="text-2xl text-black font-semibold">{currency(revenueToday)}</div>
          </div>
          <div className={`${changeColor(revenueTodayChange)} text-sm`}>
            {formatChange(revenueTodayChange)}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">So sánh với hôm trước</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-500">Revenue This Month</div>
            <div className="text-2xl text-black font-semibold">{currency(revenueMonth)}</div>
          </div>
          <div className={`${changeColor(revenueMonthChange)} text-sm`}>
            {formatChange(revenueMonthChange)}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">So sánh với kỳ trước</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-500">Orders</div>
            <div className="text-2xl text-black font-semibold">{ordersThisMonth}</div>
          </div>
          <div className={`${changeColor(ordersChange)} text-sm`}>
            {formatChange(ordersChange)}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">Trong tháng</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-500">Avg Order Value</div>
            <div className="text-2xl text-black font-semibold">{currency(avgOrder)}</div>
          </div>
          <div className={`${changeColor(avgChange)} text-sm`}>
            {formatChange(avgChange)}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">Giá trị trung bình</div>
      </div>
    </div>
  )
}

const CHART_HEIGHT = 320;

const RevenueChart = ({data}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border" style={{ minHeight: CHART_HEIGHT }}>
      <h3 className="text-lg text-black font-semibold mb-2">Doanh thu theo ngày</h3>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT - 80}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatAxisTick} />
          <Tooltip formatter={(v)=>currency(v)} />
          <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const formatNumber = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value || 0));

const RevenueBreakdown = ({data, colorMap = {}}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const getColor = (name, index) => colorMap[name] || COLOR_PALETTE[index % COLOR_PALETTE.length];
  const defaultData = data[0] || { name: '—', value: 0 };
  const activeData =
    Number.isInteger(activeIndex) && data[activeIndex]
      ? data[activeIndex]
      : defaultData;

  const handleSliceEnter = (_, index) => setActiveIndex(index);
  const handleSliceLeave = () => setActiveIndex(null);

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0];
      return (
        <div className="bg-white shadow-lg border border-gray-200 px-3 py-2 rounded text-sm">
          <div className="font-semibold text-gray-900">{dataPoint.name}</div>
          <div className="text-blue-600 font-bold">{formatNumber(dataPoint.value)} VND</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border" style={{ minHeight: CHART_HEIGHT }}>
      <h3 className="text-lg text-black font-semibold mb-2">Phân bổ theo danh mục</h3>
      <div
        className="relative"
        style={{ height: CHART_HEIGHT - 60 }}
        onMouseLeave={handleSliceLeave}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <Tooltip content={customTooltip} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              innerRadius={55}
              paddingAngle={2}
              activeIndex={Number.isInteger(activeIndex) ? activeIndex : -1}
              activeShape={(props) => (
                <Sector {...props} outerRadius={props.outerRadius + 8} />
              )}
              onMouseEnter={handleSliceEnter}
              onMouseLeave={handleSliceLeave}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={getColor(entry.name, index)}
                  opacity={activeIndex === index ? 1 : 0.55}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {data.length > 0 && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200 ${
              Number.isInteger(activeIndex) ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="text-sm text-gray-500">Danh mục</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {activeData.name}
            </div>
            <div className="text-base font-bold text-blue-600">
              {formatNumber(activeData.value)} đ
            </div>
          </div>
        )}
      </div>
      {data.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3 text-sm border-t pt-3">
          {data.map((entry, index) => (
            <div key={`legend-${entry.name}`} className="flex items-center gap-2 text-gray-700">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: getColor(entry.name, index) }}
              ></span>
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const RevenueFilters = ({from, to, setFrom, setTo, categoryOptions, channelOptions, filters, setFilters, onExportCSV}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-col md:flex-row gap-3 items-center">
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600 mr-2">Date</div>
        <DatePicker selected={from} onChange={(d)=>setFrom(d)} selectsStart startDate={from} endDate={to} className="border px-2 py-1 rounded" />
        <span className="px-2">—</span>
        <DatePicker selected={to} onChange={(d)=>setTo(d)} selectsEnd startDate={from} endDate={to} className="border px-2 py-1 rounded" />
      </div>

      <select className="border rounded px-2 py-1" value={filters.category} onChange={(e)=>setFilters(f=>({...f, category: e.target.value}))}>
        <option value="">All Categories</option>
        {categoryOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select className="border rounded px-2 py-1" value={filters.channel} onChange={(e)=>setFilters(f=>({...f, channel: e.target.value}))}>
        <option value="">All Channels</option>
        {channelOptions.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <input placeholder="Search order id / customer" className="border rounded px-2 py-1 flex-1" value={filters.q} onChange={(e)=>setFilters(f=>({...f, q: e.target.value}))} />

      <button onClick={onExportCSV} className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2"><Download size={16}/> Export CSV</button>
    </div>
  )
}

const RevenueTable = ({orders, onView, onDelete}) => {
  const [sortBy, setSortBy] = useState({key: 'date', dir: 'desc'});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const sorted = useMemo(()=>{
    const arr = [...orders];
    arr.sort((a,b)=>{
      if(sortBy.key==='amount') return sortBy.dir==='asc'? a.amount - b.amount : b.amount - a.amount;
      if(sortBy.key==='date') return sortBy.dir==='asc'? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
      return 0;
    })
    return arr;
  },[orders, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const pageData = sorted.slice((page-1)*perPage, page*perPage);

  useEffect(()=>{ setPage(1); }, [orders, perPage]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg text-black font-semibold">Orders</h3>
        <div className="flex bg-white text-blue items-center gap-2">
          <select value={perPage} onChange={(e)=>setPerPage(Number(e.target.value))} className="border rounded px-2 py-1">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="text-left text-sm text-gray-600 border-b">
            <tr>
              <th className="py-2 px-3">Order ID</th>
              <th className="py-2 px-3">Customer</th>
              <th className="py-2 px-3 cursor-pointer" onClick={()=>setSortBy({key:'date', dir: sortBy.dir==='asc'?'desc':'asc'})}>Date</th>
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">Channel</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3 cursor-pointer" onClick={()=>setSortBy({key:'amount', dir: sortBy.dir==='asc'?'desc':'asc'})}>Amount</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map(o=> (
              <tr key={o.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                <td className="py-2 px-3 text-black font-medium">{o.id}</td>
                <td className="py-2 text-black px-3">{o.customerName}</td>
                <td className="py-2 text-black px-3">{new Date(o.date).toLocaleString('vi-VN')}</td>
                <td className="py-2 text-black px-3">{o.items.map(it=>it.category).filter((v,i,a)=>a.indexOf(v)===i).join(', ')}</td>
                <td className="py-2 text-black px-3">{o.channel}</td>
                <td className="py-2 text-black px-3">{o.status}</td>
                <td className="py-2 text-black px-3">{currency(o.amount)}</td>
                <td className="py-2 text-black px-3">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>onView(o)} aria-label={`View ${o.id}`} className="px-2 py-1 rounded bg-blue-100 text-blue-700"><Eye size={16}/></button>
                    <button onClick={()=>onDelete(o)} aria-label={`Delete ${o.id}`} className="px-2 py-1 rounded bg-red-100 text-red-700"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-3">
        <div className="text-sm text-gray-600">Showing {pageData.length} of {sorted.length} orders</div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-2 py-1 text-black border rounded">Prev</button>
          <div className="px-3 py-1 text-black border rounded">{page} / {totalPages}</div>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-2 py-1 text-black border rounded">Next</button>
        </div>
      </div>
    </div>
  )
}

const OrderModal = ({order, onClose, onDelete}) => {
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    setLoading(true);
    const t = setTimeout(()=>setLoading(false),300);
    return ()=>clearTimeout(t);
  },[order]);

  if(!order) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg z-10 w-11/12 md:w-3/4 max-h-[80vh] overflow-y-auto p-4 animate-fade">
        {loading ? (
          <div className="h-48 flex text-black items-center justify-center">Loading...</div>
        ) : (
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl text-black font-semibold">Order {order.id}</h3>
                <div className="text-sm text-gray-500">{order.customerName} • {new Date(order.date).toLocaleString('vi-VN')}</div>
              </div>
              <div className="flex text-black items-center gap-2">
                <button onClick={()=>{ if(window.confirm('Xác nhận xóa order?')) onDelete(order) }} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                <button onClick={onClose} className="px-3 py-1 bg-gray-100 rounded">Close</button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold text-black">Items</h4>
              <div className="mt-2 space-y-2">
                {order.items.map((it, idx)=> (
                  <div key={idx} className="flex justify-between border p-2 rounded">
                    <div>
                      <div className="font-medium text-black">{it.name}</div>
                      <div className="text-xs text-gray-500">{it.category} • qty: {it.qty}</div>
                    </div>
                    <div className="text-center text-black">{currency(it.unitPrice * it.qty)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-right text-black font-semibold">Total: {currency(order.amount)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ------------------------- Main Component -------------------------

const normalizeDate = (date, endOfDay = false) => {
  if (!date) return null;
  const clone = new Date(date);
  if (Number.isNaN(clone.getTime())) return null;
  if (endOfDay) {
    clone.setHours(23, 59, 59, 999);
  } else {
    clone.setHours(0, 0, 0, 0);
  }
  return clone;
};

export default function Income(){
  const [orders, setOrders] = useState([]);
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate()-30); return d; });
  const [to, setTo] = useState(new Date());
  const [filters, setFilters] = useState({ category: '', channel: '', q: '' });
  const [categoryOptions, setCategoryOptions] = useState([{ value: '', label: 'All Categories' }]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const startOfRange = useMemo(() => normalizeDate(from, false), [from]);
  const endOfRange = useMemo(() => normalizeDate(to, true), [to]);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: 100,
        status: 'completed',
        startDate: startOfRange ? startOfRange.toISOString() : undefined,
        endDate: endOfRange ? endOfRange.toISOString() : undefined
      };

      const response = await orderService.getAdminOrders(params);
      
      if (response.success && response.data?.orders) {
        // Transform API data to match component format
        const transformedOrders = response.data.orders.map(order => ({
          id: order.orderNumber || order._id,
          _id: order._id,
          customerName: order.user?.fullName || 'Khách hàng',
          date: order.createdAt,
          channel: order.paymentMethod === 'COD' ? 'COD' : 'Online',
          status: order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Pending',
          paymentStatus: order.paymentStatus,
          items: (order.items || []).map(item => ({
            name: item.product?.name || 'Sản phẩm',
            category: item.product?.category?.name || 'Chưa phân loại',
            qty: item.quantity,
            unitPrice: item.price
          })),
          amount: order.totalAmount || 0
        }));

        const completedOrders = transformedOrders.filter(
          (order) => (order.status || '').toLowerCase() === 'completed'
        );

        setOrders(completedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Không thể tải dữ liệu đơn hàng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [startOfRange, endOfRange]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(()=>{
    return orders.filter(o=>{
      const d = new Date(o.date);
      if(startOfRange && d < startOfRange) return false;
      if(endOfRange && d > endOfRange) return false;
      if(filters.category){
        const cats = o.items.map(i=>i.category);
        if(!cats.includes(filters.category)) return false;
      }
      if(filters.channel && o.channel !== filters.channel) return false;
      if(filters.q){
        const q = filters.q.toLowerCase();
        if(!o.id.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q)) return false;
      }
      return true;
    })
  },[orders, startOfRange, endOfRange, filters]);

  const chartData = useMemo(()=> groupByDate(filtered), [filtered]);

  const channelOptions = useMemo(()=> Array.from(new Set(orders.map(o=>o.channel))), [orders]);

  const categoryColorMap = useMemo(() => {
    const map = {};
    categoryOptions.forEach((opt, index) => {
      if (!opt.value) return;
      map[opt.value] = COLOR_PALETTE[index % COLOR_PALETTE.length];
    });
    return map;
  }, [categoryOptions]);

  const breakdown = useMemo(()=> breakdownByCategory(filtered, categoryColorMap), [filtered, categoryColorMap]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response.success) {
          const names = (response.data?.categories || [])
            .map(cat => cat.name)
            .filter(Boolean);
          setCategoryOptions(prev => mergeCategoryOptions(prev, names));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const names = Array.from(
      new Set(
        orders.flatMap(order => (order.items || []).map(item => item.category).filter(Boolean))
      )
    );
    setCategoryOptions(prev => mergeCategoryOptions(prev, names));
  }, [orders]);

  const handleExportCSV = () => {
    const data = filtered.map(o=> ({ id: o.id, customer: o.customerName, date: o.date, channel: o.channel, status: o.status, amount: o.amount }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleView = (o) => setSelectedOrder(o);
  const handleCloseModal = () => setSelectedOrder(null);

  const handleDelete = (order) => {
    // delete order from list
    setOrders(prev => prev.filter(p=>p.id !== order.id));
    setSelectedOrder(null);
  }

  if (error) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Thống kê doanh thu</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Thống kê doanh thu</h2>

      <RevenueKPI orders={filtered} />

      <RevenueFilters from={from} to={to} setFrom={setFrom} setTo={setTo} categoryOptions={categoryOptions} channelOptions={channelOptions} filters={filters} setFilters={setFilters} onExportCSV={handleExportCSV} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white p-6 rounded shadow-sm border h-64 flex items-center justify-center">Loading chart...</div>
          ) : (
            <RevenueChart data={chartData} />
          )}
        </div>

        <div>
          {loading ? (
            <div className="bg-white p-6 rounded shadow-sm border h-64 flex items-center justify-center">Loading breakdown...</div>
          ) : (
            <RevenueBreakdown data={breakdown} colorMap={categoryColorMap} />
          )}
        </div>
      </div>

      <RevenueTable orders={filtered} onView={handleView} onDelete={(o)=>{ if(window.confirm('Xác nhận xóa đơn hàng này?')) { setOrders(prev=> prev.filter(p=>p.id!==o.id)) } }} />

      {selectedOrder && <OrderModal order={selectedOrder} onClose={handleCloseModal} onDelete={handleDelete} />}
    </div>
  )
}

