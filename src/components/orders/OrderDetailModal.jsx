import { useState } from 'react'
import {
  X,
  User,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Printer,
  ChevronDown,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '../Toast'
import orderService from '../../services/orderService'

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
  onDelete,
}) {
  const toast = useToast()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen || !order) return null

  const handleCopyId = () => {
    navigator.clipboard.writeText(order._id)
    setCopied(true)
    toast.success('Order ID copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStatusChange = async (newStatus) => {
    if (newStatus === order.status) return
    setIsUpdatingStatus(true)
    try {
      const res = await orderService.updateOrderStatus(order._id, newStatus)
      if (res.success) {
        toast.success(`Order status changed to ${newStatus}`)
        onStatusUpdate(order._id, newStatus)
      }
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
              {getStatusBadge(order.status)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <span className="font-mono">#{order._id}</span>
              <button
                onClick={handleCopyId}
                className="hover:text-gray-700 transition-colors"
                title="Copy Order ID"
              >
                <Copy className="w-3 h-3" />
              </button>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Info Card */}
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-[#ff5b00]" />
                Customer Information
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">{order.name}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <a
                    href={`tel:${order.phone}`}
                    className="hover:text-[#ff5b00] hover:underline"
                  >
                    {order.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Card */}
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#ff5b00]" />
                Delivery & Payment
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-1.5 text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{order.address || 'No address provided'}</span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-700 pt-1">
                  <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                  <span className="capitalize font-medium">
                    {order.paymentMethod ? order.paymentMethod.replace('-', ' ') : 'Cash On Delivery'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#ff5b00]" />
                Order Items ({order.items?.length || 0})
              </h3>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Item</th>
                    <th className="py-2.5 px-4 text-center">Code</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items?.map((item, idx) => {
                    const itemName = item.product?.name || item.name || item.productCode
                    const itemCode = item.productCode || item.code || item.product?.productCode
                    const itemPrice = item.price || item.product?.price || 0
                    const subtotal = item.subtotal || itemPrice * item.quantity

                    return (
                      <tr key={idx} className="hover:bg-gray-50/40">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 block">
                            {itemName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-gray-500">
                          {itemCode}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {itemPrice.toLocaleString()} MMK
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                          {subtotal.toLocaleString()} MMK
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Items Total:</span>
              <span>{order.totalAmount?.toLocaleString()} MMK</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee:</span>
              <span className="text-emerald-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Grand Total:</span>
              <span className="text-base text-[#ff5b00]">
                {order.totalAmount?.toLocaleString()} MMK
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Status Changer in Footer */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Change Status:</span>
            <select
              value={order.status}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>

            {onDelete && (
              <button
                onClick={() => {
                  onClose()
                  onDelete(order._id)
                }}
                className="px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
