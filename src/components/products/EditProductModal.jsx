import { useState, useEffect } from 'react'

function EditProductModal({ product, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    salecode: '',
    category: '',
    image: null
  })

  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        salecode: product.salecode || '',
        category: product.category || '',
        image: null
      })
      setPreviewUrl(product.imageUrl || null)
    }
  }, [product])

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, image: file })
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const data = new FormData()
    data.append('name', formData.name)
    data.append('price', formData.price)
    data.append('description', formData.description)
    data.append('salecode', formData.salecode)
    data.append('category', formData.category)
    if (formData.image) {
      data.append('image', formData.image)
    }

    onSave(product._id, data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-center mb-4">
            {previewUrl ? (
              <div className="relative group">
                <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow-md border-2 border-blue-100" />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <label htmlFor="edit-image" className="text-white text-xs font-bold cursor-pointer">Change Image</label>
                </div>
              </div>
            ) : (
              <label htmlFor="edit-image" className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-2xl mb-1">🖼️</span>
                <span className="text-xs text-gray-500 font-medium">Add Image</span>
              </label>
            )}
            <input 
              type="file" 
              id="edit-image" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Sale Code</label>
              <input 
                type="text" 
                value={formData.salecode} 
                onChange={(e) => setFormData({...formData, salecode: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Price ($)</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
            <input 
              type="text" 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
            ></textarea>
          </div>
          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProductModal
