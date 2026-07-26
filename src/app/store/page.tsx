'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, ArrowLeft, ShieldCheck, ShoppingCart, LayoutGrid } from 'lucide-react'

import { BrandMarquee } from '@/components/BrandMarquee'
import { useLanguage } from '@/components/LanguageProvider'
import { STORE_DEPARTMENTS, resolveDepartment, type DepartmentId } from '@/content/store-taxonomy'
import { db, Product } from '@/lib/db'

function getInitialIsMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

const DEPARTMENT_IDS = new Set<string>(STORE_DEPARTMENTS.map((department) => department.id))

export default function StorePage() {
  const { lang, t } = useLanguage()
  const [isMobile, setIsMobile] = useState(getInitialIsMobile)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [department, setDepartment] = useState<DepartmentId | null>(null)
  const [subcategory, setSubcategory] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)

    const savedTheme = localStorage.getItem('doge-theme') as 'dark' | 'light' | null
    if (savedTheme) {
      document.documentElement.dataset.theme = savedTheme
    }

    // A `?dept=` link (search palette, breadcrumb, shared URL) preselects a
    // department. Read from `location` rather than `useSearchParams` so the
    // page shell stays statically prerendered without a Suspense boundary.
    const requested = new URLSearchParams(window.location.search).get('dept')
    if (requested && DEPARTMENT_IDS.has(requested)) {
      setDepartment(requested as DepartmentId)
    }

    async function fetchProducts() {
      try {
        const { data } = await db.products.getPublic()
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

  const countsByDepartment = useMemo(() => {
    const counts = new Map<string, number>()
    for (const product of products) {
      const resolved = resolveDepartment(product.category)
      if (!resolved) continue
      counts.set(resolved.id, (counts.get(resolved.id) || 0) + 1)
    }
    return counts
  }, [products])

  const activeDepartment = useMemo(
    () => STORE_DEPARTMENTS.find((candidate) => candidate.id === department) || null,
    [department],
  )

  const visibleProducts = useMemo(() => {
    if (!department) return products
    return products.filter((product) => {
      if (subcategory) return product.category === subcategory
      return resolveDepartment(product.category)?.id === department
    })
  }, [products, department, subcategory])

  const selectDepartment = (next: DepartmentId | null) => {
    setDepartment(next)
    setSubcategory(null)
  }

  const recordIntent = (product: Product, channel: 'whatsapp' | 'affiliate') => {
    void fetch('/api/commerce/intents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({ product_id: product.id, channel, source: 'store' }),
      keepalive: true,
    });
  }

  const handleWhatsAppBuy = (product: Product) => {
    recordIntent(product, 'whatsapp')
    const message = encodeURIComponent(`Hola DOGE.S.M LLC, quisiera adquirir unidades del equipamiento: ${product.name}. ¿Cuál es el proceso?`)
    window.open(`https://wa.me/17869283948?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  const renderPurchaseCta = (product: Product) => {
    if (product.sale_type === 'amazon_affiliate' && product.amazon_affiliate_url) {
      return (
        <a
          href={product.amazon_affiliate_url}
          onClick={() => recordIntent(product, 'affiliate')}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#FF9900] text-black hover:opacity-90 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-colors shadow-lg font-michroma flex items-center justify-center gap-2 btn-whimsy magnetic cta-glow hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_0_30px_6px_rgba(255,153,0,0.2)]"
        >
          {t('store.buyAmazon')} <ShoppingCart className="w-4 h-4" />
        </a>
      )
    }

    if (product.sale_type === 'own_stock' && !product.available) {
      return (
        <span className="bg-zinc-300 text-zinc-600 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg font-michroma flex items-center justify-center gap-2 cursor-not-allowed magnetic">
          {t('store.soldOut')} <ShoppingCart className="w-4 h-4" />
        </span>
      )
    }

    return (
      <button
        onClick={() => handleWhatsAppBuy(product)}
        className="bg-foreground text-background hover:opacity-90 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-colors shadow-lg font-michroma flex items-center justify-center gap-2 btn-whimsy magnetic cta-glow hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_0_30px_6px_rgba(255,255,255,0.1)]"
      >
        {t('store.concierge')} <ShoppingCart className="w-4 h-4" />
      </button>
    )
  }

  const getImageUrl = (product: Product) => product.product_images?.find((image) => image.is_primary)?.image_url || product.product_images?.[0]?.image_url || '/products/product-placeholder.svg'

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
          <span className="font-bold text-sm uppercase tracking-widest">{t('store.back')}</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center transition-all">
            <Image
              src="/doge-logo-transparent.png"
              alt="Doge Logo"
              width={36}
              height={36}
              className="object-contain"
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
            <ShieldCheck className="w-4 h-4" /> {t('store.badge')}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter uppercase leading-[1.1] text-foreground font-michroma">
            {t('store.title')} <br className="hidden md:block" /> <span className="silver-text">{t('store.title2')}</span>
          </h1>
          <p className="text-accent text-lg md:text-xl font-medium max-w-2xl leading-relaxed mx-auto md:mx-0">
            {t('store.subtitle')}
          </p>
        </motion.div>
      </header>

      {/* 2.5 BRANDS MARQUEE (TRUST BADGES & PARTNERS) */}
      <BrandMarquee />

      {/* 3. DEPARTAMENTOS */}
      <section className="px-6 md:px-12 pt-16 max-w-7xl mx-auto relative z-10">
        <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-accent/60 mb-5">
          {t('store.departments')}
        </span>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => selectDepartment(null)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
              department === null
                ? 'bg-foreground text-background border-foreground shadow-lg'
                : 'border-accent/20 text-accent hover:border-accent/50 hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            {t('store.allDepartments')}
            <span className="opacity-50">{products.length}</span>
          </button>

          {STORE_DEPARTMENTS.map((item) => {
            const DepartmentIcon = item.icon
            const count = countsByDepartment.get(item.id) || 0
            return (
              <button
                key={item.id}
                onClick={() => selectDepartment(item.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                  department === item.id
                    ? 'bg-foreground text-background border-foreground shadow-lg'
                    : 'border-accent/20 text-accent hover:border-accent/50 hover:text-foreground'
                }`}
              >
                <DepartmentIcon className="w-3.5 h-3.5" />
                {item.label[lang]}
                <span className="opacity-50">{count}</span>
              </button>
            )
          })}
        </div>

        {activeDepartment && (
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-accent/10">
            <button
              onClick={() => setSubcategory(null)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                subcategory === null ? 'bg-accent/15 text-foreground' : 'text-accent/70 hover:text-foreground'
              }`}
            >
              {t('store.allInDepartment')}
            </button>
            {activeDepartment.subcategories.map((item) => (
              <button
                key={item.id}
                onClick={() => setSubcategory(item.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  subcategory === item.id ? 'bg-accent/15 text-foreground' : 'text-accent/70 hover:text-foreground'
                }`}
              >
                {item.label[lang]}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 4. GRID DE PRODUCTOS */}
      <section className="px-6 md:px-12 pt-12 pb-32 max-w-7xl mx-auto relative z-10">

        {loading ? (
          <div className="flex justify-center items-center py-32">
             <div className="w-8 h-8 rounded-full border-4 border-foreground/20 border-t-foreground animate-spin"></div>
          </div>
        ) : visibleProducts.length === 0 ? (
          <p className="py-24 text-center text-accent font-medium">
            {department ? t('store.emptyDepartment') : t('store.emptyCatalog')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {visibleProducts.map((product, idx) => (
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
                    <Image src={getImageUrl(product)} alt={product.name} fill className="object-contain" />
                  </motion.div>
                  <div className="absolute bottom-4 right-6 text-6xl font-black text-foreground/5 uppercase select-none pointer-events-none">
                    0{idx + 1}
                  </div>
                </Link>

                <div className="p-8 md:p-10 flex flex-col flex-grow">
                  {/* Member Benefit Pill */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-black uppercase tracking-widest text-accent">
                      {product.benefit_label || t('store.verifiedStock')}
                    </div>
                    <div className="h-1 w-1 bg-accent/30 rounded-full"></div>
                    <span className="text-[9px] font-bold text-accent/50 uppercase tracking-widest">
                      {product.sale_type === 'amazon_affiliate' ? t('store.amazonPartner') : t('store.direct')}
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
                      <span className="block text-xs font-bold text-accent/50 uppercase tracking-widest mb-1">{t('store.estimatedPrice')}</span>
                      <span className="text-3xl font-black text-foreground font-michroma">${product.price.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/store/products/${product.slug}`} className="text-center px-4 py-2 border border-accent/20 rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-foreground/50 transition-all font-michroma magnetic hover:scale-[1.03] hover:-translate-y-0.5">
                        {t('store.specs')}
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

      <footer className="border-t border-accent/10 py-10 px-6 text-center text-accent/50 text-xs font-bold uppercase tracking-widest bg-background">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-foreground">{t('store.footerBadge')}</span>
        </div>
        <p>© {new Date().getFullYear()} DOGE.S.M LLC.</p>
      </footer>
    </div>
  )
}
