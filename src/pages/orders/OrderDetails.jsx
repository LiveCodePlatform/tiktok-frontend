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
  const [cartItems, setCartItems] = useState([])

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

  useEffect(() => {
    if (data?.product) {
      setCartItems([{ product: data.product, quantity: 1 }])
    } else {
      setCartItems([])
    }
    setCheckoutStatus(null)
  }, [data])

  const addToCart = (product) => {
    if (cartItems.some(item => item.product.productCode === product.productCode)) {
      toast.error('Item is already in your order!')
      return
    }
    setCartItems(prev => [...prev, { product, quantity: 1 }])
    toast.success(`${product.name} added to order!`)
  }

  const removeFromCart = (productCodeToRemove) => {
    if (cartItems.length <= 1 && cartItems[0]?.product.productCode === productCodeToRemove) {
      toast.error('Order must contain at least one product.')
      return
    }
    setCartItems(prev => prev.filter(item => item.product.productCode !== productCodeToRemove))
  }

  const updateQuantity = (productCodeToUpdate, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.productCode === productCodeToUpdate) {
        const newQty = item.quantity + delta
        if (newQty < 1) return item
        if (newQty > item.product.quantity) {
          toast.error(`Only ${item.product.quantity} units of ${item.product.name} are available.`)
          return item
        }
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    setIsCheckingOut(true)
    try {
      const result = await orderService.createOrder({
        products: cartItems.map(item => ({
          productCode: item.product.productCode,
          quantity: item.quantity
        })),
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

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

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

  const hasRecommendations = data && data.recommendations && data.recommendations.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className={`w-full ${hasRecommendations && data?.message !== 'Out of stock' ? 'max-w-4xl' : 'max-w-md'}`}>
        <Link
          to="/orders"
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
            <p className="text-gray-500 text-sm mb-6">
              Sorry, this item is currently unavailable. Please check back later.
            </p>
            {hasRecommendations && (
              <div className="text-left border-t border-gray-100 pt-6 mt-6">
                <h3 className="font-bold text-gray-900 text-sm mb-4">🛍️ Recommended Alternatives</h3>
                <div className="grid grid-cols-1 gap-3">
                  {data.recommendations.map(item => (
                    <Link
                      key={item._id}
                      to={`/order/${item.productCode}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-xl transition-all"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200/40"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center border border-gray-200/40">
                          <Package className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-xs truncate">{item.name}</h4>
                        <p className="text-[10px] text-gray-400 font-mono">{item.productCode}</p>
                        <p className="text-xs font-bold text-emerald-600 mt-0.5">{item.price?.toLocaleString()} MMK</p>
                      </div>
                      <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                        View
                        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`${hasRecommendations ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''} animate-in slide-in-from-bottom duration-300`}>
            {/* Left Side: Product Detail & Recommendations */}
            <div className="space-y-6">
              <div className="card overflow-hidden border-t-4 border-emerald-500">
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
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="badge-success mb-2 inline-flex">In Stock</span>
                      <h2 className="text-xl font-bold text-gray-900">{data.product?.name}</h2>
                      <p className="text-sm text-gray-500 font-mono mt-1">{data.product?.productCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">
                        {data.product?.price?.toLocaleString()} MMK
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
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
                </div>
              </div>

              {/* UPSELL RECOMMENDATIONS CARD */}
              {data.recommendationType === 'upsell' && (
                <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <h3 className="font-bold text-blue-900 text-sm">💡 Upgrade to Premium</h3>
                  </div>
                  <div className="flex items-start gap-4">
                    {data.recommendations[0].imageUrl ? (
                      <img
                        src={data.recommendations[0].imageUrl}
                        alt={data.recommendations[0].name}
                        className="w-14 h-14 rounded-lg object-cover border border-blue-200/60 bg-white"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center border border-blue-200/60">
                        <Package className="w-6 h-6 text-blue-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{data.recommendations[0].name}</h4>
                      <p className="text-xs text-gray-500 font-mono">{data.recommendations[0].productCode}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-bold text-blue-600">{data.recommendations[0].price?.toLocaleString()} MMK</span>
                        <span className="text-xs text-gray-400 font-medium">
                          (+{(data.recommendations[0].price - data.product.price).toLocaleString()} MMK)
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/order/${data.recommendations[0].productCode}`}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-center"
                    >
                      Upgrade
                    </Link>
                  </div>
                </div>
              )}

              {/* CROSS-SELL RECOMMENDATIONS CARD */}
              {data.recommendationType === 'cross-sell' && (
                <div className="card p-5 border border-gray-200/80 shadow-sm animate-in fade-in duration-300">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">🛍️ Recommended Add-ons</h3>
                  <div className="divide-y divide-gray-100">
                    {data.recommendations.map(item => (
                      <div key={item._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                            <Package className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-xs truncate">{item.name}</h4>
                          <p className="text-[10px] text-gray-400 font-mono">{item.productCode}</p>
                          <p className="text-xs font-bold text-emerald-600 mt-0.5">{item.price?.toLocaleString()} MMK</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          disabled={cartItems.some(cart => cart.product.productCode === item.productCode)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            cartItems.some(cart => cart.product.productCode === item.productCode)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100'
                          }`}
                        >
                          {cartItems.some(cart => cart.product.productCode === item.productCode) ? 'Added' : 'Add'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Cart Summary & Checkout */}
            <div className="space-y-6">
              <div className="card p-6 border-t-4 border-blue-500 shadow-sm flex flex-col justify-between h-full min-h-[300px]">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                    Order Summary
                  </h3>

                  {/* Cart Items List */}
                  <div className="space-y-3 mb-6 max-h-[280px] overflow-y-auto pr-1">
                    {cartItems.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">Your order is empty</p>
                    ) : (
                      cartItems.map(item => (
                        <div key={item.product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex-1 min-w-0 mr-3">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{item.product.name}</h4>
                            <p className="text-xs text-gray-500 font-mono">{item.product.productCode}</p>
                            <p className="text-xs font-bold text-gray-700 mt-0.5">
                              {(item.product.price * item.quantity).toLocaleString()} MMK
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.productCode, -1)}
                              className="w-7 h-7 bg-white border border-gray-200 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-50 text-sm font-bold"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.productCode, 1)}
                              className="w-7 h-7 bg-white border border-gray-200 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-50 text-sm font-bold"
                            >
                              +
                            </button>
                            {cartItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.product.productCode)}
                                className="ml-1 text-red-500 hover:text-red-700 text-xs font-semibold p-1 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  {/* Total Amount */}
                  <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/60 mb-5">
                    <span className="text-sm font-semibold text-emerald-900">Total Price</span>
                    <span className="text-xl font-black text-emerald-700">
                      {totalAmount.toLocaleString()} MMK
                    </span>
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

                  {/* Confirm Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0 || isCheckingOut}
                    className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      cartItems.length === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Confirm Order ({cartItems.reduce((acc, c) => acc + c.quantity, 0)} Items)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
