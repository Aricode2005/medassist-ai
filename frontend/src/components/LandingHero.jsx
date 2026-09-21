import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Brain, FileSearch, Shield, Zap, Database, ArrowRight, Sparkles, Activity, Heart } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Multi-Agent AI',
    description: 'Intelligent orchestrator routes queries to specialized agents — RAG retrieval and clinical reasoning — for optimal responses.',
    gradient: 'from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-500/20'
  },
  {
    icon: FileSearch,
    title: 'RAG Pipeline',
    description: 'Advanced Retrieval-Augmented Generation with ChromaDB vector store ensures answers are grounded in your uploaded medical documents.',
    gradient: 'from-violet-500 to-purple-500',
    shadowColor: 'shadow-violet-500/20'
  },
  {
    icon: Shield,
    title: 'Clinical Reasoning',
    description: 'Specialized agent for drug interactions, symptom analysis, and guideline compliance with safety-first approach.',
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/20'
  }
]

const stats = [
  { icon: Zap, label: 'Real-time Analysis', value: 'Instant' },
  { icon: Database, label: 'Vector Search', value: 'Semantic' },
  { icon: Activity, label: 'Source Citations', value: 'Verified' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

const item = {
  hidden: { y: 30, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
}

export default function LandingHero() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto px-8 py-12"
    >
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div variants={item} className="flex justify-center mb-8">
          <div className="glass-light rounded-full px-4 py-1.5 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" />
            <span className="text-xs font-medium text-slate-300">Powered by Multi-Agent AI + RAG</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.div variants={item} className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
            <span className="text-white">Your </span>
            <span className="text-gradient">AI-Powered</span>
            <br />
            <span className="text-white">Clinical Document</span>
            <br />
            <span className="text-gradient">Assistant</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p variants={item} className="text-center text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload medical documents, clinical guidelines, and health records. Ask questions in natural language and get accurate, cited answers powered by AI agents.
        </motion.p>

        {/* CTA Button */}
        <motion.div variants={item} className="flex justify-center mb-16">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(42, 139, 255, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/chat')}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl text-white font-semibold text-lg shadow-2xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300"
          >
            <MessageSquare className="w-5 h-5" />
            Start Chatting
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-3 gap-4 mb-16 max-w-2xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-xl glass-light flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary-400" />
                </div>
              </div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div variants={item} className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="glass rounded-2xl p-6 group cursor-default"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Architecture Preview */}
        <motion.div variants={item} className="glass rounded-2xl p-8 mb-8">
          <h3 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">System Architecture</h3>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[
              { label: 'User Query', color: 'from-blue-500 to-blue-600' },
              { label: '→', isArrow: true },
              { label: 'Orchestrator', color: 'from-violet-500 to-purple-600' },
              { label: '→', isArrow: true },
              { label: 'RAG Agent', color: 'from-cyan-500 to-teal-600' },
              { label: '/', isArrow: true },
              { label: 'Clinical Agent', color: 'from-emerald-500 to-green-600' },
              { label: '→', isArrow: true },
              { label: 'Cited Response', color: 'from-amber-500 to-orange-600' },
            ].map((node, i) => (
              node.isArrow ? (
                <span key={i} className="text-slate-600 font-mono text-lg">{node.label}</span>
              ) : (
                <div key={i} className={`px-4 py-2 bg-gradient-to-r ${node.color} rounded-xl text-xs font-semibold text-white shadow-lg`}>
                  {node.label}
                </div>
              )
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
