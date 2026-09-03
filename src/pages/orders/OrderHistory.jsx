import { useState, useEffect, useRef } from 'react'
import { Search, RefreshCw, Clock, ShoppingCart, Trash2, AlertTriangle, Loader2, X, ChevronDown, Eye } from 'lucide-react'
import { useToast } from '../../components/Toast'
import OrderDetailModal from '../../components/orders/OrderDetailModal'
import orderService from '../../services/orderService'

function OrderHistory() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewingOrder, setViewingOrder] = useState(null)

  // Selection and deletion states
  const [selectedIds, setSelectedIds] = useState([])
  const [deleteId, setDeleteId] = useState(null)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const selectAllCheckboxRef = useRef(null)

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

  // Master checkbox indeterminate logic
  const isAllSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.includes(o._id))
  const isSomeSelected = filteredOrders.some(o => selectedIds.includes(o._id)) && !isAllSelected

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isSomeSelected
    }
  }, [isSomeSelected])

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredOrders.map(o => o._id))
    }
  }

  const handleToggleSelectOrder = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSingleStatusChange = async (id, newStatus) => {
    try {
      const res = await orderService.updateOrderStatus(id, newStatus)
      if (res.success) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o))
        toast.success(`Order status updated to "${newStatus}"`)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      toast.error(`Failed to update status: ${errorMsg}`)
    }
  }

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.length === 0) return
    setIsUpdatingStatus(true)
    try {
      const res = await orderService.bulkUpdateOrderStatus(selectedIds, newStatus)
      if (res.success) {
        setOrders(prev => prev.map(o => selectedIds.includes(o._id) ? { ...o, status: newStatus } : o))
        toast.success(`Updated ${res.data?.updatedCount || selectedIds.length} order(s) to "${newStatus}"`)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      toast.error(`Failed to update status: ${errorMsg}`)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDeleteSingle = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const res = await orderService.deleteOrder(deleteId)
      if (res.success) {
        setOrders(prev => prev.filter(o => o._id !== deleteId))
        setSelectedIds(prev => prev.filter(id => id !== deleteId))
        toast.success('Order deleted and stock restored successfully!')
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      toast.error(`Delete failed: ${errorMsg}`)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    setIsDeleting(true)
    try {
      const res = await orderService.bulkDeleteOrders(selectedIds)
      if (res.success) {
        const { deletedCount, deletedIds } = res.data || {}
        if (deletedIds && deletedIds.length > 0) {
          setOrders(prev => prev.filter(o => !deletedIds.includes(o._id)))
        } else {
          fetchOrders()
        }
        setSelectedIds([])
        setIsBulkDeleteModalOpen(false)
        toast.success(`Successfully deleted ${deletedCount || selectedIds.length} order(s) and restored stock!`)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      toast.error(`Bulk delete failed: ${errorMsg}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="h-full flex flex-col min-h-0 animate-in fade-in duration-300">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order History</h2>
          <p className="text-sm text-gray-500 mt-0.5">View and manage all customer orders</p>
        </div>
        <button onClick={fetchOrders} className="btn-ghost text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters - Fixed */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, product code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {['all', 'pending', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Table Card - Flex-1 Scrollable */}
      <div className="flex-1 min-h-0 flex flex-col card overflow-hidden border border-gray-100 shadow-sm rounded-2xl">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
              <tr className="border-b border-gray-100 bg-white">
                <th className="table-cell w-12 text-center bg-white">
                  <input
                    type="checkbox"
                    ref={selectAllCheckboxRef}
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    disabled={filteredOrders.length === 0}
                    className="w-4 h-4 text-[#ff5b00] rounded border-gray-300 focus:ring-orange-500 cursor-pointer disabled:opacity-40"
                    title="Select all visible orders"
                  />
                </th>
                <th className="table-cell text-xs font-bold text-gray-900 uppercase tracking-wider bg-white">Date</th>
                <th className="table-cell text-xs font-bold text-gray-900 uppercase tracking-wider bg-white">Customer</th>
                <th className="table-cell text-xs font-bold text-gray-900 uppercase tracking-wider bg-white">Items</th>
                <th className="table-cell text-right text-xs font-bold text-gray-900 uppercase tracking-wider bg-white">Total</th>
                <th className="table-cell text-center text-xs font-bold text-gray-900 uppercase tracking-wider bg-white">Payment</th>
                <th className="table-cell text-center text-xs font-bold text-gray-900 uppercase tracking-wider w-36 bg-white">Status</th>
                <th className="table-cell text-center text-xs font-bold text-gray-900 uppercase tracking-wider w-20 bg-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-4 mx-auto" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
                    <td className="table-cell"><div className="h-5 bg-gray-200 rounded-full w-16 mx-auto" /></td>
                    <td className="table-cell"><div className="h-6 bg-gray-200 rounded-full w-24 mx-auto" /></td>
                    <td className="table-cell"><div className="h-5 bg-gray-200 rounded w-8 mx-auto" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
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
                filteredOrders.map(order => {
                  const isSelected = selectedIds.includes(order._id)
                  return (
                    <tr
                      key={order._id}
                      onClick={() => setViewingOrder(order)}
                      className={`transition-colors cursor-pointer group ${
                        isSelected ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <td className="table-cell text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOrder(order._id)}
                          className="w-4 h-4 text-[#ff5b00] rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                        />
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-900 font-medium">
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
                        <p className="font-semibold text-gray-900 group-hover:text-[#ff5b00] transition-colors">{order.name}</p>
                        <p className="text-xs text-gray-400">{order.phone}</p>
                      </td>
                      <td className="table-cell">
                        <div className="space-y-1">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="text-gray-900">{item.product?.name || item.productCode}</span>
                              <span className="text-gray-400 ml-1 font-medium">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="table-cell text-right font-bold text-emerald-600">
                        {order.totalAmount?.toLocaleString()} MMK
                      </td>
                      <td className="table-cell text-center">
                        <span className="badge-neutral capitalize text-xs">
                          {order.paymentMethod ? order.paymentMethod.replace('-', ' ') : 'Cash'}
                        </span>
                      </td>
                      <td className="table-cell text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-block relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleSingleStatusChange(order._id, e.target.value)}
                            className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer border appearance-none pr-6 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                              order.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : order.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : order.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>
                      <td className="table-cell text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Order Details Button */}
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="w-8 h-8 rounded-lg bg-[#fff2eb] hover:bg-[#ffe2d1] text-[#ff5b00] flex items-center justify-center transition-colors shadow-sm"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete Order Button */}
                          <button
                            onClick={() => setDeleteId(order._id)}
                            className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-800 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-sm font-semibold text-white">
              {selectedIds.length}
            </span>
            <span className="text-xs text-gray-300">
              order{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="h-4 w-px bg-gray-700"></div>

          <div className="flex items-center gap-2">
            {selectedIds.length < filteredOrders.length && (
              <button
                onClick={() => setSelectedIds(filteredOrders.map(o => o._id))}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-white/5 transition-colors"
              >
                Select all {filteredOrders.length}
              </button>
            )}
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-gray-400 hover:text-gray-200 font-medium px-2 py-1 rounded hover:bg-white/5 transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Clear selection
            </button>
          </div>

          <div className="h-4 w-px bg-gray-700"></div>

          {/* Bulk Status Selector */}
          <div className="flex items-center gap-1.5 bg-gray-800/90 border border-gray-700/80 rounded-xl px-3 py-1.5 shadow-inner">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Status:</span>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusChange(e.target.value)
                  e.target.value = ""
                }
              }}
              disabled={isUpdatingStatus}
              className="bg-transparent text-xs text-gray-200 border-none outline-none font-semibold cursor-pointer pr-2"
            >
              <option value="" disabled className="bg-gray-900 text-gray-400">Mark as...</option>
              <option value="pending" className="bg-gray-900 text-amber-400">Mark Pending</option>
              <option value="completed" className="bg-gray-900 text-emerald-400">Mark Completed</option>
              <option value="cancelled" className="bg-gray-900 text-rose-400">Mark Cancelled</option>
            </select>
            {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
          </div>

          <button
            onClick={() => setIsBulkDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-xl transition-all shadow-md hover:shadow-red-600/25 ml-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selectedIds.length})
          </button>
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Order?</h3>
              <p className="text-sm text-gray-500 mb-4">
                This order will be permanently deleted and its items will be automatically returned back to inventory stock.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSingle}
                  disabled={isDeleting}
                  className="btn-danger flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200 border border-gray-100">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete {selectedIds.length} Selected Order{selectedIds.length > 1 ? 's' : ''}?
              </h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                You are about to permanently delete <strong className="text-gray-800">{selectedIds.length}</strong> order{selectedIds.length > 1 ? 's' : ''}.
              </p>
              
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-3 text-left mb-6 flex items-start gap-2.5">
                <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 leading-normal">
                  <strong>Stock Restoration:</strong> All product quantities in the deleted orders will be automatically added back into your product inventory.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="btn-danger flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete {selectedIds.length} Order{selectedIds.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={viewingOrder}
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        onStatusUpdate={(orderId, newStatus) => {
          setOrders((prev) =>
            prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
          )
          if (viewingOrder && viewingOrder._id === orderId) {
            setViewingOrder((prev) => ({ ...prev, status: newStatus }))
          }
        }}
        onDelete={(id) => setDeleteId(id)}
      />
    </div>
  )
}

export default OrderHistory
