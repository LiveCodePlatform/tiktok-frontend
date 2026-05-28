import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock,
  Boxes,
} from 'lucide-react'
import productService from '../services/productService'
import orderService from '../services/orderService'

function StatCard({ icon: Icon, label, value, subtext, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="card-hover p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-400 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

function DashboardStats() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          productService.getProducts(),
          orderService.getOrders(),
        ])
        setProducts(productsRes.data || [])
        setOrders(ordersRes.data || [])
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalProducts = products.length
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
  const lowStockCount = products.filter(p => p.quantity < 10).length
  const lowStockItems = products.filter(p => p.quantity < 10).slice(0, 5)
  const recentOrders = orders.slice(0, 5)

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
    )
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            </div>
            <Link
              to="/orders/history"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No orders yet
              </div>
            ) : (
              recentOrders.map(order => (
                <div key={order._id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{order.username}</p>
                    <p className="text-xs text-gray-400 font-mono">{order.productCode}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-gray-900">{order.totalPrice?.toLocaleString()} MMK</p>
                    <span className={`text-xs font-medium ${
                      order.status === 'completed' ? 'text-emerald-600' :
                      order.status === 'pending' ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-gray-900">Low Stock Items</h3>
            </div>
            <Link
              to="/products"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Manage <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                All products are well stocked
              </div>
            ) : (
              lowStockItems.map(product => (
                <div key={product._id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{product.productCode}</p>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    product.quantity === 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {product.quantity} left
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardStats
