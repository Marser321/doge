'use client'

import React from 'react'

export default function SettingsDashboard() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out space-y-8 pb-20">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-michroma font-bold text-white tracking-wide">Global Settings</h1>
            <p className="text-zinc-400 text-sm mt-1">Configure your platform preferences and integrations.</p>
          </div>
          <button 
            disabled
            className="px-6 py-3 flex items-center gap-2 rounded-xl bg-white text-zinc-900 font-bold hover:bg-zinc-200 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
       </div>

       <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6">
          <div className="border-b border-white/5 pb-4 mb-6">
             <h2 className="text-xl font-bold font-michroma text-white">🚧 Under Construction</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
             Global settings are currently being integrated. In a future update, you will be able to configure InsForge storage buckets, Stripe payment gateways, admin access control lists, and automated email branding directly from this panel.
          </p>
       </div>
    </div>
  )
}
