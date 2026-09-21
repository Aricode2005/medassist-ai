import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, File, Trash2, CheckCircle, AlertCircle, Loader2, HardDrive, FileType, X } from 'lucide-react'
import { uploadDocument, getDocuments, deleteDocument } from '../services/api'
import toast from 'react-hot-toast'

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function DocumentCard({ doc, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteDocument(doc.id)
      onDelete(doc.id)
      toast.success('Document deleted')
    } catch {
      toast.error('Failed to delete document')
    } finally {
      setDeleting(false)
    }
  }

  const typeColors = {
    pdf: 'bg-red-500/15 text-red-400 border-red-500/20',
    txt: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    csv: 'bg-green-500/15 text-green-400 border-green-500/20',
    md: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  }

  const statusConfig = {
    ready: { icon: CheckCircle, color: 'text-emerald-400', label: 'Ready' },
    processing: { icon: Loader2, color: 'text-amber-400', label: 'Processing', animate: true },
    error: { icon: AlertCircle, color: 'text-red-400', label: 'Error' },
  }

  const status = statusConfig[doc.status] || statusConfig.ready

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: -20 }}
      whileHover={{ y: -2 }}
      className="glass rounded-xl p-4 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{doc.filename}</h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${typeColors[doc.file_type] || typeColors.txt}`}>
                {doc.file_type}
              </span>
              <span className="text-[11px] text-slate-500">{formatFileSize(doc.file_size)}</span>
              <span className="text-[11px] text-slate-500">•</span>
              <span className="text-[11px] text-slate-500">{doc.num_chunks} chunks</span>
              <span className="text-[11px] text-slate-500">•</span>
              <div className="flex items-center gap-1">
                <status.icon className={`w-3 h-3 ${status.color} ${status.animate ? 'animate-spin' : ''}`} />
                <span className={`text-[11px] ${status.color}`}>{status.label}</span>
              </div>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function DocumentUpload() {
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadingFile, setUploadingFile] = useState('')

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const data = await getDocuments()
      setDocuments(data.documents || [])
    } catch {
      // Backend might not be running
    }
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      setUploading(true)
      setUploadingFile(file.name)
      setProgress(0)
      try {
        const doc = await uploadDocument(file, setProgress)
        setDocuments(prev => [doc, ...prev])
        toast.success(`${file.name} uploaded successfully!`)
      } catch (error) {
        toast.error(error.response?.data?.detail || `Failed to upload ${file.name}`)
      }
    }
    setUploading(false)
    setUploadingFile('')
    setProgress(0)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'text/markdown': ['.md'],
    },
    maxSize: 10 * 1024 * 1024,
    disabled: uploading
  })

  const handleDelete = (docId) => {
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto px-8 py-8"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Document Management</h2>
          <p className="text-sm text-slate-400">Upload medical documents to build your knowledge base. Supported formats: PDF, TXT, CSV, Markdown.</p>
        </div>

        {/* Upload Area */}
        <motion.div
          whileHover={{ scale: uploading ? 1 : 1.01 }}
          className="mb-8"
        >
          <div
            {...getRootProps()}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-primary-400 bg-primary-500/5 shadow-lg shadow-primary-500/10'
                : uploading
                  ? 'border-amber-500/30 bg-amber-500/5 cursor-wait'
                  : 'border-white/10 hover:border-primary-500/30 hover:bg-primary-500/5'
            }`}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-primary-400 mx-auto animate-spin" />
                <div>
                  <p className="text-sm font-medium text-white">Uploading {uploadingFile}...</p>
                  <p className="text-xs text-slate-500 mt-1">Processing and creating embeddings</p>
                </div>
                <div className="w-64 mx-auto">
                  <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{progress}%</p>
                </div>
              </div>
            ) : isDragActive ? (
              <div className="space-y-3">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Upload className="w-12 h-12 text-primary-400 mx-auto" />
                </motion.div>
                <p className="text-sm font-medium text-primary-400">Drop your files here!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Drag & drop your medical documents</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse files</p>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {['.PDF', '.TXT', '.CSV', '.MD'].map(ext => (
                    <span key={ext} className="px-2 py-1 glass-light rounded-md text-[10px] font-semibold text-slate-400">{ext}</span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-2">Maximum file size: 10MB</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Document List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-500" />
              Uploaded Documents
              <span className="px-1.5 py-0.5 bg-surface-800 rounded-md text-[10px] text-slate-500">{documents.length}</span>
            </h3>
          </div>

          {documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-800/30 flex items-center justify-center mx-auto mb-4">
                <File className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-sm text-slate-600">No documents uploaded yet</p>
              <p className="text-xs text-slate-700 mt-1">Upload medical documents to get started</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {documents.map(doc => (
                  <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
