'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Tag, CreditCard, LogOut, Settings, Bell, ShoppingBag, Package } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', href: '/admin/orders', icon: Package },
    { name: 'Offers', href: '/admin/offers', icon: Tag },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-accent/30 selection:text-white">
      
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/5 hidden md:flex flex-col">
        {/* Brand */}
        <div className="h-20 flex items-center px-8 border-b border-white/5 shrink-0">
           <Link href="/admin" className="flex items-center gap-2 group cursor-hover-target">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <span className="font-michroma text-zinc-900 font-bold text-xs">D</span>
              </div>
              <span className="font-michroma font-bold text-lg tracking-wider silver-text group-hover:drop-shadow-md transition-all">
                DOGE <span className="opacity-50 text-sm font-sans mx-1">/ CEO</span>
              </span>
           </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          <p className="text-xs font-bold font-michroma text-zinc-500 uppercase tracking-widest px-4 mb-4">Management</p>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-hover-target font-medium text-sm
                  ${isActive 
                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5 space-y-2 shrink-0">
           <button disabled className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 cursor-not-allowed transition-all w-full text-left text-sm font-medium" title="Coming Soon">
             <Settings className="w-5 h-5 text-zinc-600" />
             Settings (Soon)
           </button>
           <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-left text-sm font-medium group">
             <LogOut className="w-5 h-5 text-zinc-500 group-hover:text-red-400 transition-colors" />
             Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-8 z-10 sticky top-0 backdrop-blur-xl shrink-0">
           <div className="flex items-center gap-4">
              <h2 className="font-michroma font-bold text-xl tracking-wider capitalize">
                {pathname === '/admin' ? 'Dashboard Overview' : pathname.replace('/admin/', '').replace('-', ' ')}
              </h2>
           </div>
           
           <div className="flex items-center gap-6">
              <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors group">
                 <Bell className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full border border-black shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
              </button>
              
              <div className="h-8 w-px bg-white/10 mx-2"></div>
              
              {/* Profile */}
              <div className="flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white">Chief Executive</p>
                    <p className="text-xs text-zinc-400">carlos@doge.miami</p>
                 </div>
                 <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-zinc-800 flex items-center justify-center">
                    <span className="font-bold text-sm text-white">CE</span>
                 </div>
              </div>
           </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 isolate relative">
           {/* Subtle ambient light behind content */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-zinc-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
           {children}
        </div>
      </main>

    </div>
  )
}
