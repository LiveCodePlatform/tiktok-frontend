import { useState } from 'react'
import { Minus, Plus, Loader2 } from 'lucide-react'
import { useToast } from '../Toast'
import productService from '../../services/productService'

function StockAdjuster({ productId, currentQuantity, onUpdate }) {
  const toast = useToast()
  const [value, setValue] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleAdjust = async (adjustment) => {
    if (isLoading) return

    const newValue = adjustment > 0 ? value : -value
    const newQuantity = currentQuantity + newValue

    if (newQuantity < 0) {
      toast.warning('Stock cannot go below zero')
      return
    }

    setIsLoading(true)
    try {
      const data = await productService.adjustStock(productId, newValue)
      if (data.success) {
        onUpdate(data.data)
        toast.success(`Stock ${adjustment > 0 ? 'added' : 'removed'} successfully`)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleAdjust(-1)}
        disabled={isLoading || currentQuantity <= 0}
        className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Remove stock"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Minus className="w-3.5 h-3.5" />}
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10)
          if (v > 0) setValue(v)
        }}
        className="w-12 text-center text-sm font-medium border border-gray-200 rounded-md py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        min="1"
      />
      <button
        onClick={() => handleAdjust(1)}
        disabled={isLoading}
        className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Add stock"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

export default StockAdjuster
