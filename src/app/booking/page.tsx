'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Sparkles, CheckCircle, ArrowRight, ArrowLeft, Info } from 'lucide-react'

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.4, ease: 'easeInOut' as any }
}

export default function BookingFlow() {
  const [step, setStep] = useState(1)
  const [subscription, setSubscription] = useState('plata') // bronce, plata, oro
  
  const [propertyData, setPropertyData] = useState({
    type: 'Departamento / Penthouse',
    sqm: 100,
    rooms: 1,
    baths: 1
  })

  const calculateBasePrice = () => {
    let base = 100
    if (propertyData.type.includes('Casa')) base = 150
    if (propertyData.type.includes('Comercial')) base = 200
    
    // Add value for surface and complexity
    const sqmPrice = (propertyData.sqm || 0) * 0.15
    const roomsPrice = ((propertyData.rooms || 0) + (propertyData.baths || 0)) * 10
    
    return base + sqmPrice + roomsPrice
  }

  const basePrice = Math.round(calculateBasePrice())
  
  const plans = [
    { id: 'bronce', name: 'Bronce', price: basePrice, freq: 'Mensual', color: 'amber', popular: false },
    { id: 'plata', name: 'Plata', price: Math.round(basePrice * 1.2), freq: 'Quincenal', color: 'blue', popular: true },
    { id: 'oro', name: 'Oro', price: Math.round(basePrice * 1.4), freq: 'Semanal', color: 'yellow', popular: false },
  ]
  const selectedPlan = plans.find(p => p.id === subscription) || plans[1]

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Mantenimiento de Élite</h1>
          <p className="text-xl text-slate-500 font-medium">
            Programe su servicio en Maldonado con precisión algorítmica.
          </p>
        </motion.div>

        {/* Stepper */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <motion.div 
                  animate={{ 
                    scale: step === s ? 1.2 : 1,
                    backgroundColor: step >= s ? '#2563eb' : '#e2e8f0',
                    color: step >= s ? '#ffffff' : '#64748b'
                  }}
                  className="flex items-center justify-center w-12 h-12 rounded-2xl font-black text-lg shadow-sm"
                >
                  {s}
                </motion.div>
                {s < 3 && (
                  <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: step > s ? '100%' : '0%' }}
                      className="h-full bg-blue-600"
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            {/* Step 1: Propiedad */}
            {step === 1 && (
              <motion.div 
                key="step1"
                {...stepVariants}
                className="p-12 flex-grow flex flex-col"
              >
                <div className="mb-10 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Detalles de la Propiedad</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Información Base</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold">
                    <Info className="w-4 h-4" /> Tarifa dinámica
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Tipo de Residencia</label>
                    <select 
                      value={propertyData.type}
                      onChange={e => setPropertyData({...propertyData, type: e.target.value})}
                      className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option>Departamento / Penthouse</option>
                      <option>Casa / Villa</option>
                      <option>Local Comercial Premium</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Superficie (m²)</label>
                    <input 
                      type="number" 
                      value={propertyData.sqm || ''}
                      onChange={e => setPropertyData({...propertyData, sqm: parseInt(e.target.value) || 0})}
                      placeholder="Ej: 150" 
                      className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Dormitorios</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={propertyData.rooms || ''}
                      onChange={e => setPropertyData({...propertyData, rooms: parseInt(e.target.value) || 0})}
                      className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Baños</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={propertyData.baths || ''}
                      onChange={e => setPropertyData({...propertyData, baths: parseInt(e.target.value) || 0})}
                      className="w-full border-2 border-slate-50 rounded-2xl px-6 py-4 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" 
                    />
                  </div>
                </div>
                
                <div className="mt-auto flex justify-between items-center pt-8 border-t border-slate-50">
                  <div className="text-slate-400 font-medium">Cotización base: <span className="font-black text-slate-900">${basePrice}</span></div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(2)} 
                    className="bg-slate-900 hover:bg-black text-white font-black py-5 px-10 rounded-2xl flex items-center transition-all shadow-xl shadow-slate-900/20"
                  >
                    Elegir Plan <ArrowRight className="ml-2 w-6 h-6" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Suscripciones */}
            {step === 2 && (
              <motion.div 
                key="step2"
                {...stepVariants}
                className="p-12 flex-grow flex flex-col"
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Plan de Membresía</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Ajustado para {propertyData.type}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {plans.map((plan) => (
                    <motion.div 
                      key={plan.id}
                      onClick={() => setSubscription(plan.id)}
                      whileHover={{ y: -5 }}
                      className={`relative cursor-pointer rounded-3xl border-2 p-6 transition-all h-full flex flex-col ${
                        subscription === plan.id 
                        ? `border-${plan.color === 'amber' ? 'amber' : plan.color === 'blue' ? 'blue' : 'yellow'}-600 bg-${plan.color === 'amber' ? 'amber' : plan.color === 'blue' ? 'blue' : 'yellow'}-50/30 ring-4 ring-${plan.color === 'amber' ? 'amber' : plan.color === 'blue' ? 'blue' : 'yellow'}-500/10` 
                        : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-md">Recomendado</div>
                      )}
                      <h3 className="text-xl font-black text-slate-800 mb-1">{plan.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{plan.freq}</p>
                      <ul className="space-y-3 mb-6 flex-grow">
                        <li className="flex items-start text-xs font-bold text-slate-600"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> Garantía de Precio</li>
                        {plan.id !== 'bronce' && <li className="flex items-start text-xs font-bold text-slate-600"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> Prioridad VIP</li>}
                      </ul>
                      <p className="text-3xl font-black text-slate-900">${plan.price}<span className="text-sm font-bold text-slate-400">/v</span></p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-auto flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-slate-400 font-black flex items-center hover:text-slate-600 transition-colors">
                    <ArrowLeft className="mr-2 w-5 h-5" /> Ubicación
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(3)} 
                    className="bg-slate-900 hover:bg-black text-white font-black py-5 px-10 rounded-2xl flex items-center transition-all shadow-xl shadow-slate-900/20"
                  >
                    Revisar & Pagar <ArrowRight className="ml-2 w-6 h-6" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Checkout Mock */}
            {step === 3 && (
              <motion.div 
                key="step3"
                {...stepVariants}
                className="p-12 flex-grow flex flex-col justify-center items-center text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-24 h-24 bg-blue-100 rounded-[32px] flex items-center justify-center mb-8"
                >
                  <Sparkles className="w-12 h-12 text-blue-600" />
                </motion.div>
                <h2 className="text-4xl font-black text-slate-900 mb-2">Experiencia Confirmada</h2>
                <p className="text-slate-500 font-medium mb-8 max-w-sm">
                  Su cuadrilla de élite ha sido reservada para un <strong>{propertyData.type}</strong> bajo la membresía <strong>{selectedPlan.name}</strong>.
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 w-full max-w-md mb-8 text-left">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-bold">Frecuencia:</span>
                    <span className="text-slate-900 font-black">{selectedPlan.freq}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-bold">Propiedad:</span>
                    <span className="text-slate-900 font-black">{propertyData.sqm}m² • {propertyData.rooms} Hab.</span>
                  </div>
                  <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Total por Visita</span>
                    <span className="text-3xl font-black text-blue-600">${selectedPlan.price}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                   <button onClick={() => setStep(2)} className="flex-1 text-slate-400 font-black py-5 px-8 hover:bg-slate-50 rounded-2xl transition-all">
                     Modificar
                   </button>
                   <motion.button 
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => window.location.href = '/booking/success'}
                     className="flex-3 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-10 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-blue-600/30"
                   >
                     Abonar & Agendar <ArrowRight className="ml-2 w-6 h-6" />
                   </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
