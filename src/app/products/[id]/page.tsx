'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, Zap, Shield, Droplets, CheckCircle, Sun, Moon, ShoppingCart, Sparkles } from 'lucide-react'

import { PRODUCTS_BY_ID } from '@/data/products'

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return localStorage.getItem('doge-theme') === 'light' ? 'light' : 'dark'
}

// SplitText Component for staggered text reveals
const SplitTextReveal = ({ text, delay = 0, className = '' }: { text: string; delay?: number; className?: string }) => {
  return (
    <span className={`inline-block ${className}`}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] align-bottom pb-1 -mb-1">
          <motion.span
            initial={{ y: '120%', opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.05 }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export default function ProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const rawId = params?.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  const product = id ? PRODUCTS_BY_ID[id] : undefined

  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('doge-theme', theme)
  }, [theme])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'doge-theme') {
        setTheme(e.newValue === 'light' ? 'light' : 'dark')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const yValue = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacityValue = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground p-6">
        <h1 className="text-4xl font-black uppercase mb-8">Producto No Encontrado</h1>
        <button onClick={() => router.push('/store')} className="px-8 py-4 bg-foreground text-background font-black uppercase tracking-widest rounded-xl">
          Volver a la Tienda
        </button>
      </div>
    )
  }

  const handleBuy = () => {
    if (product.purchaseStatus !== 'live') {
      return
    }
    window.open(product.purchaseUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent/30 selection:text-foreground relative transition-colors duration-500 overflow-hidden">
      <div className="bg-noise"></div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 px-6 md:px-12 py-8 flex items-center justify-between pointer-events-none">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: -10 }}
          onClick={() => router.push('/store')}
          className="pointer-events-auto inline-flex items-center gap-2 text-accent hover:text-foreground transition-colors cursor-hover-target"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-widest">Back to Hub</span>
        </motion.button>

        <div className="flex items-center gap-6 pointer-events-auto">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full glass-panel border border-accent/20 hover:border-accent/40 transition-all cursor-hover-target"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleBuy}
            disabled={product.purchaseStatus !== 'live'}
            className={`hidden md:flex items-center gap-2 px-6 py-3 glass-panel border border-accent/20 font-black uppercase text-[10px] tracking-widest transition-all cursor-hover-target shadow-xl ${
              product.purchaseStatus !== 'live'
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-foreground/40'
            }`}
          >
            {product.purchaseStatus === 'live' ? product.purchaseLabel : 'Próximamente'} <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 md:pt-0">
        <div className="absolute inset-0 bg-background transition-colors duration-500"></div>
        <div className={`absolute top-0 right-0 w-full md:w-2/3 h-full bg-gradient-to-l ${product.accent} opacity-10 blur-[120px] transition-all duration-700`}></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <motion.div style={{ y: yValue, opacity: opacityValue }} className="max-w-2xl">
            <div className="flex flex-col gap-2 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3"
              >
                <span className="text-accent text-[11px] font-black uppercase tracking-[0.4em] font-michroma">{product.brand}</span>
                <div className="h-px w-10 bg-accent/20"></div>
                <span className="text-accent/40 text-[10px] font-bold uppercase tracking-[0.2em]">Partner Verified</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-accent/10 border border-accent/20 w-fit"
              >
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-[9px] font-black uppercase tracking-widest text-accent">{product.benefit}</span>
              </motion.div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-8">
              <SplitTextReveal text={product.name} />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-2xl text-accent font-medium max-w-lg mb-12 leading-relaxed"
            >
              {product.desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-8"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-accent/40 uppercase tracking-[0.3em] mb-2">Inversión Estimada</span>
                <span className="text-4xl md:text-5xl font-black">${product.price} <span className="text-sm font-bold text-accent/30 uppercase tracking-widest">USD</span></span>
              </div>
              <button
                onClick={handleBuy}
                disabled={product.purchaseStatus !== 'live'}
                className={`flex-grow md:flex-none px-10 py-6 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-titanium cursor-hover-target ${
                  product.purchaseStatus === 'live'
                    ? 'bg-foreground text-background hover:opacity-90'
                    : 'bg-zinc-400 text-zinc-700 cursor-not-allowed'
                }`}
              >
                {product.purchaseStatus === 'live' ? product.purchaseLabel : 'Próximamente'}
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[400px] md:h-[600px] w-full group"
          >
            <div className={`absolute inset-0 bg-gradient-to-t ${product.accent} opacity-5 blur-[80px] group-hover:opacity-10 transition-opacity duration-1000`}></div>
            <Image
              src={product.img}
              alt={product.name}
              fill
              className="object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.3)] transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-accent/40"
        >
          <span className="text-[10px] uppercase font-black tracking-[0.5em]">Scroll Deep</span>
          <div className="w-px h-16 bg-gradient-to-b from-accent/40 to-transparent"></div>
        </motion.div>
      </section>

      {/* 2. SPECIFICATIONS SECTION */}
      <section className="py-24 md:py-48 relative z-20 overflow-hidden bg-background transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 items-start">
            <div className="lg:sticky lg:top-32">
              <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Ficha Técnica</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-8 font-michroma">Especificaciones <br /> <span className="silver-text">Tacticas.</span></h2>
              <p className="text-accent text-lg font-medium leading-relaxed">
                Cada unidad es sometida a pruebas de campo rigurosas antes de ser autorizada para despliegue en entornos residenciales de lujo.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {product.specs.map((spec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel p-10 rounded-2xl flex flex-col gap-2 group hover:border-foreground/20 transition-all shadow-xl"
                >
                  <span className="text-[10px] font-black text-accent uppercase tracking-widest">{spec.label}</span>
                  <span className="text-3xl font-black uppercase text-foreground group-hover:text-accent transition-colors">{spec.value}</span>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-2 glass-panel p-10 md:p-12 rounded-2xl border border-foreground/5 relative overflow-hidden group shadow-xl"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-foreground/5 rounded-full blur-3xl -z-10 group-hover:bg-foreground/10 transition-colors"></div>
                <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                  <Droplets className="w-6 h-6 text-accent" /> Ingeniería Miami
                </h3>
                <p className="text-accent text-lg leading-relaxed font-medium">
                  {product.detailedDesc}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST BANNER */}
      <section className="py-24 bg-foreground/5 border-y border-accent/10 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8 group">
            <Zap className="w-12 h-12 text-accent group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-2xl font-black uppercase tracking-tighter">Entrega Express</span>
              <span className="text-accent text-sm font-bold uppercase tracking-[0.2em]">Miami & South Florida</span>
            </div>
          </div>
          <div className="flex items-center gap-8 group">
            <Shield className="w-12 h-12 text-accent group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-2xl font-black uppercase tracking-tighter">Garantía Real</span>
              <span className="text-accent text-sm font-bold uppercase tracking-[0.2em]">Soporte Técnico 24/7</span>
            </div>
          </div>
          <div className="flex items-center gap-8 group">
            <CheckCircle className="w-12 h-12 text-accent group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-2xl font-black uppercase tracking-tighter">Homologado</span>
              <span className="text-accent text-sm font-bold uppercase tracking-[0.2em]">Por DOGE.S.M LLC</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-background transition-colors duration-500 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center mb-10 transition-all">
            <Image
              src="/doge_logo_premium.png"
              alt="Doge Logo"
              width={80}
              height={80}
              className="object-contain mix-blend-plus-lighter dark:mix-blend-screen opacity-40 hover:opacity-100 transition-opacity"
            />
          </div>
          <p className="text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4">The New Standard in Excellence</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mt-12 border-t border-accent/10 pt-12">
            <button onClick={() => router.push('/store')} className="text-xs font-bold uppercase tracking-widest text-accent hover:text-foreground transition-colors">Volver a Tienda</button>
            <button onClick={() => router.push('/')} className="text-xs font-bold uppercase tracking-widest text-accent hover:text-foreground transition-colors">DOGE Home</button>
            <button onClick={() => window.open('https://wa.me/17869283948', '_blank', 'noopener,noreferrer')} className="text-xs font-bold uppercase tracking-widest text-accent hover:text-foreground transition-colors">Soporte Concierge</button>
          </div>
          <p className="mt-16 text-[9px] text-accent/40 font-bold uppercase tracking-widest">© 2026 DOGE.S.M LLC. Miami, Florida.</p>
        </div>
      </footer>
    </div>
  )
}
