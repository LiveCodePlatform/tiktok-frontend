import { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import productService from '../../services/productService'

function EditProductModal({ product, isOpen, onClose, onSave }) {
  const [categories, setCategories] = useState([])
  const [showCustomCrossSellInput, setShowCustomCrossSellInput] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    productCode: '',
    category: '',
    sellingMethod: 'none',
    crossSellCategory: '',
    image: null,
  })
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const res = await productService.getCategories()
          setCategories(res.data || [])
        } catch (err) {
          console.error('Failed to fetch categories:', err)
        }
      }
      fetchCategories()
    }
  }, [isOpen])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        productCode: product.productCode || '',
        category: product.category || '',
        sellingMethod: product.sellingMethod || 'none',
        crossSellCategory: product.crossSellCategory || '',
        image: null,
      })
      setPreviewUrl(product.imageUrl || null)
      
      // Determine if target category is a custom input
      if (product.sellingMethod === 'cross-sell' && product.crossSellCategory) {
        const isStandard = categories.includes(product.crossSellCategory)
        setShowCustomCrossSellInput(!isStandard)
      } else {
        setShowCustomCrossSellInput(false)
      }
    }
  }, [product, categories])

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }))
    if (previewUrl && product?.imageUrl !== previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(product?.imageUrl || null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append('name', formData.name)
    data.append('price', formData.price)
    data.append('description', formData.description)
    data.append('productCode', formData.productCode)
    data.append('category', formData.category)
    data.append('sellingMethod', formData.sellingMethod)
    data.append('crossSellCategory', formData.crossSellCategory)
    if (formData.image) {
      data.append('image', formData.image)
    }
    onSave(product._id, data)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Image */}
          <div className="flex justify-center">
            {previewUrl ? (
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <label htmlFor="edit-image" className="text-white text-xs font-medium cursor-pointer">
                    Change
                  </label>
                </div>
              </div>
            ) : (
              <label
                htmlFor="edit-image"
                className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-[10px] text-gray-400">Add Image</span>
              </label>
            )}
            <input
              type="file"
              id="edit-image"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Fields */}
          <div>
            <label className="label">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Product Code</label>
              <input
                type="text"
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                className="input font-mono uppercase"
                required
              />
            </div>
            <div>
              <label className="label">Price (MMK)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input"
                step="1"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Selling Method</label>
              <select
                value={formData.sellingMethod}
                onChange={(e) => {
                  const val = e.target.value
                  setFormData(prev => ({ 
                    ...prev, 
                    sellingMethod: val,
                    crossSellCategory: val === 'cross-sell' ? prev.crossSellCategory : ''
                  }))
                  if (val !== 'cross-sell') {
                    setShowCustomCrossSellInput(false)
                  }
                }}
                className="input"
              >
                <option value="none">None</option>
                <option value="upsell">Up-selling</option>
                <option value="cross-sell">Cross-selling</option>
              </select>
            </div>
            {formData.sellingMethod === 'cross-sell' && (
              <div>
                <label className="label">Cross-sell Target Category</label>
                {!showCustomCrossSellInput ? (
                  <select
                    value={formData.crossSellCategory}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === '__custom__') {
                        setShowCustomCrossSellInput(true)
                        setFormData(prev => ({ ...prev, crossSellCategory: '' }))
                      } else {
                        setFormData(prev => ({ ...prev, crossSellCategory: val }))
                      }
                    }}
                    className="input"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__custom__">Or enter a new category...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.crossSellCategory}
                      onChange={(e) => setFormData({ ...formData, crossSellCategory: e.target.value })}
                      className="input"
                      placeholder="e.g. Accessories"
                      required
                    />
                    {categories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomCrossSellInput(false)
                          setFormData(prev => ({ ...prev, crossSellCategory: '' }))
                        }}
                        className="btn-secondary px-3"
                      >
                        List
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[80px] resize-y"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              <Upload className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProductModal
