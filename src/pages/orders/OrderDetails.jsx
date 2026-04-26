import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import orderService from '../../services/orderService'

function OrderDetails() {
  const { salecode } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [checkoutStatus, setCheckoutStatus] = useState(null)

  const checkStock = async () => {
    setLoading(true)
    try {
      const result = await orderService.checkOrder(salecode)
      setData(result.data) // Access data.data
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
  }, [salecode])

  const handleCheckout = async () => {
    try {
      const result = await orderService.checkout({ 
        username: 'Web Customer',
        salecode 
      })
      setCheckoutStatus({ success: true, message: result.message })
      checkStock() // Refresh stock info
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      setCheckoutStatus({ success: false, message: errorMsg })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Checking stock...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link to="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-2 font-medium transition-colors">
          ← Back to Dashboard
        </Link>

        {error === 'Invalid Code' ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center animate-in zoom-in duration-300">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Code</h2>
            <p className="text-gray-500">The sale code <span className="font-mono font-bold text-red-500 uppercase">{salecode}</span> does not exist in our system.</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-700 text-center">
            {error}
          </div>
        ) : data?.message === 'Out of stock' ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-red-500 text-center animate-in slide-in-from-bottom duration-500">
            <div className="text-5xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Out of Stock</h2>
            <p className="text-red-600 font-medium mb-4 uppercase tracking-wide italic">Sorry, this item is out of stock</p>
            <p className="text-gray-500 text-sm">Please check back later or contact support for more details.</p>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-green-500 animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                {data.product.imageUrl && (
                  <img src={data.product.imageUrl} alt={data.product.name} className="w-20 h-20 object-cover rounded-xl shadow-sm border border-gray-100" />
                )}
                <div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                    In Stock
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">{data.product.name}</h2>
                  <p className="text-sm text-gray-500">Code: {data.product.salecode}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-emerald-600">${data.product.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{data.product.description || 'No description provided.'}</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Category</span>
                <span className="text-gray-900 font-bold">{data.product.category || 'Uncategorized'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Available Units</span>
                <span className="text-gray-900 font-bold">{data.product.quantity}</span>
              </div>
            </div>

            {checkoutStatus && (
              <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${checkoutStatus.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {checkoutStatus.message}
              </div>
            )}

            <button 
              onClick={handleCheckout}
              disabled={data.product.quantity <= 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transform hover:scale-[1.02] transition-all shadow-lg active:scale-95 ${
                data.product.quantity <= 0 
                ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {data.product.quantity <= 0 ? 'Out of Stock' : 'Confirm Checkout (1 Unit)'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
