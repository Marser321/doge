'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Users, CreditCard, Activity, ArrowUpRight, Clock } from 'lucide-react'
import { db, KPISnapshot, Offer, Subscription } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale/es'

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KPISnapshot[]>([])
  const [recentActivity, setRecentActivity] = useState<{ subscriptions: Subscription[], orders: any[] }>({ subscriptions: [], orders: [] })
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [kpiRes, activityRes, offersRes] = await Promise.all([
          db.dashboard.getLatestKPIs(),
          db.dashboard.getRecentActivity(),
          db.offers.getAll()
        ])

        if (isMounted) {
          if (kpiRes.data) setKpis(kpiRes.data)
          setRecentActivity(activityRes)
          if (offersRes.data) setOffers(offersRes.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [])

  const getKPIValue = (name: string) => {
    const kpi = kpis.find(k => k.metric_name === name)
    if (!kpi) return { value: '0', trend: '0%' }
    
    const value = name === 'mrr' || name === 'store_revenue' 
      ? `$${kpi.metric_value.toLocaleString()}`
      : kpi.metric_value.toString()
      
    const trendValue = kpi.previous_value 
      ? ((kpi.metric_value - kpi.previous_value) / kpi.previous_value * 100).toFixed(1)
      : '0'
      
    return { value, trend: `${trendValue > '0' ? '+' : ''}${trendValue}%` }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <p className="text-zinc-400 mb-1 text-sm font-medium">Welcome back, Carlos.</p>
           <h1 className="text-3xl font-michroma font-bold silver-text">Platform Overview</h1>
        </div>
        <div className="flex gap-3">
           <button className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all text-sm cursor-hover-target shadow-lg shadow-black/20">
             Download Report
           </button>
           <button className="px-5 py-2.5 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm cursor-hover-target shadow-[0_0_20px_rgba(255,255,255,0.3)]">
             View Live Map
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Monthly Recurring Revenue", name: 'mrr', icon: TrendingUp, active: true },
          { title: "Active Subscriptions", name: 'active_subscriptions', icon: CreditCard, active: false },
          { title: "Total Corporate Clients", name: 'total_clients', icon: Users, active: false },
          { title: "Service Request Vol.", name: 'service_volume', icon: Activity, active: false },
        ].map((kpiConfig, index) => {
          const stats = getKPIValue(kpiConfig.name)
          return (
            <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 cursor-hover-target relative overflow-hidden group ${
              kpiConfig.active ? "border-white/20 bg-white/5 shadow-[0_8px_32px_rgba(255,255,255,0.05)]" : "border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80"
            }`}>
               {kpiConfig.active && <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>}
               <div className="flex justify-between items-start mb-6 relative">
                 <div className={`p-3 rounded-xl ${kpiConfig.active ? "bg-white text-zinc-900 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-white/5 text-zinc-400 group-hover:text-white transition-colors border border-white/5"}`}>
                   <kpiConfig.icon className="w-5 h-5" />
                 </div>
                 <span className="flex items-center gap-1 text-xs font-bold bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full border border-green-500/20">
                   <ArrowUpRight className="w-3 h-3" />
                   {stats.trend}
                 </span>
               </div>
               <div className="relative">
                 <p className="text-zinc-400 text-sm font-medium mb-1">{kpiConfig.title}</p>
                 <p className="text-3xl font-michroma font-bold text-white tracking-tight">{stats.value}</p>
               </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Recent Activity Area */}
         <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold font-michroma text-white">Recent Activity</h3>
               <button className="text-sm text-zinc-400 hover:text-white transition-colors">View All</button>
            </div>
            
            <div className="space-y-4">
               {recentActivity.subscriptions.length > 0 ? recentActivity.subscriptions.map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-hover-target">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                          <span className="font-bold text-xs text-white">{(item.client as any)?.name?.charAt(0) || 'S'}</span>
                       </div>
                       <div>
                         <p className="font-bold text-white text-sm">{(item.client as any)?.name || 'New Client'}</p>
                         <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                           <Clock className="w-3 h-3" /> 
                           {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })} 
                           — {(item.tier as any)?.name || 'Suscriptor'}
                         </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-michroma font-bold text-sm text-white mb-1">${item.mrr.toLocaleString()}/mo</p>
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                         item.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                       }`}>
                         {item.status}
                       </span>
                    </div>
                 </div>
               )) : (
                 <div className="text-center py-8 text-zinc-500 text-sm">No recent activity found.</div>
               )}
            </div>
         </div>

         {/* Offers Performance Overview */}
         <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <h3 className="text-lg font-bold font-michroma text-white mb-8">Active Contextual Offers</h3>
            
            <div className="space-y-6">
               {offers.slice(0, 3).map((offer, i) => {
                 // Simulate conversion rate based on usage vs max_uses or random seed for aesthetic
                 const convRate = offer.max_uses ? (offer.usage_count / offer.max_uses * 100).toFixed(0) : "45";
                 return (
                   <div key={offer.id}>
                      <div className="flex justify-between mb-2">
                         <span className="text-sm text-zinc-300 font-medium">{offer.title}</span>
                         <span className="text-sm font-bold text-white">{convRate}% Conv.</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                         <div 
                           className={`h-full rounded-full relative transition-all duration-1000 ${i === 0 ? 'bg-white' : i === 1 ? 'bg-zinc-400' : 'bg-zinc-600'}`}
                           style={{ width: `${convRate}%` }}
                         >
                            {i === 0 && <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/50 animate-pulse"></div>}
                         </div>
                      </div>
                   </div>
                 )
               })}
               
               {offers.length === 0 && (
                 <div className="text-center py-4 text-zinc-500 text-sm">No active offers.</div>
               )}
            </div>

            <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5">
               <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                 <strong className="text-white">Insight:</strong> {offers.length > 0 ? `The ${offers[0].title} is performing as expected with recent clients.` : 'Launch a new offer to start tracking conversion performance.'}
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}
