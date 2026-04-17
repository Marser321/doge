
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Home, Droplets, CheckCircle, ShieldCheck, Zap } from 'lucide-react'
import { MagneticButton } from '@/components/shared/MagneticButton'

export const ServicesSection = () => {
  return (
    <>
            {/* 3.1 SERVICIOS (Bento Grid Architecture - 2026 Luxury) */}
            <section id="servicios" className="py-12 md:py-16 bg-background relative z-20 overflow-hidden transition-colors duration-500">
              <div className="max-w-7xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8"
                >
                  <div>
                    <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Especialidades Tácticas</span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter uppercase font-michroma leading-tight">Menú de <br/> <span className="silver-text">Operaciones.</span></h2>
                  </div>
                  <p className="text-accent max-w-sm font-medium border-l border-accent/10 pl-6 h-fit">
                    Sistemas de limpieza de precisión diseñados para la <span className="text-foreground">preservación extrema</span> de activos inmobiliarios.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-full">
                  {/* Main Service - Large Bento */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 md:row-span-2 luxury-glass p-10 md:p-12 rounded-[32px] overflow-hidden relative group cursor-hover-target shadow-2xl flex flex-col justify-between min-h-[400px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                        <Home className="w-8 h-8 text-foreground" />
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-michroma mb-6">Residencial <br/> VIP Elite.</h3>
                      <p className="text-accent font-medium text-lg leading-relaxed max-w-sm">
                        Desinfección de mobiliario de lujo y tratamiento de polvos profundos con equipos de grado médico HEPA.
                      </p>
                    </div>
                    <div className="relative z-10 pt-12 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-accent">Protocolo de Precisión Activo</span>
                      <ArrowRight className="w-6 h-6 text-accent group-hover:translate-x-2 transition-transform" />
                    </div>
                  </motion.div>

                  {/* Sub Service 1 - Post Constr */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 luxury-glass p-8 md:p-10 rounded-[32px] overflow-hidden relative group cursor-hover-target shadow-xl flex items-center justify-between"
                  >
                    <div className="relative z-10 flex flex-col gap-2">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                        <ShieldCheck className="w-6 h-6 text-foreground" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight font-michroma">Post-Construcción</h3>
                      <p className="text-accent text-sm font-medium max-w-xs">Retiro intensivo de polvo obra y materiales pesados.</p>
                    </div>
                    <Image src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2670&auto=format&fit=crop" alt="Post construction" width={150} height={150} className="rounded-2xl grayscale opacity-20 group-hover:opacity-40 transition-opacity" />
                  </motion.div>

                  {/* Sub Service 2 - WFP */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="luxury-glass p-8 rounded-[32px] overflow-hidden relative group cursor-hover-target shadow-xl flex flex-col justify-between"
                  >
                    <div className="relative z-10">
                      <Droplets className="w-8 h-8 text-foreground mb-4" />
                      <h3 className="text-lg font-black uppercase font-michroma tracking-tighter">Cristal <br/> WFP</h3>
                    </div>
                    <p className="text-accent text-xs font-bold uppercase tracking-widest">Tecnología de Agua Pura</p>
                  </motion.div>

                  {/* Sub Service 3 - Audit */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="luxury-glass p-8 rounded-[32px] overflow-hidden relative group cursor-hover-target shadow-xl flex flex-col justify-between bg-foreground/5"
                  >
                    <div className="relative z-10">
                      <Zap className="w-8 h-8 text-foreground mb-4" />
                      <h3 className="text-lg font-black uppercase font-michroma tracking-tighter">Control <br/> Florida</h3>
                    </div>
                    <p className="text-accent text-xs font-bold uppercase tracking-widest">Anti-Humedad 24/7</p>
                  </motion.div>
                </div>
              </div>
            </section>

    </>
  );
};
