import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, ChevronDown, ChevronUp, FileText, Sparkles, Loader2, Brain, Search, AlertCircle, Lightbulb } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { sendMessage } from '../services/api'
import toast from 'react-hot-toast'

const suggestedPrompts = [
  { icon: Search, text: 'What are the common side effects of Metformin?', category: 'Drug Info' },
  { icon: AlertCircle, text: 'Check drug interactions between Warfarin and Aspirin', category: 'Interactions' },
  { icon: Brain, text: 'Summarize the clinical guidelines for diabetes management', category: 'Guidelines' },
  { icon: Lightbulb, text: 'What are the contraindications for ACE inhibitors?', category: 'Safety' },
]

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 px-6"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="glass rounded-2xl rounded-tl-md px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut'
              }}
              className="w-2 h-2 rounded-full bg-primary-400"
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function SourceCard({ source, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="glass-light rounded-xl p-3 text-xs"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <FileText className="w-3.5 h-3.5 text-primary-400" />
        <span className="font-medium text-slate-300 truncate">{source.document}</span>
        {source.page !== null && source.page !== undefined && (
          <span className="text-slate-500">p.{source.page + 1}</span>
        )}
      </div>
      <p className="text-slate-500 line-clamp-2 leading-relaxed mb-2">{source.snippet}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${source.relevance * 100}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`h-full rounded-full ${
              source.relevance >= 0.8 ? 'bg-emerald-400' :
              source.relevance >= 0.5 ? 'bg-amber-400' : 'bg-red-400'
            }`}
          />
        </div>
        <span className="text-slate-500 font-mono">{(source.relevance * 100).toFixed(0)}%</span>
      </div>
    </motion.div>
  )
}

function MessageBubble({ message, isUser }) {
  const [showSources, setShowSources] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        className="flex justify-end px-6"
      >
        <div className="max-w-[70%] flex items-start gap-3">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl rounded-tr-md px-5 py-3.5 shadow-lg shadow-primary-500/10">
            <p className="text-sm text-white leading-relaxed">{message.query}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-surface-700 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-slate-300" />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      className="flex items-start gap-3 px-6"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[75%] space-y-2">
        {/* Main Response */}
        <div className="glass rounded-2xl rounded-tl-md px-5 py-4 glow-sm">
          {/* Agent & Confidence Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
              message.agent_used === 'clinical_agent'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
            }`}>
              {message.agent_used === 'clinical_agent' ? '🧬 Clinical Agent' : '🔍 RAG Agent'}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
              message.confidence >= 0.8 ? 'bg-emerald-500/15 text-emerald-400' :
              message.confidence >= 0.5 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
            }`}>
              {(message.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>

          {/* Markdown Content */}
          <div className="markdown-body text-sm text-slate-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.response}</ReactMarkdown>
          </div>
        </div>

        {/* Source Citations Toggle */}
        {message.sources && message.sources.length > 0 && (
          <div>
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1"
            >
              <FileText className="w-3.5 h-3.5" />
              {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
              {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {showSources && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid gap-2 mt-1"
                >
                  {message.sources.map((source, idx) => (
                    <SourceCard key={idx} source={source} index={idx} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Reasoning Steps Toggle */}
        {message.reasoning_steps && message.reasoning_steps.length > 0 && (
          <div>
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1"
            >
              <Brain className="w-3.5 h-3.5" />
              View reasoning
              {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {showReasoning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-light rounded-xl p-3 mt-1"
                >
                  <ol className="space-y-1">
                    {message.reasoning_steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="text-primary-400 font-mono font-bold">{idx + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const query = input.trim()
    setInput('')
    setMessages(prev => [...prev, { type: 'user', query }])
    setIsLoading(true)

    try {
      const response = await sendMessage(query)
      setMessages(prev => [...prev, { type: 'ai', ...response }])
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to get response. Make sure the backend is running.')
      setMessages(prev => [...prev, {
        type: 'ai',
        response: 'Sorry, I encountered an error processing your request. Please check that the backend server is running and try again.',
        sources: [],
        confidence: 0,
        agent_used: 'system',
        reasoning_steps: ['Error occurred during processing']
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePromptClick = (prompt) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 glass">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Chat</h2>
            <p className="text-[11px] text-slate-500">Ask questions about your medical documents</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center justify-center px-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">How can I help you?</h3>
            <p className="text-sm text-slate-500 mb-8 text-center max-w-md">
              Upload medical documents first, then ask me anything about them. I'll retrieve relevant information and provide cited answers.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
              {suggestedPrompts.map((prompt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePromptClick(prompt.text)}
                  className="glass-light rounded-xl p-4 text-left group hover:border-primary-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <prompt.icon className="w-4 h-4 text-primary-400" />
                    <span className="text-[10px] font-semibold text-primary-400 uppercase tracking-wider">{prompt.category}</span>
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">{prompt.text}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} isUser={msg.type === 'user'} />
            ))}
          </>
        )}

        <AnimatePresence>
          {isLoading && <TypingIndicator />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-white/5 glass">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your medical documents..."
              rows={1}
              className="w-full bg-surface-800/50 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 resize-none transition-all duration-300"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <span className="absolute right-3 bottom-3 text-[10px] text-slate-600">
              {input.length}/2000
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
