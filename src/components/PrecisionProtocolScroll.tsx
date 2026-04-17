'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, useTransform, useSpring, useMotionValue, type MotionValue } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Store, Hexagon, Building2, ArrowRight, Sparkles, ShieldCheck, Home, Anchor, Droplets, Waves } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const FALLBACK_STEP_IMAGE = '/doge_logo.jpg'

const B2B_PRECISION_STEPS = [
  {
    title: 'Vitrinas Luxury',
    tag: 'Retail Excellence',
    desc: 'Maximice la psicología de compra. Cristales impecables que eliminan la barrera entre el cliente y su producto en centros comerciales premium.',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop',
    icon: Store,
    phase: 'Crystal Level 01',
  },
  {
    title: 'Penthouses Miami',
    tag: 'High Residential',
    desc: 'Vista panorámica sin interrupciones. Protocolos de limpieza WFP para vidrios de gran formato en altura y barandas de cristal.',
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2670&auto=format&fit=crop',
    icon: Home,
    phase: 'Crystal Level 02',
  },
  {
    title: 'Casinos & Resorts',
    tag: 'High Traffic',
    desc: 'Tratamiento de superficies 24/7 y mantenimiento de bronces y cristales en entornos de operación continua.',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2670&auto=format&fit=crop',
    icon: Hexagon,
    phase: 'Crystal Level 03',
  },
  {
    title: 'Fachadas Glass',
    tag: 'Commercial',
    desc: 'Mantenimiento preventivo de cristales estructurales contra el salitre y la humedad. Proyectamos la imagen corporativa más sólida.',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop',
    icon: Building2,
    phase: 'Crystal Level 04',
  },
  {
    title: 'Mansiones Privadas',
    tag: 'Elite Estates',
    desc: 'Transparencia invisible en puertas corredizas y ventanales de mar. El estándar más alto para las propiedades más exclusivas.',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop',
    icon: Sparkles,
    phase: 'Crystal Level 05',
  },
  {
    title: 'Yates & Marinas',
    tag: 'Miami Marine',
    desc: 'Protocolos de limpieza ultra-precisos para cristales de puente de mando, ventanales panorámicos y barandas de vidrio en embarcaciones de lujo.',
    img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=2670&auto=format&fit=crop',
    icon: Anchor,
    phase: 'Crystal Level 06',
  },
  {
    title: 'Janitorial Services',
    tag: 'Premium Facilities',
    desc: 'Mantenimiento integral de superficies de alto tráfico. Utilizamos tecnología de auto-fregado comercial para asegurar estándares sanitarios impecables en entornos premium como aeropuertos y lobbies de lujo.',
    img: '/services/floor_scrubber_luxury_1776053381221.png',
    icon: Waves,
    phase: 'Crystal Level 07',
  },
  {
    title: 'Lavado a Presión',
    tag: 'Hardscape Restoration',
    desc: 'Restauración profunda de superficies exteriores mediante sistemas rotativos de alta presión. Eliminación de manchas, moho y residuos en concreto, adoquines y entradas de lujo con precisión milimétrica.',
    img: '/services/surface_cleaner_luxury_1776053413810.png',
    icon: Droplets,
    phase: 'Crystal Level 08',
  },
] as const

type Step = (typeof B2B_PRECISION_STEPS)[number]

type BubbleSeed = {
  initialX: string
  initialY: string
  targetY: string
  duration: number
}

function seededValue(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

const SqueegeeBlade = ({ xProgress }: { xProgress: MotionValue<string> }) => {
  const splashTrajectories = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        fromY: Math.round(seededValue(i + 1) * 180 - 90),
        toY: Math.round(seededValue(i + 17) * 320 - 160),
      })),
    [],
  )

  return (
    <motion.div
      style={{ x: xProgress }}
      className="absolute top-0 bottom-0 w-2 z-[40] pointer-events-none origin-left will-change-transform"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-500 via-zinc-200 to-zinc-500 shadow-[0_0_40px_rgba(255,255,255,0.6)] border-x border-white/10"></div>

      <div className="absolute inset-y-0 -left-[200px] w-[200px] bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 blur-2xl opacity-30"></div>

      <div className="absolute top-[35%] -left-14 w-14 h-48 bg-zinc-950/90 backdrop-blur-xl rounded-l-3xl border border-white/5 flex items-center justify-center shadow-2xl">
        <div className="w-2 h-28 bg-accent/60 rounded-full animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.35)]"></div>
      </div>

      <div className="absolute inset-y-0 -left-4 w-4 overflow-visible">
        {splashTrajectories.map((traj, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.3, 0],
              x: [-5, -34],
              y: [traj.fromY, traj.toY],
            }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
            className="absolute w-1.5 h-1.5 bg-blue-200/35 rounded-full blur-[1px]"
          />
        ))}
      </div>
    </motion.div>
  )
}

const SoapyOverlay = () => {
  const bubbleSeeds = useMemo<BubbleSeed[]>(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        initialX: `${Math.round(seededValue(i + 3) * 100)}%`,
        initialY: `${Math.round(seededValue(i + 11) * 100)}%`,
        targetY: `${Math.round(seededValue(i + 23) * 110 - 10)}%`,
        duration: 5 + seededValue(i + 31) * 6,
      })),
    [],
  )

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-md bg-white/10 dark:bg-zinc-900/30 mix-blend-screen opacity-50"></div>

      <div className="absolute inset-0">
        {bubbleSeeds.map((seed, i) => (
          <motion.div
            key={i}
            initial={{ x: seed.initialX, y: seed.initialY, scale: 0 }}
            animate={{
              scale: [0.45, 1.15, 0.65],
              opacity: [0, 0.26, 0],
              y: [seed.initialY, seed.targetY],
            }}
            transition={{ duration: seed.duration, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-white/15 via-blue-200/5 to-transparent border border-white/15 blur-[2px]"
          />
        ))}
      </div>
    </div>
  )
}

const StepBackgroundLayer = ({
  step,
  idx,
  activeIdx,
  smoothProgress,
  totalSteps,
}: {
  step: Step
  idx: number
  activeIdx: number
  smoothProgress: MotionValue<number>
  totalSteps: number
}) => {
  const [baseImageSrc, setBaseImageSrc] = useState<string>(step.img)
  const [revealImageSrc, setRevealImageSrc] = useState<string>(step.img)

  const revealClipPath = useTransform(
    smoothProgress,
    [idx / totalSteps, (idx + 1) / totalSteps],
    ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
  )

  const glintX = useTransform(
    smoothProgress,
    [idx / totalSteps, (idx + 1) / totalSteps],
    ['-100%', '200%'],
  )

  const shouldPrioritize = idx === 0

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: activeIdx === idx ? 1 : 0,
        scale: activeIdx === idx ? 1 : 1.015,
      }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 will-change-[opacity,transform]"
    >
      <div className="absolute inset-0">
        <Image
          src={baseImageSrc}
          alt="Dirty Preview"
          fill
          priority={shouldPrioritize}
          loading={shouldPrioritize ? 'eager' : 'lazy'}
          onError={() => setBaseImageSrc((current) => (current === FALLBACK_STEP_IMAGE ? current : FALLBACK_STEP_IMAGE))}
          className="object-cover grayscale saturate-50 blur-lg scale-110"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl"></div>
        <SoapyOverlay />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute inset-0 will-change-transform" style={{ clipPath: revealClipPath }}>
          <Image
            src={revealImageSrc}
            alt="Precision Crystal"
            fill
            priority={shouldPrioritize}
            loading={shouldPrioritize ? 'eager' : 'lazy'}
            onError={() =>
              setRevealImageSrc((current) => (current === FALLBACK_STEP_IMAGE ? current : FALLBACK_STEP_IMAGE))
            }
            className="object-cover saturate-120 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/10"></div>

          <motion.div
            style={{ x: glintX }}
            className="absolute inset-y-0 -left-[200px] w-[200px] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 blur-2xl z-10 opacity-55"
          />

          <div className="absolute inset-0 border-[24px] border-white/5 pointer-events-none ring-2 ring-inset ring-white/10 opacity-20"></div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export const PrecisionProtocolScroll = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const horizontalRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const activeIdxRef = useRef(0)

  const rawProgress = useMotionValue(0)
  const smoothProgress = useSpring(rawProgress, { stiffness: 50, damping: 18 })
  const bladeX = useTransform(smoothProgress, [0, 1], ['0px', 'calc(100vw - 2px)'])

  useEffect(() => {
    if (!sectionRef.current || !horizontalRef.current) return

    const sectionElement = sectionRef.current
    const horizontalElement = horizontalRef.current

    const calculateHorizontalTravel = () => {
      const isMobile = window.innerWidth < 768;
      const paddingOffset = isMobile ? (window.innerWidth * 0.1) : 320;
      return Math.max(0, horizontalElement.scrollWidth - window.innerWidth + paddingOffset);
    }

    const syncActiveIndex = (progress: number) => {
      const nextIndex = Math.min(
        Math.floor(progress * B2B_PRECISION_STEPS.length * 1.02),
        B2B_PRECISION_STEPS.length - 1,
      )
      if (nextIndex !== activeIdxRef.current) {
        activeIdxRef.current = nextIndex
        setActiveIdx(nextIndex)
      }
    }

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionElement,
        start: 'top top',
        end: '+=900%',
        pin: true,
        scrub: 1.35,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          rawProgress.set(self.progress)
          syncActiveIndex(self.progress)
        },
      })

      gsap.to(horizontalElement, {
        x: () => -calculateHorizontalTravel(),
        ease: 'none',
        force3D: true,
        overwrite: 'auto',
        scrollTrigger: {
          trigger: sectionElement,
          start: 'top top',
          end: '+=900%',
          scrub: 1.05,
          invalidateOnRefresh: true,
        },
      })
    }, sectionElement)

    const resizeObserver = new ResizeObserver(() => {
      ScrollTrigger.refresh()
    })

    resizeObserver.observe(sectionElement)
    resizeObserver.observe(horizontalElement)
    ScrollTrigger.refresh()

    return () => {
      resizeObserver.disconnect()
      context.revert()
    }
  }, [rawProgress])

  return (
    <section ref={sectionRef} className="relative h-screen bg-slate-950 overflow-hidden cursor-none selection:bg-accent/40">
      <div className="absolute inset-0 z-0">
        {B2B_PRECISION_STEPS.map((step, idx) => (
          <StepBackgroundLayer
            key={idx}
            step={step}
            idx={idx}
            activeIdx={activeIdx}
            smoothProgress={smoothProgress}
            totalSteps={B2B_PRECISION_STEPS.length}
          />
        ))}
      </div>

      <SqueegeeBlade xProgress={bladeX} />

      <div className="relative z-50 h-full w-full flex flex-col justify-center pt-24 sm:pt-28 md:pt-32 pb-16 pointer-events-none overflow-visible">
        <div className="px-4 sm:px-6 md:px-32 mb-6 sm:mb-10 md:mb-14 h-fit shrink-0">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="hidden sm:inline-block w-16 h-px bg-accent/40"></span>
              <span className="text-taupe text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] sm:tracking-[0.7em] font-michroma">
                Precision Glass Specialty Narrative
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white uppercase tracking-tighter font-michroma leading-[1.15] md:leading-[1.1] drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] pb-3 pt-1">
              {activeIdx === 0 ? 'Cristal.' : activeIdx === 1 ? 'Vision.' : activeIdx <= 3 ? 'Pureza.' : 'Espejo.'} <br />
              <span className="silver-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl pt-3 block">Precision.</span>
            </h2>
          </motion.div>
        </div>

        <div ref={horizontalRef} className="flex gap-6 sm:gap-16 md:gap-32 w-max px-4 sm:px-16 md:px-32 relative z-[60] overflow-visible">
          {B2B_PRECISION_STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 80 }}
              animate={{
                opacity: activeIdx === idx ? 1 : 0.16,
                scale: activeIdx === idx ? 1 : 0.9,
                y: activeIdx === idx ? 0 : 36,
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-[85vw] sm:w-[70vw] md:min-w-[850px] md:w-[850px] h-[450px] sm:h-[500px] md:h-[55vh] lg:h-[65vh] max-h-[700px] min-h-[450px] shrink-0 glass-panel-heavy rounded-[32px] md:rounded-[48px] p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between border border-white/5 group transition-all shadow-titanium relative overflow-hidden pointer-events-auto will-change-transform"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-3xl -z-10 group-hover:bg-accent/20 transition-colors"></div>

              <div className="relative z-10 flex flex-col h-full justify-between overflow-visible">
                <div className="flex flex-col flex-1 min-h-0 overflow-visible">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-[20px] md:rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-4 sm:mb-6 md:mb-8 group-hover:scale-110 group-hover:border-accent/50 group-hover:shadow-[0_0_60px_rgba(255,255,255,0.1)] transition-all shadow-2xl relative shrink-0">
                    <step.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                    <div className="absolute inset-0 bg-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-6 shrink-0">
                    <span className="text-[10px] sm:text-[11px] md:text-[13px] font-black text-taupe uppercase tracking-[0.3em] sm:tracking-[0.5em] leading-none">{step.tag}</span>
                    <div className="hidden sm:block h-px w-6 sm:w-12 bg-white/10 text-accent">•</div>
                    <span className="text-[10px] sm:text-[11px] md:text-[13px] font-black text-accent uppercase tracking-[0.3em] sm:tracking-[0.6em]">Batch 0{idx + 1}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-4 sm:mb-6 font-michroma leading-[1.15] max-w-[95%] shrink-0 py-1">{step.title}</h3>
                  <div className="overflow-y-auto scrollbar-none min-h-0 flex-1 pb-4 overflow-x-visible">
                    <p className="text-accent text-sm sm:text-base md:text-lg font-medium leading-[1.6] md:leading-[1.5] max-w-3xl pr-4">{step.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 sm:pt-6 md:pt-8 border-t border-white/5 mt-2 shrink-0">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <span className="text-[9px] sm:text-[11px] md:text-[14px] font-black text-accent uppercase tracking-widest leading-none">Glass Precision Level</span>
                    <span className="text-[12px] sm:text-sm md:text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2 sm:gap-4 md:gap-6">
                      <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-accent" /> {step.phase}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-8 md:gap-12 pl-2">
                    <span className="hidden md:inline text-[13px] font-black uppercase text-accent tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-opacity">Solicitar Auditoría</span>
                    <motion.button whileHover={{ scale: 0.9, rotate: 90 }} className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:bg-accent transition-all shrink-0">
                      <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-6 right-6 sm:left-16 sm:right-16 md:left-32 md:right-32 h-[3px] sm:h-[4px] md:h-[6px] bg-white/5 rounded-full overflow-hidden z-[70]">
        <motion.div
          className="h-full bg-accent shadow-[0_0_50px_rgba(255,255,255,0.6)]"
          animate={{ width: `${((activeIdx + 1) / B2B_PRECISION_STEPS.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 20, damping: 10 }}
        />
      </div>
    </section>
  )
}
