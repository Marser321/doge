'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, ArrowLeft, ShieldCheck, Building2, Zap } from 'lucide-react'
import Link from 'next/link'
import { useMagnetic } from '@/hooks/useMagnetic'

const HAPTIC_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]

const stepVariants = {
  initial: { opacity: 0, y: 10, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(10px)" },
  transition: { duration: 0.8, ease: HAPTIC_EASE } // Haptic easing
}

export default function BookingFlow() {
  const [step, setStep] = useState(1)
  const [subscription, setSubscription] = useState('plata')
  
  const [propertyData, setPropertyData] = useState({
    type: 'Penthouse / Residencial VIP',
    sqm: 1500, // sqft for US market
    rooms: 3,
    baths: 2
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem('doge-theme') as 'dark' | 'light';
    if (savedTheme) {
      document.documentElement.dataset.theme = savedTheme;
    }
  }, []);

  const calculateBasePrice = () => {
    let base = 250 // Miami base price
    if (propertyData.type.includes('Villa')) base = 400
    if (propertyData.type.includes('Comercial')) base = 500
    
    const sqmPrice = (propertyData.sqm || 0) * 0.10
    const roomsPrice = ((propertyData.rooms || 0) + (propertyData.baths || 0)) * 25
    
    return base + sqmPrice + roomsPrice
  }

  const basePrice = Math.round(calculateBasePrice())
  
  const plans = [
    { id: 'bronce', name: 'Bronce', price: basePrice, freq: 'Mensual', popular: false },
    { id: 'plata', name: 'Plata', price: Math.round(basePrice * 1.2), freq: 'Quincenal', popular: true },
    { id: 'oro', name: 'Oro VIP', price: Math.round(basePrice * 1.4), freq: 'Semanal', popular: false },
  ]
  const selectedPlan = plans.find(p => p.id === subscription) || plans[1]

  const { ref: magneticRef, magneticProps } = useMagnetic<HTMLButtonElement>(0.2);

  // ── Confetti Celebration (Whimsy Injector) ───────────────────────
  const [confettiParticles, setConfettiParticles] = useState<Array<{id: number, emoji: string, x: number, delay: number}>>([])
  
  const triggerConfetti = useCallback(() => {
    const emojis = ['✨', '🎉', '💎', '✨', '🎊', '⭐']
    const particles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[i % emojis.length],
      x: 15 + Math.random() * 70, // 15-85% horizontal spread
      delay: i * 0.12,
    }))
    setConfettiParticles(particles)
    // Auto-cleanup after animation completes
    setTimeout(() => setConfettiParticles([]), 4000)
  }, [])

  // Trigger confetti when entering step 3
  useEffect(() => {
    if (step === 3) {
      requestAnimationFrame(() => triggerConfetti());
    }
  }, [step, triggerConfetti])

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 font-sans text-foreground selection:bg-accent/30 overflow-hidden relative">
      <div className="bg-noise"></div>
      
      {/* Background Decorative */}
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="relative z-50 px-6 md:px-12 py-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-foreground transition-colors cursor-hover-target">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-[0.3em]">Cerrar</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-black text-xl tracking-tighter uppercase text-foreground font-michroma">DOGE<span className="text-accent underline underline-offset-4 decoration-2">Concierge</span></span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 relative z-10">
        
        {/* Header - Cinematic */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
          className="text-center md:text-left mb-16 md:mb-24"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/10 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <ShieldCheck className="w-4 h-4" /> Forensic Standard Authorized
          </span>
          <h1 className="text-4xl md:text-7xl font-black text-foreground tracking-tighter mb-6 uppercase font-michroma leading-tight">
            Despliegue de <br className="hidden md:block"/> <span className="silver-text">Sanitización.</span>
          </h1>
          <p className="text-accent text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Configure su nivel de membresía y parámetros de propiedad para habilitar el despacho táctico en <span className="text-foreground font-bold">Miami & South Florida.</span>
          </p>
        </motion.div>

        {/* Status Stepper - Minimalist */}
        <div className="flex items-center justify-center md:justify-start gap-3 mb-16 px-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <motion.div 
                  animate={{ 
                    scale: step === s ? 1 : 0.85,
                    opacity: step >= s ? 1 : 0.3,
                    backgroundColor: step === s ? 'var(--foreground)' : 'transparent',
                    color: step === s ? 'var(--background)' : 'var(--foreground)',
                    borderColor: 'var(--foreground)'
                  }}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm font-michroma transition-all shadow-xl"
                >
                  {s}
                </motion.div>
                {s < 3 && <div className={`w-8 h-[2px] rounded-full transition-colors duration-500 ${step > s ? 'bg-foreground' : 'bg-foreground/10'}`} />}
              </React.Fragment>
            ))}
        </div>

        {/* Main Content Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                {...stepVariants}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12"
              >
                <div className="lg:col-span-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Property Type Selection - Premium Bento */}
                      <div className="md:col-span-2 lg:col-span-2 p-8 md:p-10 rounded-[32px] border border-accent/10 bg-foreground/5 backdrop-blur-xl relative group transition-all hover:border-accent/40 flex flex-col justify-between">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6 block">Tipo de Inmueble</label>
                          <select 
                            value={propertyData.type}
                            onChange={e => setPropertyData({...propertyData, type: e.target.value})}
                            className="bg-transparent text-2xl md:text-3xl font-black text-foreground font-michroma outline-none appearance-none cursor-pointer w-full"
                          >
                            <option className="bg-background">Penthouse / VIP</option>
                            <option className="bg-background">Villa / Mansión</option>
                            <option className="bg-background">Corporativo HQ</option>
                          </select>
                        </div>
                        <div className="mt-8 pt-8 border-t border-accent/10 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-accent" />
                           </div>
                           <span className="text-xs font-bold text-accent uppercase tracking-widest leading-tight">Configuración específica para Florida Central</span>
                        </div>
                      </div>

                      {/* Input Bento - SQFT */}
                      <div className="p-8 rounded-[32px] border border-accent/10 bg-foreground/5 backdrop-blur-xl flex flex-col justify-between group hover:border-accent/40 transition-all">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4 block">Superficie (SqFt)</label>
                        <input 
                          type="number" 
                          value={propertyData.sqm || ''}
                          onChange={e => setPropertyData({...propertyData, sqm: parseInt(e.target.value) || 0})}
                          className="bg-transparent text-4xl font-black text-foreground font-michroma outline-none w-full" 
                        />
                        <div className="text-[9px] font-bold text-accent/50 uppercase tracking-widest mt-4">Carga dinámica de personal</div>
                      </div>

                      {/* Action Bento - Summary Preview */}
                      <div className="p-8 rounded-[32px] border border-accent/10 bg-foreground text-background flex flex-col justify-between group transition-all">
                        <div className="flex justify-between items-start">
                           <div className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center">
                              <Zap className="w-5 h-5 text-background" />
                           </div>
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Live Estimate</span>
                        </div>
                        <div>
                           <span className="text-4xl font-black font-michroma">${basePrice}</span>
                           <span className="block text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-60">Costo Operativo Base</span>
                        </div>
                      </div>

                      <div className="p-8 rounded-[32px] border border-accent/10 bg-foreground/5 flex flex-col justify-between">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4 block">Habitaciones</label>
                         <div className="flex items-center gap-8">
                            <button onClick={() => setPropertyData({...propertyData, rooms: Math.max(1, propertyData.rooms - 1)})} className="text-3xl hover:text-accent opacity-50 hover:opacity-100 transition-all">-</button>
                            <span className="text-4xl font-black font-michroma">{propertyData.rooms}</span>
                            <button onClick={() => setPropertyData({...propertyData, rooms: propertyData.rooms + 1})} className="text-3xl hover:text-accent opacity-50 hover:opacity-100 transition-all">+</button>
                         </div>
                      </div>

                      <div className="p-8 rounded-[32px] border border-accent/10 bg-foreground/5 flex flex-col justify-between">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4 block">Baños</label>
                         <div className="flex items-center gap-8">
                            <button onClick={() => setPropertyData({...propertyData, baths: Math.max(1, propertyData.baths - 1)})} className="text-3xl hover:text-accent opacity-50 hover:opacity-100 transition-all">-</button>
                            <span className="text-4xl font-black font-michroma">{propertyData.baths}</span>
                            <button onClick={() => setPropertyData({...propertyData, baths: propertyData.baths + 1})} className="text-3xl hover:text-accent opacity-50 hover:opacity-100 transition-all">+</button>
                         </div>
                      </div>

                      <div className="md:col-span-2 p-1 relative flex items-center justify-center">
                         <motion.button 
                            ref={magneticRef}
                            {...magneticProps}
                            onClick={() => setStep(2)}
                            className="bg-foreground text-background w-full h-full py-12 md:py-0 min-h-[140px] rounded-[32px] flex items-center justify-center gap-4 group transition-all"
                         >
                            <span className="text-xl font-black uppercase tracking-[0.4em] font-michroma">Configurar Plan</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-4 transition-transform duration-500" />
                         </motion.button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                {...stepVariants}
                className="max-w-4xl mx-auto"
              >
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <motion.div 
                        key={plan.id}
                        onClick={() => setSubscription(plan.id)}
                        whileHover={{ y: -5 }}
                        className={`p-10 rounded-[40px] border transition-all cursor-pointer flex flex-col justify-between gap-12 relative overflow-hidden ${
                          subscription === plan.id 
                          ? 'bg-foreground text-background border-foreground shadow-2xl' 
                          : 'bg-foreground/5 border-accent/10 text-foreground hover:border-accent/40'
                        }`}
                      >
                         {plan.popular && (
                            <div className="absolute top-6 right-6 bg-accent border border-accent/10 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Elite Choice</div>
                         )}
                         <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4 block">{plan.freq}</span>
                            <h3 className="text-3xl font-black uppercase font-michroma mb-4">{plan.name}</h3>
                            <ul className="space-y-4">
                               <li className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                                  <CheckCircle className="w-4 h-4" /> Tarifa Protegida
                               </li>
                               <li className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                                  <CheckCircle className="w-4 h-4" /> Despacho GPS
                               </li>
                            </ul>
                         </div>
                         <div className="pt-8 border-t border-current/10">
                            <span className="text-5xl font-black font-michroma">${plan.price}</span>
                            <span className="block text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">Por Operación</span>
                         </div>
                      </motion.div>
                    ))}
                 </div>
                 
                 <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-accent/10 pt-12">
                     <button onClick={() => setStep(1)} className="text-accent font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:text-foreground transition-all">
                        <ArrowLeft className="w-5 h-5" /> Regresar
                     </button>
                     <motion.button 
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setStep(3)}
                        className="bg-foreground text-background py-6 px-12 rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl font-michroma"
                     >
                        Confirmar Despliegue
                     </motion.button>
                 </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                {...stepVariants}
                className="max-w-2xl mx-auto text-center relative"
              >
                  {/* ── Confetti Particles (Whimsy Injector) ──── */}
                  {confettiParticles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ y: 0, opacity: 1, scale: 0 }}
                      animate={{ y: -400, opacity: 0, scale: 1.5, rotate: 720 }}
                      transition={{ duration: 3, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute text-2xl pointer-events-none z-50"
                      style={{ left: `${p.x}%`, bottom: '40%' }}
                      aria-hidden="true"
                    >
                      {p.emoji}
                    </motion.div>
                  ))}

                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-24 h-24 bg-accent/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-accent/20 ring-pulse"
                  >
                     <ShieldCheck className="w-12 h-12 text-accent" />
                  </motion.div>
                  <h2 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter mb-6 font-michroma">Solicitud <br className="hidden md:block"/> <span className="silver-text">Autorizada.</span></h2>
                  <p className="text-accent text-lg font-medium leading-relaxed mb-12">
                     Su perfil de membresía <span className="text-foreground font-bold">{selectedPlan.name}</span> ha sido pre-aprobado para un inmueble de <span className="text-foreground font-bold">{propertyData.sqm} SqFt</span>.
                  </p>
                  
                  <div className="p-8 md:p-10 rounded-[32px] border border-accent/10 bg-foreground/5 text-left mb-12 luxury-glass">
                     <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Frecuencia Táctica</span>
                        <span className="text-lg font-black text-foreground font-michroma">{selectedPlan.freq}</span>
                     </div>
                     <div className="flex justify-between items-center mb-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Inversión Final</span>
                        <span className="text-4xl font-black text-foreground font-michroma">${selectedPlan.price}</span>
                     </div>
                     <div className="bg-accent/5 p-4 rounded-xl border border-accent/10 flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-accent uppercase tracking-widest">Personal Autorizado para despliegue inmediato en Florida</span>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                     <button onClick={() => setStep(2)} className="flex-1 py-6 border border-accent/10 rounded-2xl font-black uppercase tracking-widest text-accent hover:bg-foreground/5 transition-all magnetic hover:scale-[1.02] hover:-translate-y-0.5">Modificar</button>
                     <button 
                       onClick={() => window.location.href = `https://wa.me/17869283948?text=Hola%20DOGE.S.M%20LLC,%20deseo%20confirmar%20mi%20operaci%C3%B3n%20concierge%20para%20${propertyData.type}%20plan%20${selectedPlan.name}`} 
                       className="flex-1 py-6 bg-foreground text-background rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl font-michroma btn-whimsy magnetic hover:scale-[1.02] hover:-translate-y-0.5 group"
                     >
                       {/* Shimmer sweep pseudo-element */}
                       <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
                       <span className="relative z-10">Finalizar & Agendar</span>
                     </button>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}
