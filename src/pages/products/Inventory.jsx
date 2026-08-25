import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Plus, RefreshCw, Package, Search, FileSpreadsheet, AlertTriangle, Loader2, X } from 'lucide-react'
import { useToast } from '../../components/Toast'
import StockAdjuster from '../../components/products/StockAdjuster'
import EditProductModal from '../../components/products/EditProductModal'
import ExcelImportModal from '../../components/products/ExcelImportModal'
import productService from '../../services/productService'

function Inventory() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const selectAllCheckboxRef = useRef(null)

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

  // Sync indeterminate state for master checkbox
  const isAllSelected = products.length > 0 && products.every(p => selectedIds.includes(p._id))
  const isSomeSelected = products.some(p => selectedIds.includes(p._id)) && !isAllSelected

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isSomeSelected
    }
  }, [isSomeSelected])

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map(p => p._id))
    }
  }

  const handleToggleSelectProduct = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

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
        setSelectedIds(prev => prev.filter(id => id !== deleteId))
        toast.success('Product deleted successfully!')
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      toast.error(`Delete failed: ${errorMsg}`)
    } finally {
      setDeleteId(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    setIsBulkDeleting(true)
    try {
      const res = await productService.bulkDeleteProducts(selectedIds)
      if (res.success) {
        const { deletedCount, blockedCount, deletedIds } = res.data || {}
        if (deletedIds && deletedIds.length > 0) {
          setProducts(prev => prev.filter(p => !deletedIds.includes(p._id)))
        } else {
          fetchProducts()
        }
        setSelectedIds([])
        setIsBulkDeleteModalOpen(false)

        if (blockedCount > 0) {
          toast.warning(`Deleted ${deletedCount} product(s). ${blockedCount} product(s) could not be deleted because they have associated customer orders.`)
        } else {
          toast.success(`Successfully deleted ${deletedCount || selectedIds.length} product(s)!`)
        }
        fetchCategories()
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      toast.error(`Bulk delete failed: ${errorMsg}`)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const filteredProducts = products

  return (
    <div className="animate-in fade-in duration-300 relative pb-16">
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
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Import Excel
          </button>
          <Link to="/products/new" className="btn-primary text-sm">
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="card overflow-hidden border border-gray-200 shadow-sm rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header bg-gray-50/80 border-b border-gray-200">
                <th className="table-cell w-12 text-center">
                  <input
                    type="checkbox"
                    ref={selectAllCheckboxRef}
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    disabled={products.length === 0}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-40"
                    title="Select all visible products"
                  />
                </th>
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
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No products found</p>
                      <p className="text-sm text-gray-400 mt-1">Get started by adding a new product or importing from Excel</p>
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => setIsImportModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          Import Excel
                        </button>
                        <Link to="/products/new" className="btn-primary text-sm">
                          <Plus className="w-4 h-4" />
                          Add Product
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isSelected = selectedIds.includes(product._id)
                  return (
                    <tr
                      key={product._id}
                      className={`transition-colors group ${
                        isSelected ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <td className="table-cell text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProduct(product._id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-900 block">{product.name}</span>
                            {product.description && (
                              <span className="text-xs text-gray-400 line-clamp-1">{product.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
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
              product{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="h-4 w-px bg-gray-700"></div>

          <div className="flex items-center gap-2">
            {selectedIds.length < products.length && (
              <button
                onClick={() => setSelectedIds(products.map(p => p._id))}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded hover:bg-white/5 transition-colors"
              >
                Select all {products.length}
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

          <button
            onClick={() => setIsBulkDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-xl transition-all shadow-md hover:shadow-red-600/25 ml-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedIds.length})
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

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200 border border-gray-100">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete {selectedIds.length} Selected Product{selectedIds.length > 1 ? 's' : ''}?
              </h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                You are about to permanently delete <strong className="text-gray-800">{selectedIds.length}</strong> product{selectedIds.length > 1 ? 's' : ''}. This action cannot be undone.
              </p>
              
              <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-left mb-6 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-normal">
                  <strong>Safety Notice:</strong> Any product linked to past customer orders will be automatically skipped and preserved in your system.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  disabled={isBulkDeleting}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="btn-danger flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isBulkDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete {selectedIds.length} Product{selectedIds.length > 1 ? 's' : ''}
                    </>
                  )}
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

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchProducts()
          fetchCategories()
        }}
      />
    </div>
  )
}

export default Inventory
