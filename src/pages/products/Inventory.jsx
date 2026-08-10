import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Plus, RefreshCw, Package, Search } from 'lucide-react'
import { useToast } from '../../components/Toast'
import StockAdjuster from '../../components/products/StockAdjuster'
import EditProductModal from '../../components/products/EditProductModal'
import productService from '../../services/productService'

function Inventory() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await productService.getProducts(selectedCategory)
      setProducts(data.data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories()
      setCategories(data.data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        const performSearch = async () => {
          setIsLoading(true)
          try {
            const data = await productService.searchProducts(searchQuery.trim())
            setProducts(data.data || [])
          } catch (err) {
            console.error('Error searching products:', err)
          } finally {
            setIsLoading(false)
          }
        }
        performSearch()
      } else {
        fetchProducts()
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, selectedCategory])

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  const handleUpdateProduct = async (id, updatedData) => {
    try {
      const data = await productService.updateProduct(id, updatedData)
      if (data.success) {
        setProducts(products.map(p => p._id === id ? data.data : p))
        toast.success('Product updated successfully!')
        setIsEditModalOpen(false)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      toast.error(`Update failed: ${errorMsg}`)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const data = await productService.deleteProduct(deleteId)
      if (data.success) {
        setProducts(products.filter(p => p._id !== deleteId))
        toast.success('Product deleted successfully!')
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      toast.error(`Delete failed: ${errorMsg}`)
    } finally {
      setDeleteId(null)
    }
  }

  const filteredProducts = products

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Product Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 w-64 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 w-full"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button onClick={fetchProducts} className="btn-ghost text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link to="/products/new" className="btn-primary text-sm">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left table-cell">Product</th>
                <th className="text-left table-cell">Code</th>
                <th className="text-left table-cell">Category</th>
                <th className="text-right table-cell">Price</th>
                <th className="text-center table-cell">Stock</th>
                <th className="text-center table-cell">Adjust</th>
                <th className="text-center table-cell w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No products found</p>
                      <p className="text-sm text-gray-400 mt-1">Get started by adding a new product</p>
                      <Link to="/products/new" className="btn-primary mt-4 text-sm">
                        <Plus className="w-4 h-4" />
                        Add Product
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {product.productCode}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="badge-neutral">{product.category || 'N/A'}</span>
                    </td>
                    <td className="table-cell text-right font-semibold text-emerald-600">
                      {product.price?.toLocaleString()} MMK
                    </td>
                    <td className="table-cell text-center">
                      <span className={`badge ${
                        product.quantity > 10
                          ? 'badge-success'
                          : product.quantity > 0
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}>
                        {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-center">
                        <StockAdjuster
                          productId={product._id}
                          currentQuantity={product.quantity}
                          onUpdate={(updatedProduct) => {
                            setProducts(products.map(p =>
                              p._id === updatedProduct._id ? updatedProduct : p
                            ))
                          }}
                        />
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(product._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. The product will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-danger flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
