import { useState, useEffect } from 'react'
import orderService from '../../services/orderService'

function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await orderService.getOrders()
      setOrders(data.data) // Access data.data
      setError(null)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => 
    order.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <div className="px-8 py-6 border-b bg-gray-50/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900">Order Management</h3>
          <button 
            onClick={fetchOrders}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            Refresh Data
          </button>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search by customer name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50 border-b">
              <th className="px-8 py-4">Date</th>
              <th className="px-8 py-4">Customer</th>
              <th className="px-8 py-4">Product</th>
              <th className="px-8 py-4 text-center">Qty</th>
              <th className="px-8 py-4 text-right">Total</th>
              <th className="px-8 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-8 py-12 text-center text-gray-400">Loading orders...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-8 py-12 text-center text-gray-400">
                  {searchTerm ? `No orders found for "${searchTerm}"` : 'No orders recorded yet.'}
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order._id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{order.username}</div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="text-sm font-medium text-blue-600">{order.product?.name || 'Unknown Product'}</div>
                    <div className="text-xs text-gray-400 font-mono uppercase">{order.salecode}</div>
                  </td>
                  <td className="px-8 py-4 text-center text-sm font-medium">
                    {order.quantity}
                  </td>
                  <td className="px-8 py-4 text-right whitespace-nowrap">
                    <div className="text-sm font-black text-emerald-600">${order.totalPrice.toLocaleString()}</div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      'bg-gray-100 text-gray-700'
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
  )
}

export default OrderHistory
