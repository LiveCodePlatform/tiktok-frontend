import { useState, useEffect } from 'react'
import productService from '../services/productService'
import AddProduct from './products/AddProduct'
import Inventory from './products/Inventory'
import OrderSystem from './orders/OrderSystem'
import OrderHistory from './orders/OrderHistory'

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'products' | 'check' | 'orders'
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' }) // type: 'success' | 'error'

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await productService.getProducts()
      setProducts(data.data)
    } catch (err) {
      console.error('Error fetching products:', err)
      showMessage('Error loading products.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="bg-blue-500 p-1 rounded">TK</span> Dashboard
          </h1>
        </div>
        <nav className="mt-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'products' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            Product Inventory
          </button>
          <button 
            onClick={() => setActiveTab('check')}
            className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'check' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            Order System
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${activeTab === 'orders' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            Order History
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto">
        <header className="bg-white border-b h-16 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-medium">
            {activeTab === 'dashboard' && 'Welcome Back'}
            {activeTab === 'products' && 'Product Inventory Management'}
            {activeTab === 'check' && 'Order System'}
            {activeTab === 'orders' && 'Customer Order History'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">v1.0.0</span>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg shadow-sm flex items-center border-l-4 ${message.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <AddProduct onProductAdded={fetchProducts} showMessage={showMessage} />
            </div>
          )}

          {activeTab === 'products' && (
            <Inventory 
              products={products} 
              setProducts={setProducts} 
              isLoading={isLoading} 
              fetchProducts={fetchProducts} 
              showMessage={showMessage} 
            />
          )}

          {activeTab === 'check' && (
            <OrderSystem 
              showMessage={showMessage} 
              fetchProducts={fetchProducts} 
            />
          )}

          {activeTab === 'orders' && <OrderHistory />}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
