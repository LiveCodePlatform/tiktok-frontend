import { useState, useEffect } from 'react'
import { Search, RefreshCw, Clock, ShoppingCart } from 'lucide-react'
import orderService from '../../services/orderService'

function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await orderService.getOrders()
      setOrders(data.data || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm) ||
      order.items?.some(item =>
        item.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order History</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage all customer orders</p>
        </div>
        <button onClick={fetchOrders} className="btn-ghost text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, product code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {['all', 'pending', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left table-cell">Date</th>
                <th className="text-left table-cell">Customer</th>
                <th className="text-left table-cell">Items</th>
                <th className="text-right table-cell">Total</th>
                <th className="text-center table-cell">Payment</th>
                <th className="text-center table-cell">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
                    <td className="table-cell"><div className="h-5 bg-gray-200 rounded-full w-16 mx-auto" /></td>
                    <td className="table-cell"><div className="h-5 bg-gray-200 rounded-full w-16 mx-auto" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingCart className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        {searchTerm ? `No orders found for "${searchTerm}"` : 'No orders yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="font-medium text-gray-900">{order.name}</p>
                      <p className="text-xs text-gray-400">{order.phone}</p>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="text-gray-900">{item.product?.name || item.productCode}</span>
                            <span className="text-gray-400 ml-1">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell text-right font-bold text-emerald-600">
                      {order.totalAmount?.toLocaleString()} MMK
                    </td>
                    <td className="table-cell text-center">
                      <span className="badge-neutral capitalize text-xs">
                        {order.paymentMethod?.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <span className={`badge ${
                        order.status === 'completed' ? 'badge-success' :
                        order.status === 'pending' ? 'badge-warning' :
                        'badge-neutral'
                      }`}>
                        {order.status}
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
  )
}

export default OrderHistory
