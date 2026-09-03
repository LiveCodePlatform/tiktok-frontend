import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Boxes,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import productService from "../services/productService";
import orderService from "../services/orderService";

function StatCard({ icon: Icon, label, value, subtext, color, trend }) {
  const colorClasses = {
    orange: "bg-[#fff2eb] text-[#ff5b00]",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-[#ecfdf5] text-[#059669]",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1.5 tracking-tight">{value}</p>
          {subtext && (
            <div className="flex items-center gap-1.5 mt-2">
              {trend && (
                <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  {trend}
                </span>
              )}
              <p className="text-xs text-gray-400 font-medium">{subtext}</p>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${colorClasses[color] || colorClasses.orange}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function DashboardStats() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'sales' | 'stock'
  const [timeRange, setTimeRange] = useState("all"); // 'all' | 'month' | 'week' | 'today'

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        productService.getProducts(),
        orderService.getOrders(),
      ]);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter orders by selected time range
  const filteredOrders = useMemo(() => {
    if (timeRange === "all") return orders;
    const now = new Date();
    return orders.filter((o) => {
      const orderDate = new Date(o.createdAt || o.date || Date.now());
      if (timeRange === "today") {
        return orderDate.toDateString() === now.toDateString();
      }
      if (timeRange === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= oneWeekAgo;
      }
      if (timeRange === "month") {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= oneMonthAgo;
      }
      return true;
    });
  }, [orders, timeRange]);

  // Analytics Computations
  // 1. Helper to calculate an order's total amount reliably
  const getOrderTotal = (order) => {
    if (order.totalAmount != null && order.totalAmount > 0) return order.totalAmount;
    if (order.totalPrice != null && order.totalPrice > 0) return order.totalPrice;
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((s, item) => {
        const itemPrice = item.subtotal || (Number(item.price) || 0) * (Number(item.quantity) || 1);
        return s + itemPrice;
      }, 0);
    }
    return 0;
  };

  // 2. Total Sales / Revenue (excluding cancelled orders)
  const nonCancelledOrders = filteredOrders.filter((o) => o.status !== "cancelled");
  const totalSalesRevenue = nonCancelledOrders.reduce(
    (sum, o) => sum + getOrderTotal(o),
    0
  );

  // 3. Total Stock Sold (Units)
  const totalStockSold = nonCancelledOrders.reduce((totalUnits, order) => {
    if (order.items && Array.isArray(order.items)) {
      return totalUnits + order.items.reduce((s, item) => s + (Number(item.quantity) || 1), 0);
    }
    return totalUnits + (Number(order.quantity) || 1);
  }, 0);

  // 4. Remaining Stock in Inventory
  const totalRemainingStock = products.reduce(
    (sum, p) => sum + (Number(p.quantity) || 0),
    0
  );

  // 5. Low stock products & alerts
  const lowStockProducts = products.filter((p) => (Number(p.quantity) || 0) <= 10);
  const lowStockCount = lowStockProducts.length;

  // 6. Total Inventory Valuation
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
    0
  );

  // 7. Top Selling Products calculation
  const topSellingProducts = useMemo(() => {
    const productSalesMap = {};

    nonCancelledOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const code = item.productCode || item.code || item.product?.productCode || "UNKNOWN";
          const name = item.product?.name || item.name || code;
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || item.product?.price || 0;

          if (!productSalesMap[code]) {
            productSalesMap[code] = {
              productCode: code,
              name: name,
              unitsSold: 0,
              revenue: 0,
            };
          }
          productSalesMap[code].unitsSold += qty;
          productSalesMap[code].revenue += qty * price;
        });
      }
    });

    // Merge with current product stock info
    return Object.values(productSalesMap)
      .map((item) => {
        const matchedProduct = products.find((p) => p.productCode === item.productCode);
        return {
          ...item,
          currentStock: matchedProduct ? matchedProduct.quantity : 0,
          category: matchedProduct?.category || "General",
          imageUrl: matchedProduct?.imageUrl || null,
        };
      })
      .sort((a, b) => b.unitsSold - a.unitsSold);
  }, [nonCancelledOrders, products]);

  // 8. Category Stock & Sales Distribution
  const categoryStats = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!map[cat]) {
        map[cat] = { category: cat, totalStock: 0, productCount: 0, unitsSold: 0, revenue: 0 };
      }
      map[cat].totalStock += Number(p.quantity) || 0;
      map[cat].productCount += 1;
    });

    // Add sales per category
    nonCancelledOrders.forEach((o) => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const matched = products.find(
            (p) => p.productCode === (item.productCode || item.code)
          );
          const cat = matched?.category || "Uncategorized";
          if (map[cat]) {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || matched?.price || 0;
            map[cat].unitsSold += qty;
            map[cat].revenue += qty * price;
          }
        });
      }
    });

    return Object.values(map);
  }, [products, nonCancelledOrders]);

  // 9. Order Status counts
  const completedOrdersCount = filteredOrders.filter((o) => o.status === "completed").length;
  const pendingOrdersCount = filteredOrders.filter((o) => o.status === "pending").length;
  const cancelledOrdersCount = filteredOrders.filter((o) => o.status === "cancelled").length;

  return (
    <div className="h-full flex flex-col min-h-0 animate-in fade-in duration-300">
      {/* Fixed Page Header */}
      <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            Sales & Stock Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time analytics for revenue, stock sales, and remaining inventory
          </p>
        </div>

        {/* Header Actions & Range Filter */}
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-medium">
            {[
              { id: "all", label: "All Time" },
              { id: "month", label: "30 Days" },
              { id: "week", label: "7 Days" },
              { id: "today", label: "Today" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  timeRange === tab.id
                    ? "bg-white text-gray-900 font-semibold shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex-shrink-0 flex items-center gap-8 mb-5 border-b border-gray-100 text-sm font-medium">
        {[
          { id: "overview", label: "Overview" },
          { id: "sales", label: "Sales Report" },
          { id: "stock", label: "Stock & Inventory" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 transition-colors ${
              activeTab === tab.id
                ? "text-gray-900 font-bold border-b-2 border-[#ff5b00]"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable Tab Content Container */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-5 pr-1 pb-4">
        {/* =================== TAB 1: OVERVIEW =================== */}
        {activeTab === "overview" && (
          <>
            {/* Primary 4 KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={DollarSign}
                label="Total Sales"
                value={`${totalSalesRevenue.toLocaleString()} MMK`}
                subtext={`${nonCancelledOrders.length} orders fulfilled`}
                color="emerald"
                trend={nonCancelledOrders.length > 0 ? "Active" : undefined}
              />
              <StatCard
                icon={Boxes}
                label="Total Stock Sold"
                value={`${totalStockSold.toLocaleString()} Units`}
                subtext="Sold across all orders"
                color="orange"
              />
              <StatCard
                icon={Package}
                label="Remaining Stock"
                value={`${totalRemainingStock.toLocaleString()} Units`}
                subtext={`${products.length} active products`}
                color="blue"
              />
              <StatCard
                icon={AlertTriangle}
                label="Low Stock Alerts"
                value={lowStockCount}
                subtext={`${lowStockCount} items below 10 units`}
                color={lowStockCount > 0 ? "amber" : "emerald"}
              />
            </div>

            {/* Stock Turnover & Performance Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5b00] flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Stock Turnover Ratio</h3>
                    <p className="text-xs text-gray-400">Sold vs available inventory</p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-100">
                  Total Inventory Value: {totalInventoryValue.toLocaleString()} MMK
                </span>
              </div>

              {/* Visual Stock Sold vs Remaining Bar */}
              {(() => {
                const totalStockLifecycle = totalStockSold + totalRemainingStock || 1;
                const soldPercentage = Math.round((totalStockSold / totalStockLifecycle) * 100);
                const remainingPercentage = 100 - soldPercentage;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#ff5b00] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ff5b00]" />
                        Sold: {totalStockSold.toLocaleString()} units ({soldPercentage}%)
                      </span>
                      <span className="text-blue-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Remaining: {totalRemainingStock.toLocaleString()} units ({remainingPercentage}%)
                      </span>
                    </div>

                    <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${soldPercentage}%` }}
                        className="bg-[#ff5b00] h-full transition-all duration-500 rounded-l-full"
                      />
                      <div
                        style={{ width: `${remainingPercentage}%` }}
                        className="bg-blue-500 h-full transition-all duration-500 rounded-r-full"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Order Status Breakdown Badges */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100">
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                  <span className="text-xs font-medium text-emerald-700 block">Completed Orders</span>
                  <span className="text-lg font-bold text-emerald-800 mt-0.5 block">
                    {completedOrdersCount}
                  </span>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                  <span className="text-xs font-medium text-amber-700 block">Pending Orders</span>
                  <span className="text-lg font-bold text-amber-800 mt-0.5 block">
                    {pendingOrdersCount}
                  </span>
                </div>

                <div className="p-3 bg-red-50/60 border border-red-100 rounded-xl">
                  <span className="text-xs font-medium text-red-700 block">Cancelled Orders</span>
                  <span className="text-lg font-bold text-red-800 mt-0.5 block">
                    {cancelledOrdersCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Navigation Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/products"
                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-sm text-gray-800 text-sm font-semibold transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff5b00] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-gray-900">Stock Management</span>
                    <span className="text-xs font-normal text-gray-400">Manage catalog & inventory</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#ff5b00] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/orders/history"
                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-sm text-gray-800 text-sm font-semibold transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-gray-900">Order History Log</span>
                    <span className="text-xs font-normal text-gray-400">View orders & status updates</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#ff5b00] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/products/new"
                className="flex items-center justify-between p-4 rounded-2xl bg-[#ff5b00] hover:bg-[#e04e00] text-white text-sm font-semibold transition-all shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-white">Add New Stock</span>
                    <span className="text-xs font-normal text-white/80">Create new product entry</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </>
        )}

        {/* =================== TAB 2: SALES REPORT =================== */}
        {activeTab === "sales" && (
          <div className="space-y-5">
            {/* Top Sales Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Total Sales Revenue
                </span>
                <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                  {totalSalesRevenue.toLocaleString()} MMK
                </span>
                <span className="text-xs text-gray-400 mt-1 block">
                  From {nonCancelledOrders.length} fulfilled orders
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Total Units Sold
                </span>
                <span className="text-2xl font-bold text-[#ff5b00] mt-1 block">
                  {totalStockSold.toLocaleString()} Units
                </span>
                <span className="text-xs text-gray-400 mt-1 block">
                  Across all active customer orders
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Average Order Value
                </span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">
                  {nonCancelledOrders.length > 0
                    ? Math.round(totalSalesRevenue / nonCancelledOrders.length).toLocaleString()
                    : 0}{" "}
                  MMK
                </span>
                <span className="text-xs text-gray-400 mt-1 block">Per customer order</span>
              </div>
            </div>

            {/* Top Selling Products Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Top Selling Products</h3>
                  <p className="text-xs text-gray-400">Ranked by units sold and generated revenue</p>
                </div>
                <Link
                  to="/products"
                  className="text-xs font-semibold text-[#ff5b00] hover:text-[#e04e00] flex items-center gap-1"
                >
                  View Inventory <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-900 uppercase">
                      <th className="py-3 px-5 w-16">Rank</th>
                      <th className="py-3 px-5">Product Name</th>
                      <th className="py-3 px-5">Code</th>
                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-5 text-right">Units Sold</th>
                      <th className="py-3 px-5 text-right">Revenue Generated</th>
                      <th className="py-3 px-5 text-center">Current Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topSellingProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-gray-400 text-sm">
                          No sales data recorded yet.
                        </td>
                      </tr>
                    ) : (
                      topSellingProducts.map((item, index) => (
                        <tr key={item.productCode} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-5">
                            <span className="w-6 h-6 rounded-full bg-orange-50 text-[#ff5b00] font-bold text-xs flex items-center justify-center">
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-gray-900">{item.name}</td>
                          <td className="py-3.5 px-5 font-mono text-xs text-gray-600">
                            {item.productCode}
                          </td>
                          <td className="py-3.5 px-5 text-gray-500 text-xs">{item.category}</td>
                          <td className="py-3.5 px-5 text-right font-bold text-[#ff5b00]">
                            {item.unitsSold} units
                          </td>
                          <td className="py-3.5 px-5 text-right font-bold text-emerald-600">
                            {item.revenue.toLocaleString()} MMK
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                item.currentStock > 10
                                  ? "bg-emerald-50 text-emerald-600"
                                  : item.currentStock > 0
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {item.currentStock} left
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================== TAB 3: STOCK & INVENTORY =================== */}
        {activeTab === "stock" && (
          <div className="space-y-5">
            {/* Top Stock Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Total Remaining Units
                </span>
                <span className="text-2xl font-bold text-blue-600 mt-1 block">
                  {totalRemainingStock.toLocaleString()} Units
                </span>
                <span className="text-xs text-gray-400 mt-1 block">
                  Across {products.length} products
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Total Inventory Valuation
                </span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">
                  {totalInventoryValue.toLocaleString()} MMK
                </span>
                <span className="text-xs text-gray-400 mt-1 block">Based on catalog prices</span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Low Stock Items
                </span>
                <span className="text-2xl font-bold text-amber-600 mt-1 block">
                  {lowStockCount} Products
                </span>
                <span className="text-xs text-gray-400 mt-1 block">Items with &le; 10 units</span>
              </div>
            </div>

            {/* Category Stock Distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Category Stock Breakdown</h3>
                  <p className="text-xs text-gray-400">Inventory units and sales by category</p>
                </div>
              </div>

              <div className="space-y-4">
                {categoryStats.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No categories found</p>
                ) : (
                  categoryStats.map((cat) => {
                    const catStockPercent = totalRemainingStock
                      ? Math.round((cat.totalStock / totalRemainingStock) * 100)
                      : 0;

                    return (
                      <div key={cat.category} className="space-y-2 p-3 bg-gray-50/60 rounded-xl">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-900 text-sm">{cat.category}</span>
                          <span className="text-gray-600">
                            {cat.totalStock.toLocaleString()} units in stock ({cat.unitsSold} sold)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(catStockPercent, 100)}%` }}
                            className="bg-[#ff5b00] h-full rounded-full transition-all duration-300"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                          <span>{cat.productCount} product types</span>
                          <span>Revenue: {cat.revenue.toLocaleString()} MMK</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Low Stock Watchlist */}
            {lowStockProducts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Low Stock Watchlist</h3>
                      <p className="text-xs text-gray-400">Products requiring restock soon</p>
                    </div>
                  </div>
                  <Link
                    to="/products"
                    className="text-xs font-semibold text-[#ff5b00] hover:text-[#e04e00]"
                  >
                    Adjust Stock &rarr;
                  </Link>
                </div>

                <div className="divide-y divide-gray-100 text-sm">
                  {lowStockProducts.map((p) => (
                    <div
                      key={p._id}
                      className="px-5 py-3 flex items-center justify-between hover:bg-amber-50/30 transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-gray-900 block">{p.name}</span>
                        <span className="text-xs font-mono text-gray-400">{p.productCode}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          {p.quantity} units left
                        </span>
                        <Link
                          to="/products"
                          className="text-xs font-medium text-[#ff5b00] hover:underline"
                        >
                          Restock
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardStats;

