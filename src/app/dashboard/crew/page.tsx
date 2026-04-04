'use client'

import React, { useState } from 'react'
import { MapPin, Navigation, Camera, CheckSquare, Clock, AlertTriangle } from 'lucide-react'

// Mock Data
const todayShift = {
  id: 'shift-123',
  address: 'Torre Aqua, Apto 402, Punta del Este',
  time: '10:00 AM - 12:30 PM',
  client: 'Marcos Alonso',
  type: 'Limpieza Profunda (Plan Plata)',
  tasks: [
    { id: 1, name: 'Aspirado de rieles de ventanas', completed: true },
    { id: 2, name: 'Higienización bajo camas', completed: true },
    { id: 3, name: 'Desinfección de interruptores (EPA-approved)', completed: false },
    { id: 4, name: 'Limpieza de vidrios interiores', completed: false }
  ]
}

export default function CrewPulseDashboard() {
  const [tasks, setTasks] = useState(todayShift.tasks)

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)

  return (
    <div className="bg-slate-100 min-h-screen pb-10 text-slate-800 font-sans">
      
      {/* Header App-like */}
      <div className="bg-slate-900 text-white pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">CrewPulse</h1>
            <p className="text-slate-400 text-sm">Equipo Alpha • Turno Mañana</p>
          </div>
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border-2 border-emerald-500">
            <span className="font-bold text-lg">A</span>
          </div>
        </div>
        
        {/* Next Stop Card */}
        <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-inner">
          <div className="flex items-center gap-2 mb-1 text-sm font-bold tracking-widest uppercase text-blue-600">
            <Clock className="w-4 h-4" /> TRABAJO ACTUAL
          </div>
          <h2 className="text-xl font-bold mb-1">{todayShift.address}</h2>
          <p className="text-slate-500 font-medium mb-4">{todayShift.time} • {todayShift.type}</p>
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Navigation className="w-5 h-5" /> Navegar (Maps)
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 mt-6">
        
        {/* Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between mb-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-500" /> Lista de Verificación
            </h3>
            <span className="font-bold text-emerald-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6">
            <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="space-y-4">
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-colors ${task.completed ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100'}`}
              >
                <div className={`w-6 h-6 rounded-md flex justify-center items-center ${task.completed ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'}`}>
                  {task.completed && <CheckSquare className="w-4 h-4" />}
                </div>
                <span className={`flex-1 font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proof of Service (Camera) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-blue-500" /> Proof of Service (Fotos)
          </h3>
          <p className="text-sm text-slate-500 mb-4">Tomar fotografía de "Antes y Después" obligatoria para clientes extranjeros.</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-slate-100 transition-colors">
              <Camera className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-sm font-semibold">Antes</span>
            </button>
            <button className="border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-slate-100 transition-colors">
              <Camera className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-sm font-semibold">Después</span>
            </button>
          </div>
        </div>

        {/* Mantenimiento Preventivo (Reporte) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 bg-amber-50/30">
          <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" /> Reportar Anomalía
          </h3>
          <p className="text-sm text-amber-700 mb-4">Mantenimiento preventivo. ¿Has detectado fugas, hongos o humedad crítica?</p>
          <button className="w-full bg-white border border-amber-200 text-amber-700 font-bold py-3 px-4 rounded-xl transition-colors hover:bg-amber-100">
            Elevar Reporte al Admin
          </button>
        </div>

      </div>
    </div>
  )
}
