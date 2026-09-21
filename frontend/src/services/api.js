import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Chat API
export const sendMessage = async (query, conversationId = null) => {
  const { data } = await api.post('/api/chat', { query, conversation_id: conversationId })
  return data
}

export const getChatHistory = async (limit = 50) => {
  const { data } = await api.get(`/api/chat/history?limit=${limit}`)
  return data
}

// Document API
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    }
  })
  return data
}

export const getDocuments = async () => {
  const { data } = await api.get('/api/documents')
  return data
}

export const deleteDocument = async (docId) => {
  const { data } = await api.delete(`/api/documents/${docId}`)
  return data
}

// Analytics API
export const getAnalytics = async () => {
  const { data } = await api.get('/api/analytics/stats')
  return data
}

// Health API
export const getHealth = async () => {
  const { data } = await api.get('/api/health')
  return data
}
