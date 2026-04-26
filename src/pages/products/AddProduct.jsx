import { useState } from 'react'
import productService from '../../services/productService'

function AddProduct({ onProductAdded, showMessage }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    quantity: '',
    salecode: '',
    category: '',
    image: null
  })

  const [previewUrl, setPreviewUrl] = useState(null)

  const handleInputChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0]
      if (file) {
        setFormData({ ...formData, image: file })
        setPreviewUrl(URL.createObjectURL(file))
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('price', formData.price)
      data.append('description', formData.description)
      data.append('quantity', formData.quantity)
      data.append('salecode', formData.salecode)
      data.append('category', formData.category)
      if (formData.image) {
        data.append('image', formData.image)
      }

      await productService.createProduct(data)
      
      // Reset form
      setFormData({ name: '', price: '', description: '', quantity: '', salecode: '', category: '', image: null })
      setPreviewUrl(null)
      
      // Reset file input manually
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''

      showMessage('Product added successfully!', 'success')
      if (onProductAdded) onProductAdded()
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      showMessage(`Error adding product: ${errorMsg}`, 'error')
    }
  }

  return (
    <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Add New Product</h3>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-wider">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          Inventory Entry
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Image Upload & Preview */}
        <div className="md:col-span-1 space-y-4">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-tight">Product Visual</label>
          <div className="relative group">
            {previewUrl ? (
              <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-50 shadow-inner group">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <label htmlFor="image-upload" className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white text-xs font-bold cursor-pointer hover:bg-white/30 transition-all">
                    Change Image
                  </label>
                </div>
              </div>
            ) : (
              <label htmlFor="image-upload" className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group/box">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover/box:scale-110 transition-transform">
                  <span className="text-2xl">📸</span>
                </div>
                <span className="text-sm font-bold text-gray-400 group-hover/box:text-blue-500 transition-colors">Upload Photo</span>
                <span className="text-[10px] text-gray-300 uppercase mt-1">PNG, JPG up to 10MB</span>
              </label>
            )}
            <input 
              type="file" 
              id="image-upload" 
              name="image" 
              onChange={handleInputChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>
        </div>

        {/* Right Columns: Form Fields */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300" placeholder="e.g. Wireless Mouse" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Sale Code</label>
            <input type="text" name="salecode" value={formData.salecode} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono uppercase placeholder:text-gray-300" placeholder="e.g. A001" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Price ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full p-3.5 pl-8 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300" placeholder="0.00" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Initial Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300" placeholder="0" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300" placeholder="e.g. Electronics" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300" placeholder="Enter product specifications and details..." rows="3"></textarea>
          </div>
          <div className="md:col-span-2 pt-2">
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transform hover:scale-[1.01] transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
              <span className="text-lg">✨</span> Create Product
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}

export default AddProduct
