import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingCart, CheckCircle, XCircle, ArrowRight, Package } from 'lucide-react'
import { useToast } from '../../components/Toast'
import orderService from '../../services/orderService'
import productService from '../../services/productService'

function OrderSystem() {
  const toast = useToast()
  const [productCode, setProductCode] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckOrder = async () => {
    if (!productCode.trim()) return
    setIsChecking(true)
    try {
      const data = await orderService.checkOrder(productCode.trim())
      setResult(data.data)
    } catch (err) {
      setResult(err.response?.data || { message: 'Error checking order' })
    } finally {
      setIsChecking(false)
    }
  }

  const handleCheckout = async () => {
    if (!result?.product) return
    setIsLoading(true)
    try {
      const data = await orderService.createOrder({
        products: [
          {
            stockId: result.product._id,
            quantity: 1
          }
        ],
        name: 'Dashboard User',
        phone: '0900000000',
        address: 'Dashboard Order',
        paymentMethod: 'cash-on-delivery'
      })
      toast.success(data.message || 'Order placed successfully!')
      setResult(null)
      setProductCode('')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCheckOrder()
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Order System</h2>
        <p className="text-sm text-gray-500 mt-1">Check stock or place orders using product codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Product Lookup</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Product Code</label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="e.g. A001"
                className="input-lg font-mono uppercase text-center text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckOrder}
                disabled={!productCode.trim() || isChecking}
                className="btn-secondary flex-1"
              >
                {isChecking ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Check Stock
              </button>
              <button
                onClick={handleCheckout}
                disabled={!result?.product || isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                Quick Order
              </button>
            </div>
          </div>
        </div>

        {/* Result Card */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-2 rounded-lg ${
              result?.message === 'In stock' || result?.message === 'Item is available'
                ? 'bg-emerald-50'
                : 'bg-gray-50'
            }`}>
              {result?.message === 'In stock' || result?.message === 'Item is available' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : result ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Package className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900">Result</h3>
          </div>

          {!result ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Enter a product code to see results</p>
            </div>
          ) : result.message === 'In stock' || result.message === 'Item is available' ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start gap-4">
                {result.product?.imageUrl ? (
                  <img
                    src={result.product.imageUrl}
                    alt={result.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">{result.product?.name}</h4>
                  <p className="text-sm text-gray-500 font-mono">{result.product?.productCode}</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">
                    {result.product?.price?.toLocaleString()} MMK
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Remaining Stock</span>
                <span className={`font-bold ${
                  result.product?.quantity > 10 ? 'text-emerald-600' :
                  result.product?.quantity > 0 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {result.product?.quantity} units
                </span>
              </div>

              <Link
                to={`/order/${result.product?.productCode}`}
                className="btn-secondary w-full justify-center"
              >
                View Order Page
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 animate-in fade-in duration-200">
              <XCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
              <p className="text-red-600 font-medium">{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderSystem
