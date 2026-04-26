import { useState } from 'react'
import StockAdjuster from '../../components/products/StockAdjuster'
import EditProductModal from '../../components/products/EditProductModal'
import productService from '../../services/productService'

function Inventory({ products, setProducts, isLoading, fetchProducts, showMessage }) {
  const [editingProduct, setEditingProduct] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  const handleUpdateProduct = async (id, updatedData) => {
    try {
      const data = await productService.updateProduct(id, updatedData)
      if (data.success) {
        setProducts(products.map(p => p._id === id ? data.data : p))
        showMessage('Product updated successfully!', 'success')
        setIsEditModalOpen(false)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      showMessage(`Update failed: ${errorMsg}`, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      const data = await productService.deleteProduct(id)
      if (data.success) {
        setProducts(products.filter(p => p._id !== id))
        showMessage('Product deleted successfully!', 'success')
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      showMessage(`Delete failed: ${errorMsg}`, 'error')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg font-semibold">Inventory List</h3>
        <button onClick={fetchProducts} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
          {isLoading ? 'Updating...' : 'Refresh List'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50 border-b">
              <th className="px-8 py-4">Image</th>
              <th className="px-8 py-4">Sale Code</th>
              <th className="px-8 py-4">Name</th>
              <th className="px-8 py-4">Category</th>
              <th className="px-8 py-4 text-right">Price</th>
              <th className="px-8 py-4 text-center">Stock Status</th>
              <th className="px-8 py-4 text-center">Quick Adjust</th>
              <th className="px-8 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-8 py-12 text-center text-gray-400">No products found. Add one from the dashboard!</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-4">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg shadow-sm border border-gray-100" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Img</div>
                    )}
                  </td>
                  <td className="px-8 py-4 font-mono text-sm font-semibold text-blue-600">{product.salecode}</td>
                  <td className="px-8 py-4 font-medium">{product.name}</td>
                  <td className="px-8 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{product.category || 'N/A'}</span></td>
                  <td className="px-8 py-4 text-right font-semibold text-emerald-600">${product.price.toLocaleString()}</td>
                  <td className="px-8 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex justify-center">
                      <StockAdjuster 
                        productId={product._id} 
                        currentQuantity={product.quantity} 
                        onUpdate={(updatedProduct) => {
                          setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p))
                        }} 
                      />
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <EditProductModal 
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateProduct}
      />
    </div>
  )
}

export default Inventory
