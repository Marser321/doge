'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, ArrowLeft, ShieldCheck, ShoppingCart } from 'lucide-react'

import { BrandMarquee } from '@/components/BrandMarquee'
import { db, Product } from '@/lib/db'

function getInitialIsMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export default function StorePage() {
  const [isMobile, setIsMobile] = useState(getInitialIsMobile)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)

    const savedTheme = localStorage.getItem('doge-theme') as 'dark' | 'light' | null
    if (savedTheme) {
      document.documentElement.dataset.theme = savedTheme
    }

    async function fetchProducts() {
      try {
        const { data, error } = await db.products.getAll()
        if (data) {
          // Filtrar solo productos activos
          setProducts(data.filter(p => p.is_active))
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleWhatsAppBuy = (productName: string) => {
    const message = encodeURIComponent(`Hola DOGE.S.M LLC, quisiera adquirir unidades del equipamiento: ${productName}. ¿Cuál es el proceso?`)
    window.open(`https://wa.me/17869283948?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  const renderPurchaseCta = (product: Product) => {
    if (product.sale_type === 'amazon_affiliate' && product.amazon_affiliate_url) {
      return (
        <a
          href={product.amazon_affiliate_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#FF9900] text-black hover:opacity-90 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-colors shadow-lg font-michroma flex items-center justify-center gap-2 btn-whimsy magnetic cta-glow hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_0_30px_6px_rgba(255,153,0,0.2)]"
        >
          Buy on Amazon <ShoppingCart className="w-4 h-4" />
        </a>
      )
    }

    if (product.sale_type === 'own_stock' && product.stock_quantity <= 0) {
      return (
        <span className="bg-zinc-300 text-zinc-600 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg font-michroma flex items-center justify-center gap-2 cursor-not-allowed magnetic">
          Sold Out <ShoppingCart className="w-4 h-4" />
        </span>
      )
    }

    return (
      <button
        onClick={() => handleWhatsAppBuy(product.name)}
        className="bg-foreground text-background hover:opacity-90 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-colors shadow-lg font-michroma flex items-center justify-center gap-2 btn-whimsy magnetic cta-glow hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_0_30px_6px_rgba(255,255,255,0.1)]"
      >
        Contactar Concierge <ShoppingCart className="w-4 h-4" />
      </button>
    )
  }

  // Dummy helper for images since we don't have product_images populated yet
  const getImageUrl = (slug: string) => {
    const urlMap: Record<string, string> = {
      'dyson_v15': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=2670&auto=format&fit=crop',
      'karcher_sc3': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop',
      'bissell_big_green': '/products/bissell_big_green.png',
      'mold_control': '/products/mold_control.png'
    }
    return urlMap[slug] || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop'
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent/30 selection:text-foreground relative overflow-hidden transition-colors duration-500">
      <div className="bg-noise"></div>

      {/* Fondo Industrial Premium */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* 1. NAVEGACION MINIMALISTA */}
      <nav className="relative z-50 px-6 md:px-12 py-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-foreground transition-colors cursor-hover-target">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-widest">Volver</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center transition-all">
            <Image
              src="/doge_logo_premium.png"
              alt="Doge Logo"
              width={36}
              height={36}
              className="object-contain mix-blend-plus-lighter dark:mix-blend-screen"
            />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase text-foreground font-michroma">DOGE<span className="text-accent underline underline-offset-4 decoration-2">Store</span></span>
        </div>
      </nav>

      {/* 2. HEADER */}
      <header className="px-6 md:px-12 pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto relative z-10 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-bold uppercase tracking-widest mb-6 transition-all">
            <ShieldCheck className="w-4 h-4" /> Equipamiento Táctico Florida
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter uppercase leading-[1.1] text-foreground font-michroma">
            Arsenal de <br className="hidden md:block" /> <span className="silver-text">Mantenimiento.</span>
          </h1>
          <p className="text-accent text-lg md:text-xl font-medium max-w-2xl leading-relaxed mx-auto md:mx-0">
            Los mismos insumos químicos y electrónicos de despliegue que utilizan nuestras cuadrillas corporativas, ahora homologados para su hogar.
          </p>
        </motion.div>
      </header>

      {/* 2.5 BRANDS MARQUEE (TRUST BADGES & PARTNERS) */}
      <BrandMarquee />

      {/* 3. GRID DE PRODUCTOS */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto relative z-10">
        
        {loading ? (
          <div className="flex justify-center items-center py-32">
             <div className="w-8 h-8 rounded-full border-4 border-foreground/20 border-t-foreground animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: isMobile ? 30 : 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: isMobile ? 0 : idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="bg-foreground/5 luxury-glass rounded-[32px] overflow-hidden group hover:border-accent/40 transition-all cursor-hover-target flex flex-col shadow-xl"
              >
                <Link href={`/store/products/${product.slug}`} className="block relative h-64 md:h-80 bg-foreground/5 p-8 flex items-center justify-center overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-b ${product.accent_gradient || 'from-zinc-500 to-zinc-800'} opacity-10 md:group-hover:opacity-30 transition-opacity duration-700`}></div>

                  {/* Brand Badge */}
                  <div className="absolute top-6 left-6 z-20 flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">{product.brand || 'DOGE Lab'}</span>
                    <div className="h-0.5 w-8 bg-accent animate-pulse"></div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative w-full h-full drop-shadow-2xl z-10"
                  >
                    <Image src={getImageUrl(product.slug)} alt={product.name} fill className="object-contain" />
                  </motion.div>
                  <div className="absolute bottom-4 right-6 text-6xl font-black text-foreground/5 uppercase select-none pointer-events-none">
                    0{idx + 1}
                  </div>
                </Link>

                <div className="p-8 md:p-10 flex flex-col flex-grow">
                  {/* Member Benefit Pill */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-black uppercase tracking-widest text-accent">
                      {product.benefit_label || 'Verified Stock'}
                    </div>
                    <div className="h-1 w-1 bg-accent/30 rounded-full"></div>
                    <span className="text-[9px] font-bold text-accent/50 uppercase tracking-widest">
                      {product.sale_type === 'amazon_affiliate' ? 'Amazon Partner' : 'Direct'}
                    </span>
                  </div>

                  <Link href={`/store/products/${product.slug}`}>
                    <h2 className="text-2xl font-black text-foreground mb-4 uppercase tracking-tighter font-michroma hover:text-accent transition-colors">{product.name}</h2>
                  </Link>
                  <p className="text-sm font-medium text-accent mb-8 leading-relaxed flex-grow">
                    {product.description}
                  </p>

                  <div className="flex items-end justify-between mt-auto gap-4">
                    <div>
                      <span className="block text-xs font-bold text-accent/50 uppercase tracking-widest mb-1">Inversión Estimada</span>
                      <span className="text-3xl font-black text-foreground font-michroma">${product.price.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/store/products/${product.slug}`} className="text-center px-4 py-2 border border-accent/20 rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-foreground/50 transition-all font-michroma magnetic hover:scale-[1.03] hover:-translate-y-0.5">
                        Especificaciones
                      </Link>
                      {renderPurchaseCta(product)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 4. KITS ESTRATÉGICOS (UP-SELLING B2B) */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tighter font-michroma">Sistemas Integrados.</h2>
            <p className="text-accent mt-2 font-medium">Soluciones empaquetadas para despliegue industrial masivo.</p>
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-foreground/5 luxury-glass rounded-[32px] overflow-hidden group flex flex-col md:flex-row relative cursor-hover-target shadow-2xl hover:border-accent/30 transition-all transition-colors"
          >
            <div className="w-full md:w-2/5 md:min-h-[400px] bg-background relative flex items-center justify-center p-12 overflow-hidden border-b md:border-b-0 md:border-r border-accent/10">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent"></div>
              <div className="relative w-48 h-48 -mr-16 drop-shadow-2xl z-20">
                <Image src="/products/dehumidifier.png" alt="Dehumidifier" fill className="object-contain" />
              </div>
              <div className="relative w-40 h-40 drop-shadow-2xl z-10 opacity-80 mix-blend-normal scale-x-[-1]">
                <Image src="/products/mold_control.png" alt="Mold Control" fill className="object-contain" />
              </div>
            </div>

            <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-between relative bg-gradient-to-br from-foreground/5 to-transparent">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

              <div>
                <span className="inline-block bg-accent text-background text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">Paquete Élite Florida</span>
                <h3 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter mb-4 font-michroma">Kit Humedad Cero</h3>
                <p className="text-accent font-medium leading-relaxed max-w-lg mb-8">
                  El sistema definitivo para la alta corrosión costera en Miami. Incluye el *Evaporador de Turbina Táctica* combinado con 3 dotaciones del *Nano-Sellador de Hongos* para resguardar la propiedad por 24 meses sin supervisión.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-accent/10 pt-8 mt-auto relative z-10">
                <div>
                  <span className="block text-accent/50 text-xs font-bold uppercase tracking-widest line-through mb-1">Costo Fraccionado: $605 USD</span>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-foreground tracking-tighter font-michroma">$480 <span className="text-sm font-bold text-accent/50 tracking-widest">USD</span></span>
                    <span className="bg-accent/20 text-accent border border-accent/20 font-bold text-xs px-2 py-1 rounded">Ahorro $125</span>
                  </div>
                </div>
                <button onClick={() => handleWhatsAppBuy('Kit Humedad Cero')} className="bg-foreground text-background hover:opacity-90 px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-colors shadow-lg w-full sm:w-auto text-center border-2 border-transparent font-michroma btn-whimsy magnetic cta-glow hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_0_30px_6px_rgba(255,255,255,0.1)] group relative">
                  Contratar Sistema
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-accent/10 py-10 px-6 text-center text-accent/50 text-xs font-bold uppercase tracking-widest bg-background">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-foreground">Estándar Forense Autorizado</span>
        </div>
        <p>© {new Date().getFullYear()} DOGE.S.M LLC. Despliegue logístico exclusivo en Florida, Miami.</p>
      </footer>
    </div>
  )
}
