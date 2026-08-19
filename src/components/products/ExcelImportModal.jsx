import { useState, useRef } from 'react'
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  FileText,
  Trash2
} from 'lucide-react'
import productService from '../../services/productService'
import { useToast } from '../Toast'

function ExcelImportModal({ isOpen, onClose, onSuccess }) {
  const toast = useToast()
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [mode, setMode] = useState('upsert') // 'upsert' | 'insert_only'
  const [isLoading, setIsLoading] = useState(false)
  const [importResult, setImportResult] = useState(null)

  if (!isOpen) return null

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0]
    validateAndSetFile(selectedFile)
  }

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return

    const validExtensions = ['.xlsx', '.xls', '.csv']
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase()

    if (!validExtensions.includes(ext)) {
      toast.error('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file')
      return
    }

    setFile(selectedFile)
    setImportResult(null)
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadSampleTemplate = () => {
    const link = document.createElement('a')
    link.href = '/sample_products_template.xlsx'
    link.download = 'sample_products_template.xlsx'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to import')
      return
    }

    setIsLoading(true)
    try {
      const response = await productService.importExcel(file, mode)
      setImportResult(response.data)
      toast.success(response.message || 'Excel import processed successfully!')
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to import Excel file'
      toast.error(errorMsg)
      if (err.response?.data?.data) {
        setImportResult(err.response.data.data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    handleRemoveFile()
    setImportResult(null)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Import Products from Excel</h3>
              <p className="text-xs text-gray-500">Bulk upload or update products using .xlsx, .xls, or .csv</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!importResult ? (
            <>
              {/* Template Download Prompt */}
              <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-900">Need a sample file?</p>
                    <p className="text-xs text-blue-700">Download the formatted template with sample columns</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Template
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      Click to upload or drag & drop Excel file
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supports .xlsx, .xls, and .csv (Max: 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Import Mode Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Duplicate Product Code Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      mode === 'upsert'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value="upsert"
                      checked={mode === 'upsert'}
                      onChange={() => setMode('upsert')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="text-sm font-semibold">Update & Insert (Upsert)</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Updates existing products if code matches, and creates new ones.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      mode === 'insert_only'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value="insert_only"
                      checked={mode === 'insert_only'}
                      onChange={() => setMode('insert_only')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="text-sm font-semibold">Insert New Only</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Skips/rejects duplicates and only imports new product codes.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          ) : (
            /* Import Results Breakdown */
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-medium">Total Rows</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{importResult.totalRows || 0}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <p className="text-xs text-emerald-700 font-medium">Created</p>
                  <p className="text-xl font-bold text-emerald-600 mt-0.5">{importResult.createdCount || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <p className="text-xs text-blue-700 font-medium">Updated</p>
                  <p className="text-xl font-bold text-blue-600 mt-0.5">{importResult.updatedCount || 0}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-center">
                  <p className="text-xs text-red-700 font-medium">Failed</p>
                  <p className="text-xl font-bold text-red-600 mt-0.5">{importResult.failedCount || 0}</p>
                </div>
              </div>

              {/* Status Header Message */}
              <div
                className={`p-4 rounded-xl flex items-start gap-3 ${
                  importResult.failedCount === 0
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : importResult.successCount > 0
                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {importResult.failedCount === 0 ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold">
                    {importResult.failedCount === 0
                      ? 'Import completed successfully with no errors!'
                      : importResult.successCount > 0
                      ? 'Import finished with some errors reported below.'
                      : 'Import failed to process rows. Please check file format.'}
                  </p>
                  <p className="text-xs mt-0.5 opacity-90">
                    {importResult.successCount} of {importResult.totalRows} records successfully saved to database.
                  </p>
                </div>
              </div>

              {/* Error Details Table (if any) */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                    Error Log ({importResult.errors.length})
                  </h4>
                  <div className="border border-red-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-red-50/80 text-red-900 border-b border-red-100 sticky top-0">
                        <tr>
                          <th className="p-2.5 font-semibold w-16">Row</th>
                          <th className="p-2.5 font-semibold w-28">Product Code</th>
                          <th className="p-2.5 font-semibold">Error Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-50 bg-white">
                        {importResult.errors.map((err, idx) => (
                          <tr key={idx} className="hover:bg-red-50/40">
                            <td className="p-2.5 font-mono text-gray-600">{err.row}</td>
                            <td className="p-2.5 font-mono font-semibold text-red-700">{err.productCode || 'N/A'}</td>
                            <td className="p-2.5 text-red-600">{err.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          {!importResult ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isLoading}
                className="btn-primary text-sm flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Start Import
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary text-sm flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Import Another File
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary text-sm"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExcelImportModal
