import { useState } from 'react'
import { Link } from 'react-router-dom'
import orderService from '../../services/orderService'

function OrderSystem({ showMessage, fetchProducts }) {
  const [orderCheck, setOrderCheck] = useState({ salecode: '', result: null })
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckOrder = async () => {
    if (!orderCheck.salecode.trim()) return
    try {
      const data = await orderService.checkOrder(orderCheck.salecode)
      setOrderCheck({ ...orderCheck, result: data.data })
    } catch (err) {
      setOrderCheck({ ...orderCheck, result: err.response?.data || { message: 'Error checking order' } })
    }
  }

  const handleCheckout = async () => {
    if (!orderCheck.salecode.trim()) return
    setIsLoading(true)
    try {
      const data = await orderService.checkout({ 
        username: 'Dashboard User', 
        salecode: orderCheck.salecode 
      })
      showMessage(data.message, 'success')
      setOrderCheck({ 
        ...orderCheck, 
        result: data.data 
      })
      if (fetchProducts) fetchProducts()
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      showMessage(`Checkout failed: ${errorMsg}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom duration-500">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center">
        <h3 className="text-2xl font-bold mb-2">Order System</h3>
        <p className="text-gray-500 mb-8 text-sm">Check stock or place an order using sale codes.</p>
        
        <div className="max-w-md mx-auto mb-10 space-y-4">
          <input 
            type="text" 
            placeholder="Enter Code (e.g. A001 or A001=3)" 
            value={orderCheck.salecode} 
            onChange={(e) => setOrderCheck({ ...orderCheck, salecode: e.target.value })} 
            onKeyPress={(e) => e.key === 'Enter' && handleCheckOrder()}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center text-lg font-bold placeholder:font-normal placeholder:text-base uppercase"
          />
          <div className="flex gap-2">
            <button onClick={handleCheckOrder} className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
              Check Stock
            </button>
            <button onClick={handleCheckout} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95">
              {isLoading ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>

        {orderCheck.result && (
          <div className={`p-8 rounded-2xl border-2 transition-all transform animate-in zoom-in duration-300 ${
            (orderCheck.result.message === 'In stock' || orderCheck.result.message === 'Success' || orderCheck.result.message === 'Item is available')
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="text-4xl mb-4">
              {(orderCheck.result.message === 'In stock' || orderCheck.result.message === 'Success' || orderCheck.result.message === 'Item is available') ? '✅' : '❌'}
            </div>
            <h4 className="text-2xl font-black mb-2 uppercase tracking-tight">{orderCheck.result.message}</h4>
            
            {orderCheck.result.product && (
              <div className="mt-4 pt-4 border-t border-emerald-100/50 space-y-1">
                <p className="text-lg font-bold">{orderCheck.result.product.name}</p>
                <p className="text-sm opacity-80">Remaining Units: {orderCheck.result.product.quantity}</p>
                <Link 
                  to={`/order/${orderCheck.result.product.salecode}`}
                  className="mt-4 inline-block bg-white text-gray-800 px-4 py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-all border border-gray-100"
                >
                  View Order Page
                </Link>
              </div>
            )}

            {orderCheck.result._id && (
              <div className="mt-4 pt-4 border-t border-emerald-100/50 space-y-1">
                <p className="text-lg font-bold">Order Confirmed!</p>
                <p className="text-sm opacity-80">Total Price: ${orderCheck.result.totalPrice}</p>
                <p className="text-sm opacity-80">Order ID: {orderCheck.result._id}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderSystem
