import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useToast } from '../../components/Toast'
import productService from '../../services/productService'

function AddProduct() {
  const navigate = useNavigate()
  const toast = useToast()
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    quantity: '',
    productCode: '',
    category: '',
    image: null,
  })
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      setFormData(prev => ({ ...prev, image: file }))
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }))
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('price', formData.price)
      data.append('description', formData.description)
      data.append('quantity', formData.quantity)
      data.append('productCode', formData.productCode)
      data.append('category', formData.category)
      if (formData.image) {
        data.append('image', formData.image)
      }

      await productService.createProduct(data)

      setFormData({
        name: '', price: '', description: '', quantity: '',
        productCode: '', category: '', image: null,
      })
      removeImage()

      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''

      toast.success('Product created successfully!')
      navigate('/products')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      toast.error(`Failed to create product: ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
        <p className="text-sm text-gray-500 mt-1">Fill in the details to add a new product to inventory</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Upload */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <label className="label">Product Image</label>
              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-xl border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <label
                      htmlFor="image-upload"
                      className="px-4 py-2 bg-white/90 rounded-lg text-sm font-medium cursor-pointer hover:bg-white transition-colors"
                    >
                      Change Image
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <ImageIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Upload Photo</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                </label>
              )}
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="lg:col-span-2">
            <div className="card p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g. Wireless Mouse"
                    required
                  />
                </div>
                <div>
                  <label className="label">Product Code</label>
                  <input
                    type="text"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleInputChange}
                    className="input font-mono uppercase"
                    placeholder="e.g. A001"
                    required
                  />
                </div>
                <div>
                  <label className="label">Price (MMK)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="0.00"
                    step="1"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g. Electronics, Clothing"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input min-h-[100px] resize-y"
                  placeholder="Enter product details..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Create Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddProduct
