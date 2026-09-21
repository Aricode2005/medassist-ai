import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, MessageSquare, FileUp, BarChart3, Activity, Heart, Sparkles, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { getHealth } from '../services/api'

const navItems = [
  { path: '/', icon: Home, label: 'Home', exact: true },
  { path: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { path: '/documents', icon: FileUp, label: 'Documents' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function Sidebar() {
  const location = useLocation()
  const [health, setHealth] = useState(null)

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth(null))
    const interval = setInterval(() => {
      getHealth().then(setHealth).catch(() => setHealth(null))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-[260px] h-screen flex flex-col glass border-r border-white/5 relative z-10"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient">MedAssist AI</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Clinical Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">Navigation</p>
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path)
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="block"
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/10 text-white glow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] transition-colors ${
                  isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary-400" />
                )}
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-white/5">
        <div className="glass-light rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${health ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'} animate-pulse-slow`} />
            <span className="text-xs font-medium text-slate-400">
              {health ? 'System Online' : 'Offline'}
            </span>
          </div>
          {health && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Provider</span>
                <span className="text-slate-400">{health.llm_provider}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Documents</span>
                <span className="text-slate-400">{health.documents_loaded}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Vector DB</span>
                <span className="text-emerald-400">{health.vector_store_status}</span>
              </div>
            </div>
          )}
        </div>

        {/* Version */}
        <div className="flex items-center justify-center gap-1 mt-3">
          <Sparkles className="w-3 h-3 text-accent-400" />
          <span className="text-[10px] text-slate-600">v1.0.0 • Powered by AI</span>
        </div>
      </div>
    </motion.aside>
  )
}
