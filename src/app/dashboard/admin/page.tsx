'use client'

import React from 'react'
import { TrendingUp, Users, ShoppingCart, DollarSign, Activity, Map } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      
      {/* Sidebar (Mock) */}
      <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen hidden md:flex flex-col p-6">
        <h1 className="text-2xl font-bold text-white mb-10 tracking-tight">Cima<span className="text-blue-500">Facility</span></h1>
        
        <nav className="flex-1 space-y-2">
          <a href="#" className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20">
            <Activity className="w-5 h-5"/> Panel de Control
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors">
            <Map className="w-5 h-5"/> Despacho / Mapa
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors">
            <Users className="w-5 h-5"/> RRSS (CrewPulse)
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors">
            <ShoppingCart className="w-5 h-5"/> Amazon Afiliados
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Visión General Operativa</h2>
            <p className="text-slate-500">Temporada Alta 2026 - Maldonado & Punta del Este</p>
          </div>
          <button className="bg-slate-900 text-white font-bold px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Generar Reporte
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Ingresos (MRR)</p>
              <h3 className="text-3xl font-black text-slate-800">$18,450</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex justify-center items-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Margen Bruto</p>
              <h3 className="text-3xl font-black text-slate-800">42%</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex justify-center items-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Suscripciones Oro</p>
              <h3 className="text-3xl font-black text-slate-800">124</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex justify-center items-center">
              <Users className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Clics Afiliados</p>
              <h3 className="text-3xl font-black text-slate-800">892</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex justify-center items-center">
              <ShoppingCart className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Crews / Dispatching */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Estado de Cuadrillas en Tablero</h3>
                <span className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">4 Activas</span>
             </div>
             
             <div className="space-y-4">
                {/* Mock Crew Item */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">A</div>
                    <div>
                      <p className="font-bold text-slate-800">Equipo Alpha</p>
                      <p className="text-sm text-slate-500">En ruta (Windshield time): 12 mins. Destino: Bequeló</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      En Ruta
                    </span>
                  </div>
                </div>

                {/* Mock Crew Item */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">B</div>
                    <div>
                      <p className="font-bold text-slate-800">Equipo Bravo</p>
                      <p className="text-sm text-slate-500">Trabajando. Progreso Checklist: 100%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      Completado - Facturando
                    </span>
                  </div>
                </div>
             </div>
          </div>

          {/* Amazon Affiliate Tracker */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Embudo Cross-Selling</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">Impresiones (Página Confirmación)</span>
                  <span className="text-sm font-bold text-slate-900">1,200</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-slate-300 h-2 rounded-full w-full"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">Clics Salientes (Concrobium)</span>
                  <span className="text-sm font-bold text-slate-900">450</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-[40%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">Clics Salientes (Robot Limpiacristales)</span>
                  <span className="text-sm font-bold text-slate-900">312</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-[25%]"></div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <p className="text-sm text-indigo-800 font-medium italic">
                "Notamos un incremento del 12% en CTR al posicionar el Robot Limpiacristales en limpiezas de categoría 'Departamento alto'."
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
