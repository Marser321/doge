'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Tag, CreditCard, LogOut, Settings, Bell, ShoppingBag, Package, Menu, X } from 'lucide-react'
import { insforge } from '@/lib/insforge'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  
  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    try {
      await insforge.auth.signOut()
    } catch (e) {
      console.error('Sign out error:', e)
    } finally {
      window.location.href = '/login'
    }
  }

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
            <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all w-full text-left text-sm font-medium group">
              <Settings className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
              Settings
            </Link>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-left text-sm font-medium group"
            >
              <LogOut className="w-5 h-5 text-zinc-500 group-hover:text-red-400 transition-colors" />
              Sign Out
            </button>
         </div>
      </aside>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Sidebar */}
          <aside className="w-[280px] h-full glass-panel border-r border-white/5 flex flex-col relative animate-in slide-in-from-left-full duration-300">
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
               <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                    <span className="font-michroma text-zinc-900 font-bold text-xs">D</span>
                  </div>
                  <span className="font-michroma font-bold text-lg tracking-wider silver-text">
                    DOGE <span className="opacity-50 text-sm font-sans mx-1">/ CEO</span>
                  </span>
               </Link>
               <button 
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>

            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
              <p className="text-xs font-bold font-michroma text-zinc-500 uppercase tracking-widest px-4 mb-4">Management</p>
              
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                const Icon = item.icon

                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm
                      ${isActive 
                        ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10' 
                        : 'text-zinc-400 border border-transparent'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2 shrink-0">
               <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all w-full text-left text-sm font-medium">
                 <Settings className="w-5 h-5 text-zinc-500" />
                 Settings
               </Link>
               <button 
                 onClick={handleSignOut}
                 className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-left text-sm font-medium"
               >
                 <LogOut className="w-5 h-5 text-zinc-500" />
                 Sign Out
               </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 backdrop-blur-xl shrink-0">
           <div className="flex items-center gap-3 md:gap-4">
              <button 
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="p-2 -ml-2 text-zinc-400 hover:text-white md:hidden transition-colors"
              >
                 <Menu className="w-6 h-6" />
              </button>
              <h2 className="font-michroma font-bold text-lg md:text-xl tracking-wider capitalize truncate">
                {pathname === '/admin' ? 'Dashboard Overview' : pathname.replace('/admin/', '').replace('-', ' ')}
              </h2>
           </div>
           
           <div className="flex items-center gap-4 md:gap-6">
              <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors group">
                 <Bell className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full border border-black shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
              </button>
              
              <div className="h-8 w-px bg-white/10 mx-1 md:mx-2"></div>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                 <button 
                   onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                   className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-colors text-left"
                 >
                    <div className="text-right hidden sm:block">
                       <p className="text-sm font-bold text-white leading-tight">Chief Executive</p>
                       <p className="text-xs text-zinc-400">carlos@doge.miami</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-zinc-800 flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                       <span className="font-bold text-sm text-white">CE</span>
                    </div>
                 </button>

                 {isProfileMenuOpen && (
                   <div className="absolute right-0 mt-3 w-48 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                     <div className="px-4 py-2 border-b border-white/5 sm:hidden mb-2">
                       <p className="text-sm font-bold text-white">Chief Executive</p>
                       <p className="text-xs text-zinc-400 truncate">carlos@doge.miami</p>
                     </div>
                     <Link
                       href="/admin/settings"
                       onClick={() => setIsProfileMenuOpen(false)}
                       className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                     >
                       <Settings className="w-4 h-4" />
                       Settings
                     </Link>
                     <button
                       onClick={handleSignOut}
                       className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                     >
                       <LogOut className="w-4 h-4" />
                       Sign Out
                     </button>
                   </div>
                 )}
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
