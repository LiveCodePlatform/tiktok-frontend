import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { useToast } from '../../components/Toast'
import orderService from '../../services/orderService'

function OrderDetails() {
  const { productCode } = useParams()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [checkoutStatus, setCheckoutStatus] = useState(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const checkStock = async () => {
    setLoading(true)
    try {
      const result = await orderService.checkOrder(productCode)
      setData(result.data)
      setError(null)
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Invalid Code')
      } else {
        setError('An error occurred while checking stock.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStock()
  }, [productCode])

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      const result = await orderService.createOrder({
        products: [
          {
            productCode: data.product.productCode,
            quantity: 1
          }
        ],
        name: 'Web Customer',
        phone: '0900000000',
        address: 'Online Order',
        paymentMethod: 'cash-on-delivery'
      })
      setCheckoutStatus({ success: true, message: result.message })
      checkStock()
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      setCheckoutStatus({ success: false, message: errorMsg })
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading product details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {error === 'Invalid Code' ? (
          <div className="card p-8 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Code</h2>
            <p className="text-gray-500 text-sm">
              Product code{' '}
              <span className="font-mono font-bold text-red-500">{productCode}</span>{' '}
              does not exist in our system.
            </p>
          </div>
        ) : error ? (
          <div className="card p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : data?.message === 'Out of stock' ? (
          <div className="card p-8 text-center border-t-4 border-red-500 animate-in slide-in-from-bottom duration-300">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Out of Stock</h2>
            <p className="text-gray-500 text-sm">
              Sorry, this item is currently unavailable. Please check back later.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden border-t-4 border-emerald-500 animate-in slide-in-from-bottom duration-300">
            {/* Product Image */}
            {data.product?.imageUrl && (
              <div className="aspect-video bg-gray-100">
                <img
                  src={data.product.imageUrl}
                  alt={data.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="badge-success mb-2 inline-flex">In Stock</span>
                  <h2 className="text-xl font-bold text-gray-900">{data.product?.name}</h2>
                  <p className="text-sm text-gray-500 font-mono mt-1">{data.product?.productCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">
                    {data.product?.price?.toLocaleString()} MMK
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                {data.product?.description && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Description</p>
                    <p className="text-sm text-gray-700">{data.product.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Category</p>
                    <p className="text-sm font-medium text-gray-900">
                      {data.product?.category || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">Available</p>
                    <p className="text-sm font-medium text-gray-900">
                      {data.product?.quantity} units
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkout Status */}
              {checkoutStatus && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  checkoutStatus.success
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {checkoutStatus.success ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  )}
                  {checkoutStatus.message}
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={data.product?.quantity <= 0 || isCheckingOut}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  data.product?.quantity <= 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : data.product?.quantity <= 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Confirm Checkout (1 Unit)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
