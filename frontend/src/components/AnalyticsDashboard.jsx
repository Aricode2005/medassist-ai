import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, FileText, Zap, Bot, TrendingUp, Clock, RefreshCw } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getAnalytics } from '../services/api'

const AGENT_COLORS = {
  rag_agent: '#2a8bff',
  clinical_agent: '#10b981'
}

const PIE_COLORS = ['#2a8bff', '#10b981', '#8b5cf6', '#f59e0b']

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass rounded-xl p-5 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400">{label}</p>
        <p className="text-white font-semibold">{payload[0].value} queries</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      const data = await getAnalytics()
      setStats(data)
    } catch {
      // Backend might not be running
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 15000)
    return () => clearInterval(interval)
  }, [])

  // Generate mock chart data based on stats
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    queries: stats ? Math.max(0, Math.floor((stats.total_queries / 7) + (Math.random() - 0.5) * 3)) : 0
  }))

  const agentData = stats?.agent_usage
    ? Object.entries(stats.agent_usage).map(([name, value]) => ({
        name: name === 'rag_agent' ? 'RAG Agent' : 'Clinical Agent',
        value
      }))
    : []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto px-8 py-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h2>
            <p className="text-sm text-slate-400">Monitor your MedAssist AI usage and performance metrics.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadStats}
            className="w-10 h-10 rounded-xl glass-light flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={Zap} label="Total Queries" value={stats?.total_queries ?? 0} color="from-blue-500 to-blue-600" delay={0} />
          <StatCard icon={FileText} label="Documents" value={stats?.total_documents ?? 0} color="from-violet-500 to-purple-600" delay={0.1} />
          <StatCard icon={TrendingUp} label="Avg Confidence" value={stats ? `${(stats.avg_confidence * 100).toFixed(0)}%` : 'N/A'} color="from-emerald-500 to-teal-600" delay={0.2} />
          <StatCard icon={Bot} label="Active Agents" value="2" color="from-amber-500 to-orange-600" delay={0.3} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-2 glass rounded-xl p-6"
          >
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-400" />
              Query Volume
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="queryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2a8bff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2a8bff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="queries" stroke="#2a8bff" strokeWidth={2} fillOpacity={1} fill="url(#queryGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4 text-accent-400" />
              Agent Usage
            </h3>
            {agentData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={agentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {agentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {agentData.map((entry, idx) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[idx] }} />
                        <span className="text-slate-400">{entry.name}</span>
                      </div>
                      <span className="text-white font-semibold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-xs text-slate-600">No data yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-400" />
            Recent Queries
          </h3>
          {stats?.recent_activity && stats.recent_activity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Query</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Agent</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Confidence</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_activity.map((activity, idx) => (
                    <tr key={idx} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-[300px]">{activity.query}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          activity.agent === 'clinical_agent'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-primary-500/15 text-primary-400'
                        }`}>
                          {activity.agent === 'clinical_agent' ? 'Clinical' : 'RAG'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                activity.confidence >= 0.8 ? 'bg-emerald-400' :
                                activity.confidence >= 0.5 ? 'bg-amber-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${activity.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{(activity.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-600">No queries yet. Start chatting to see analytics!</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
