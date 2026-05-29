import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock,
  Boxes,
} from "lucide-react";
import productService from "../services/productService";
import orderService from "../services/orderService";

function StatCard({ icon: Icon, label, value, subtext, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="card-hover p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function DashboardStats() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          productService.getProducts(),
          orderService.getOrders(),
        ]);
        setProducts(productsRes.data || []);
        setOrders(ordersRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const lowStockCount = products.filter((p) => p.quantity < 10).length;
  const lowStockItems = products.filter((p) => p.quantity < 10).slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Products"
          value={totalProducts}
          subtext={`${lowStockCount} low stock`}
          color="blue"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={totalOrders}
          color="emerald"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={`${totalRevenue.toLocaleString()} MMK`}
          color="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Alerts"
          value={lowStockCount}
          subtext="items below 10 units"
          color="amber"
        />
      </div>
    </div>
  );
}

export default DashboardStats;
