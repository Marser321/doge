'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Tag, CreditCard, LogOut, Bell, ShoppingBag, Package, Menu, X, ClipboardList, CalendarDays, Warehouse, UsersRound, Activity, Settings, Sparkles } from 'lucide-react'
import { apiRequest } from '@/lib/api-client'
import { getBrowserSupabase } from '@/lib/supabase/client'
import type { CurrentStaffUser, StaffRole } from '@/lib/types'
import CeoOnboardingTour from '@/components/admin/CeoOnboardingTour'

export default function AdminShell({ children, initialUser }: { children: React.ReactNode; initialUser: CurrentStaffUser }) {
  const pathname = usePathname()
  const router = useRouter()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [user, setUser] = useState<CurrentStaffUser | null>(initialUser)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const seen = localStorage.getItem('doge_ceo_tour_seen')
      if (!seen && initialUser.role === 'owner') {
        setIsTourOpen(true)
      }
    } catch {
      // Ignore localStorage unavailable
    }
  }, [initialUser.role])

  useEffect(() => {
    let active = true
    apiRequest<CurrentStaffUser>('/api/auth/me', { auth: 'required' })
      .then((identity) => {
        if (active) setUser(identity)
      })
      .catch(() => router.replace(`/login?next=${encodeURIComponent(pathname || '/admin')}`))
    return () => { active = false }
  }, [pathname, router])

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
      await getBrowserSupabase().auth.signOut()
    } catch (e) {
      console.error('Sign out error:', e)
    } finally {
      window.location.href = '/login'
    }
  }

  const navItems: Array<{ name: string; href: string; icon: typeof LayoutDashboard; roles: StaffRole[]; group: 'Operación' | 'Comercio' | 'Administración' }> = [
    { name: 'Resumen', href: '/admin', icon: LayoutDashboard, roles: ['owner', 'manager', 'dispatcher'], group: 'Operación' },
    { name: 'Solicitudes', href: '/admin/requests', icon: ClipboardList, roles: ['owner', 'manager', 'dispatcher'], group: 'Operación' },
    { name: 'Agenda', href: '/admin/calendar', icon: CalendarDays, roles: ['owner', 'manager', 'dispatcher'], group: 'Operación' },
    { name: 'Clientes', href: '/admin/clients', icon: Users, roles: ['owner', 'manager', 'dispatcher'], group: 'Operación' },
    { name: 'Suscripciones', href: '/admin/subscriptions', icon: CreditCard, roles: ['owner', 'manager'], group: 'Operación' },
    { name: 'Productos', href: '/admin/products', icon: ShoppingBag, roles: ['owner', 'manager'], group: 'Comercio' },
    { name: 'Inventario', href: '/admin/inventory', icon: Warehouse, roles: ['owner', 'manager', 'dispatcher'], group: 'Comercio' },
    { name: 'Órdenes', href: '/admin/orders', icon: Package, roles: ['owner', 'manager', 'dispatcher'], group: 'Comercio' },
    { name: 'Oportunidades', href: '/admin/intents', icon: Activity, roles: ['owner', 'manager', 'dispatcher'], group: 'Comercio' },
    { name: 'Ofertas', href: '/admin/offers', icon: Tag, roles: ['owner', 'manager'], group: 'Comercio' },
    { name: 'Equipo', href: '/admin/staff', icon: UsersRound, roles: ['owner', 'manager'], group: 'Administración' },
    { name: 'Configuración', href: '/admin/settings', icon: Settings, roles: ['owner', 'manager'], group: 'Administración' },
  ]
  const visibleNavItems = navItems.filter((item) => item.roles.includes(user?.role ?? initialUser.role))
  const navigationGroups = ['Operación', 'Comercio', 'Administración'] as const
  const renderNavigation = (mobile = false) => navigationGroups.map((group) => {
    const items = visibleNavItems.filter((item) => item.group === group)
    if (!items.length) return null
    return (
      <section key={group} className="space-y-1.5">
        <p className="px-4 pb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-600">{group}</p>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={mobile ? () => setIsMobileMenuOpen(false) : undefined}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 ${isActive
                ? 'border-white/10 bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                : 'border-transparent text-zinc-400 hover:border-white/5 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`size-4.5 ${isActive ? 'text-sky-200' : 'text-zinc-500'}`} />
              {item.name}
            </Link>
          )
        })}
      </section>
    )
  })

  if (!user) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-zinc-400">Verificando acceso seguro…</div>
  }

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
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-8">
          {renderNavigation()}
        </nav>

         {/* Footer actions */}
         <div className="p-4 border-t border-white/5 shrink-0">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-left text-sm font-medium group"
            >
              <LogOut className="w-5 h-5 text-zinc-500 group-hover:text-red-400 transition-colors" />
              Cerrar sesión
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

            <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-8">
              {renderNavigation(true)}
            </nav>

            <div className="p-4 border-t border-white/5 shrink-0">
               <button 
                 onClick={handleSignOut}
                 className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-left text-sm font-medium"
               >
                 <LogOut className="w-5 h-5 text-zinc-500" />
                 Cerrar sesión
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
                {pathname === '/admin' ? 'Resumen operativo' : pathname.replace('/admin/', '').replaceAll('-', ' ')}
              </h2>
           </div>
           
           <div className="flex items-center gap-3 md:gap-5">
              <button
                onClick={() => setIsTourOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-all hover:border-amber-400/50 hover:bg-amber-500/20 hover:text-white"
                title="Abrir guía interactiva para el CEO"
              >
                <Sparkles className="size-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Guía CEO</span>
              </button>

              <Link href="/admin/requests" aria-label="Ver solicitudes pendientes" className="relative p-2 rounded-full hover:bg-white/10 transition-colors group">
                 <Bell className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
              </Link>
              
              <div className="h-8 w-px bg-white/10 mx-1"></div>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                 <button 
                   onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                   className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-colors text-left"
                 >
                    <div className="text-right hidden sm:block">
                       <p className="text-sm font-bold text-white leading-tight">{user.display_name || user.role}</p>
                       <p className="text-xs text-zinc-400">{user.email || 'Cuenta protegida'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-zinc-800 flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                       <span className="font-bold text-sm text-white">{(user.display_name || user.email || 'D').slice(0, 2).toUpperCase()}</span>
                    </div>
                 </button>

                 {isProfileMenuOpen && (
                   <div className="absolute right-0 mt-3 w-52 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                     <div className="px-4 py-2 border-b border-white/5 sm:hidden mb-2">
                       <p className="text-sm font-bold text-white">{user.display_name || user.role}</p>
                       <p className="text-xs text-zinc-400 truncate">{user.email || 'Cuenta protegida'}</p>
                     </div>
                     <button
                       onClick={() => { setIsTourOpen(true); setIsProfileMenuOpen(false); }}
                       className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
                     >
                       <Sparkles className="w-4 h-4 text-amber-400" />
                       Abrir guía CEO
                     </button>
                     <div className="h-px bg-white/5 my-1" />
                     <button
                       onClick={handleSignOut}
                       className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                     >
                       <LogOut className="w-4 h-4" />
                       Cerrar sesión
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

      {/* Onboarding Tour for CEO / Owners */}
      <CeoOnboardingTour 
        isOpen={isTourOpen} 
        onClose={() => {
          setIsTourOpen(false)
          try {
            localStorage.setItem('doge_ceo_tour_seen', 'true')
          } catch {
            // Ignore
          }
        }} 
      />
    </div>
  )
}
