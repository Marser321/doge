
'use client'

import React from 'react'
import { motion, MotionValue } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MagneticButton } from '@/components/shared/MagneticButton'
import { TextScrubber } from '@/components/shared/TextScrubber'
import { staggerContainer, fadeInUp } from '@/components/shared/animations'
import { ArrowRight, Star, ShieldCheck, CheckCircle } from 'lucide-react'

export const HeroSection = ({
  t,
  heroRef,
  yHeroText,
  yHeroImage,
  scaleHeroImage,
  opacityHero
}: {
  t: any,
  heroRef: React.RefObject<HTMLElement | null>,
  yHeroText: MotionValue<number>,
  yHeroImage: MotionValue<number>,
  scaleHeroImage: MotionValue<number>,
  opacityHero: MotionValue<number>
}) => {
  return (
    <>
            {/* 2. HERO SECTION */}
            <section ref={heroRef} className="relative pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden min-h-[95vh] md:min-h-[900px] flex items-center bg-background transition-colors duration-500">
              {/* Deep Titanium Aurora Effect */}
              <motion.div
                animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 left-1/4 w-[300px] md:w-[600px] h-[400px] md:h-[600px] bg-accent/10 rounded-full blur-[80px] -z-10"
              ></motion.div>

              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center w-full">
                {/* Parallax Hero Text */}
                <motion.div
                  style={{ y: yHeroText, opacity: opacityHero }}
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                  className="max-w-2xl relative z-10"
                >
                  <motion.div variants={fadeInUp} className="mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">
                      <ShieldCheck className="w-3 h-3" /> Professional Standard
                    </span>
                  </motion.div>

                  <TextScrubber
                    text="Limpieza de Élite."
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-foreground leading-[0.85] tracking-[-0.05em] uppercase mb-12"
                  />

                  <motion.p variants={fadeInUp} className="text-lg md:text-xl text-accent mb-10 md:mb-12 leading-relaxed font-medium max-w-lg">
                    Limpieza de precisión y conservación de activos inmobiliarios en Miami. <span className="text-foreground font-bold">Un estándar superior para quienes no aceptan menos que la perfección.</span>
                  </motion.p>

                  <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-8 items-center">
                    <MagneticButton href="/booking" className="inline-flex items-center justify-center px-10 py-6 text-sm font-black uppercase tracking-[0.2em] text-black bg-white rounded-xl shadow-2xl hover:bg-zinc-200 transition-all group cursor-hover-target w-full sm:w-auto cta-glow btn-whimsy hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.15)] relative">
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
                      <span className="relative z-10 flex items-center">Agendar Cuadrilla <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" /></span>
                    </MagneticButton>
                    <div className="flex gap-4 items-center justify-center sm:justify-start">
                      <div className="flex -space-x-3 cursor-hover-target opacity-60 grayscale hover:grayscale-0 transition-all">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-slate-950 flex justify-center items-center text-xs font-bold shadow-xl">
                            <Image src={`https://ui-avatars.com/api/?background=27272a&color=fff&name=V+${i}`} alt="Avatar" width={40} height={40} className="rounded-full" />
                          </div>
                        ))}
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <div className="flex text-taupe mb-0.5 scale-75 origin-left">
                          {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-current"/>)}
                        </div>
                        <span className="text-[10px] font-black text-taupe uppercase tracking-widest">Inversores VIP Miami</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Parallax Hero Image Container */}
                <motion.div
                  style={{ y: yHeroImage, scale: scaleHeroImage, opacity: opacityHero }}
                  initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative h-[450px] md:h-[600px] lg:h-[750px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 mt-8 lg:mt-0"
                >
                  <div className="absolute inset-0 bg-zinc-900">
                    <Image
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop"
                      alt="Luxury Property Miami"
                      fill
                      className="object-cover opacity-60 transition-transform duration-[20s] hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                    {/* Floating Element 1 - Real-time Status (Noir Style) */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-8 right-8 glass-panel p-5 rounded-2xl shadow-titanium"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex justify-center items-center text-foreground backdrop-blur-md border border-white/10">
                          <CheckCircle className="w-6 h-6"/>
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-wider">Audit Complete</p>
                          <p className="text-[10px] font-bold text-taupe uppercase tracking-tighter">Status: Protected</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Floating Element 2 - Safety Badge (Noir Style) */}
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-8 left-8 glass-panel p-6 rounded-2xl shadow-titanium text-white"
                    >
                      <div className="flex gap-4 items-center mb-4">
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10">
                          <ShieldCheck className="w-5 h-5 text-white"/>
                        </div>
                        <div>
                          <span className="block font-bold text-sm tracking-tight uppercase">Garantía VIP</span>
                          <span className="text-[9px] font-black text-taupe uppercase tracking-[0.2em] leading-none">Security Active</span>
                        </div>
                      </div>
                      <div className="w-32 bg-white/5 h-1 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                          className="bg-white h-full"
                        ></motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </section>


    </>
  );
};
