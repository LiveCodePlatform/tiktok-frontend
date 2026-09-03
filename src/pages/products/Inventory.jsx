import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Plus,
  FileSpreadsheet,
  RefreshCw,
  ChevronDown,
  Eye,
  Package,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useToast } from '../../components/Toast'
import EditProductModal from '../../components/products/EditProductModal'
import ExcelImportModal from '../../components/products/ExcelImportModal'
import productService from '../../services/productService'

function Inventory() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isOtherCategoryOpen, setIsOtherCategoryOpen] = useState(false)
  const otherCategoryRef = useRef(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

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
            setCurrentPage(1)
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

  // Close other category dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (otherCategoryRef.current && !otherCategoryRef.current.contains(event.target)) {
        setIsOtherCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  const handleView = (product) => {
    setViewingProduct(product)
  }

  const handleUpdateProduct = async (id, updatedData) => {
    try {
      const data = await productService.updateProduct(id, updatedData)
      if (data.success) {
        setProducts(products.map((p) => (p._id === id ? data.data : p)))
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
        setProducts(products.filter((p) => p._id !== deleteId))
        setSelectedIds((prev) => prev.filter((id) => id !== deleteId))
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
          setProducts((prev) => prev.filter((p) => !deletedIds.includes(p._id)))
        } else {
          fetchProducts()
        }
        setSelectedIds([])
        setIsBulkDeleteModalOpen(false)

        if (blockedCount > 0) {
          toast.warning(
            `Deleted ${deletedCount} product(s). ${blockedCount} product(s) could not be deleted because they have associated customer orders.`
          )
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

  // Categories tabs setup
  // Show first 3 categories as direct tabs, others in dropdown
  const topCategories = categories.slice(0, 3)
  const otherCategories = categories.slice(3)
  const isOtherSelected = otherCategories.includes(selectedCategory)

  // Pagination calculations
  const totalStocks = products.length
  const totalPages = Math.ceil(totalStocks / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalStocks)
  const paginatedProducts = products.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0 animate-in fade-in duration-300">
      {/* Top Header Row - Fixed */}
      <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            Stock Management
          </h1>
        </div>

        {/* Right Search & Primary Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72 lg:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Product Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#ff5b00] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Excel Import Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-sm font-medium transition-colors"
            title="Import Products from Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Import Excel</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchProducts}
            className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Primary Add Stock Button */}
          <Link
            to="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5b00] hover:bg-[#e04e00] text-white font-medium rounded-xl text-sm transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Stock</span>
          </Link>
        </div>
      </div>

      {/* Category Tabs Row - Fixed */}
      <div className="flex-shrink-0 relative z-20 flex items-center gap-6 mb-4 pb-2 border-b border-gray-100 text-sm overflow-visible">
        <button
          onClick={() => {
            setSelectedCategory('')
            setCurrentPage(1)
          }}
          className={`font-medium transition-colors pb-2 -mb-2 whitespace-nowrap ${
            selectedCategory === ''
              ? 'text-gray-900 font-semibold border-b-2 border-[#ff5b00]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          All Categories
        </button>

        {topCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat)
              setCurrentPage(1)
            }}
            className={`font-medium transition-colors pb-2 -mb-2 whitespace-nowrap ${
              selectedCategory === cat
                ? 'text-gray-900 font-semibold border-b-2 border-[#ff5b00]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}

        {/* Other Categories Dropdown */}
        {otherCategories.length > 0 && (
          <div className="relative" ref={otherCategoryRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsOtherCategoryOpen((prev) => !prev)
              }}
              className={`inline-flex items-center gap-1 font-medium transition-colors pb-2 -mb-2 whitespace-nowrap ${
                isOtherSelected
                  ? 'text-gray-900 font-semibold border-b-2 border-[#ff5b00]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>{isOtherSelected ? selectedCategory : 'Other Categories'}</span>
              <ChevronDown className={`w-4 h-4 ml-0.5 text-gray-400 transition-transform duration-150 ${isOtherCategoryOpen ? 'rotate-180 text-gray-700' : ''}`} />
            </button>

            {isOtherCategoryOpen && (
              <div 
                className="absolute left-0 top-full mt-2 w-64 max-h-64 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
                  Select Category
                </div>
                {otherCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat)
                      setCurrentPage(1)
                      setIsOtherCategoryOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-orange-50 hover:text-[#ff5b00] transition-colors ${
                      selectedCategory === cat ? 'font-semibold text-[#ff5b00] bg-orange-50/60' : 'text-gray-700'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    {selectedCategory === cat && <Check className="w-4 h-4 text-[#ff5b00] flex-shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Stock Data Table Card - Flex-1 with internal scroll */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Scrollable Table Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider w-16 bg-white">
                  NO
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider bg-white">
                  PRODUCT NAME
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider bg-white">
                  CODE
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider bg-white">
                  QUANTITY
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider bg-white">
                  PRICE
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider bg-white">
                  STATUS
                </th>
                <th className="py-3.5 px-5 text-xs font-bold text-gray-900 uppercase tracking-wider text-center w-32 bg-white">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-[#ff5b00]" />
                      <span className="text-sm font-medium text-gray-500">Loading stocks...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 text-gray-400">
                        <Package className="w-7 h-7" />
                      </div>
                      <p className="text-base font-semibold text-gray-900">No stock records found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchQuery || selectedCategory
                          ? 'Try clearing your filters or search terms.'
                          : 'Get started by creating your first product.'}
                      </p>
                      <Link
                        to="/products/new"
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#ff5b00] text-white rounded-xl text-sm font-medium hover:bg-[#e04e00]"
                      >
                        <Plus className="w-4 h-4" /> Add Product
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product, idx) => {
                  const rowNumber = startIndex + idx + 1
                  const isLowStock = product.quantity > 0 && product.quantity <= 10
                  const isOutOfStock = product.quantity === 0
                  const inStock = product.quantity > 10

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-[#fcfcfc] transition-colors group"
                    >
                      {/* NO */}
                      <td className="py-4 px-5 text-gray-600 font-medium">{rowNumber}</td>

                      {/* PRODUCT NAME */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-9 h-9 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                            />
                          ) : null}
                          <div>
                            <span className="font-semibold text-gray-900 block leading-tight">
                              {product.name}
                            </span>
                            {product.category && (
                              <span className="text-xs text-gray-400 mt-0.5 block">
                                {product.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CODE */}
                      <td className="py-4 px-5 text-gray-700 font-mono font-medium">
                        {product.productCode}
                      </td>

                      {/* QUANTITY */}
                      <td className="py-4 px-5 text-gray-700 font-medium">
                        {product.quantity}
                      </td>

                      {/* PRICE */}
                      <td className="py-4 px-5 font-semibold text-gray-900">
                        {product.price?.toLocaleString()} MMK
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-5">
                        {inStock && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#059669]">
                            In Stock
                          </span>
                        )}
                        {isLowStock && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                            Low Stock ({product.quantity})
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">
                          {/* Orange Action (Edit / Manage) */}
                          <button
                            onClick={() => handleEdit(product)}
                            className="w-8 h-8 rounded-lg bg-[#ff5b00] hover:bg-[#e04e00] text-white flex items-center justify-center transition-colors shadow-sm"
                            title="Edit Product & Adjust Stock"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Peach Action (View Details) */}
                          <button
                            onClick={() => handleView(product)}
                            className="w-8 h-8 rounded-lg bg-[#fff2eb] hover:bg-[#ffe2d1] text-[#ff5b00] flex items-center justify-center transition-colors"
                            title="View Product Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete Action Button */}
                          <button
                            onClick={() => setDeleteId(product._id)}
                            className="w-8 h-8 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination & Footer Row - Fixed at bottom of Card */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-3 border-t border-gray-100 text-sm text-gray-500 bg-white">
          {/* Left: View Per Page */}
          <div className="flex items-center gap-2">
            <span>View</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          {/* Right: Stocks Count & Page Controls */}
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs sm:text-sm">
              {totalStocks === 0
                ? '0 stocks'
                : `${startIndex + 1} - ${endIndex} of ${totalStocks} stocks`}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-xs sm:text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i)
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#3b82f6] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalStocks === 0}
                className="px-2.5 py-1 text-xs sm:text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Product Details</h3>
              <button
                onClick={() => setViewingProduct(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                {viewingProduct.imageUrl ? (
                  <img
                    src={viewingProduct.imageUrl}
                    alt={viewingProduct.name}
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{viewingProduct.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-semibold text-[#ff5b00] bg-orange-50 px-2 py-0.5 rounded">
                      {viewingProduct.productCode}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {viewingProduct.category || 'General'}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#ff5b00] mt-2">
                    {viewingProduct.price?.toLocaleString()} MMK
                  </p>
                </div>
              </div>

              {viewingProduct.description && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Description
                  </span>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                    {viewingProduct.description}
                  </p>
                </div>
              )}

              {/* Variants / Sub-items */}
              {viewingProduct.variants && viewingProduct.variants.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Available Variants ({viewingProduct.variants.length})
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {viewingProduct.variants.map((variant, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-sm"
                      >
                        <span className="font-medium text-gray-800">{variant.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-gray-500">{variant.code}</span>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {variant.quantity} in stock
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setViewingProduct(null)
                  handleEdit(viewingProduct)
                }}
                className="px-4 py-2 bg-[#ff5b00] text-white rounded-xl text-sm font-medium hover:bg-[#e04e00] transition-colors"
              >
                Edit Product
              </button>
              <button
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
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

      {/* Edit Modal */}
      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateProduct}
      />

      {/* Excel Import Modal */}
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

