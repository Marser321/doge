'use client'

import React from 'react'
import { TrendingUp, Users, CreditCard, Activity, ArrowUpRight, Clock } from 'lucide-react'

export default function AdminDashboard() {
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
          { title: "Monthly Recurring Revenue", value: "$124,500", icon: TrendingUp, trend: "+14.5%", active: true },
          { title: "Active Subscriptions", value: "842", icon: CreditCard, trend: "+5.2%", active: false },
          { title: "Total Corporate Clients", value: "156", icon: Users, trend: "+12.1%", active: false },
          { title: "Service Request Vol.", value: "3,210", icon: Activity, trend: "+8.4%", active: false },
        ].map((kpi, index) => (
          <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 cursor-hover-target relative overflow-hidden group ${
            kpi.active ? "border-white/20 bg-white/5 shadow-[0_8px_32px_rgba(255,255,255,0.05)]" : "border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80"
          }`}>
             {kpi.active && <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>}
             <div className="flex justify-between items-start mb-6 relative">
               <div className={`p-3 rounded-xl ${kpi.active ? "bg-white text-zinc-900 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "bg-white/5 text-zinc-400 group-hover:text-white transition-colors border border-white/5"}`}>
                 <kpi.icon className="w-5 h-5" />
               </div>
               <span className="flex items-center gap-1 text-xs font-bold bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full border border-green-500/20">
                 <ArrowUpRight className="w-3 h-3" />
                 {kpi.trend}
               </span>
             </div>
             <div className="relative">
               <p className="text-zinc-400 text-sm font-medium mb-1">{kpi.title}</p>
               <p className="text-3xl font-michroma font-bold text-white tracking-tight">{kpi.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Recent Subscriptions Chart/List Area */}
         <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold font-michroma text-white">Recent Activity</h3>
               <button className="text-sm text-zinc-400 hover:text-white transition-colors">View All</button>
            </div>
            
            <div className="space-y-4">
               {[
                 { client: "Ocean View Tower Condos", plan: "Titanium Enterprise", status: "Active", time: "2 hours ago", amount: "$8,500/mo" },
                 { client: "Brickell Financial Hub", plan: "Black Corporate", status: "Active", time: "5 hours ago", amount: "$4,200/mo" },
                 { client: "Luxury Auto Dealership", plan: "Titanium Premium", status: "Pending", time: "1 day ago", amount: "$2,800/mo" },
                 { client: "South Beach Residences", plan: "Gold Standard", status: "Active", time: "1 day ago", amount: "$1,500/mo" },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-hover-target">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                          <span className="font-bold text-xs text-white">{item.client.charAt(0)}</span>
                       </div>
                       <div>
                         <p className="font-bold text-white text-sm">{item.client}</p>
                         <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                           <Clock className="w-3 h-3" /> {item.time} — {item.plan}
                         </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-michroma font-bold text-sm text-white mb-1">{item.amount}</p>
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                         item.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                       }`}>
                         {item.status}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Offers Performance Overview */}
         <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <h3 className="text-lg font-bold font-michroma text-white mb-8">Active Contextual Offers</h3>
            
            <div className="space-y-6">
               <div>
                  <div className="flex justify-between mb-2">
                     <span className="text-sm text-zinc-300 font-medium">Window Cleaning Robot</span>
                     <span className="text-sm font-bold text-white">45% Conv.</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                     <div className="bg-white h-full rounded-full w-[45%] relative">
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/50 animate-pulse"></div>
                     </div>
                  </div>
               </div>

               <div>
                  <div className="flex justify-between mb-2">
                     <span className="text-sm text-zinc-300 font-medium">Deep Sanitization</span>
                     <span className="text-sm font-bold text-white">28% Conv.</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                     <div className="bg-zinc-400 h-full rounded-full w-[28%]"></div>
                  </div>
               </div>

               <div>
                  <div className="flex justify-between mb-2">
                     <span className="text-sm text-zinc-300 font-medium">Aromatherapy Upgrade</span>
                     <span className="text-sm font-bold text-white">12% Conv.</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                     <div className="bg-zinc-600 h-full rounded-full w-[12%]"></div>
                  </div>
               </div>
            </div>

            <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5">
               <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                 <strong className="text-white">Insight:</strong> The Window Cleaning Robot add-on is performing exceptionally well with Titanium subscriptions.
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}
