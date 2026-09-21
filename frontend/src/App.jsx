import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import LandingHero from './components/LandingHero'
import ChatInterface from './components/ChatInterface'
import DocumentUpload from './components/DocumentUpload'
import AnalyticsDashboard from './components/AnalyticsDashboard'

export default function App() {
  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/3 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingHero />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/documents" element={<DocumentUpload />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            backdropFilter: 'blur(16px)',
            borderRadius: '12px',
          }
        }}
      />
    </div>
  )
}
