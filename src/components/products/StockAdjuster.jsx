import { useState } from 'react'
import productService from '../../services/productService'

function StockAdjuster({ productId, currentQuantity, onUpdate }) {
  const [value, setValue] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleAdjust = async (isAddition) => {
    const adjustmentValue = isAddition ? value : -value
    
    // Prevent negative result locally before even calling API
    if (!isAddition && currentQuantity < value) {
      alert("Cannot remove more than available stock")
      return
    }

    setLoading(true)
    try {
      const data = await productService.adjustStock(productId, adjustmentValue)
      
      if (data.success) {
        onUpdate(data.data) // Pass the updated product back
        setValue(1) // Reset input
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      alert(`Adjustment failed: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <div className="relative w-20">
        <input 
          type="number" 
          min="1"
          value={value}
          onChange={(e) => setValue(Math.max(1, parseInt(e.target.value) || 0))}
          className="w-full p-1.5 border border-gray-200 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={loading}
        />
      </div>
      
      <div className="flex gap-1">
        <button 
          onClick={() => handleAdjust(true)}
          disabled={loading}
          className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[32px]"
          title="Add Stock"
        >
          {loading ? <span className="animate-spin text-xs">🌀</span> : <span className="font-bold">+</span>}
        </button>
        <button 
          onClick={() => handleAdjust(false)}
          disabled={loading || currentQuantity === 0}
          className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[32px]"
          title="Remove Stock"
        >
          {loading ? <span className="animate-spin text-xs">🌀</span> : <span className="font-bold">-</span>}
        </button>
      </div>
    </div>
  )
}

export default StockAdjuster
