'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Star, ShoppingCart } from 'lucide-react'
import { db, Product } from '@/lib/db'
import { TiltCard } from './TiltCard'

// Helper for images
const getImageUrl = (slug: string) => {
  const urlMap: Record<string, string> = {
    'dyson_v15': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=2670&auto=format&fit=crop',
    'karcher_sc3': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop',
    'bissell_big_green': '/products/bissell_big_green.png',
    'mold_control': '/products/mold_control.png'
  }
  return urlMap[slug] || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop'
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeatured() {
      try {
        const { data, error } = await db.products.getFeatured()
        if (data && data.length > 0) {
          setProducts(data)
        }
      } catch (e) {
        console.error('Error fetching featured products:', e)
      } finally {
        setLoading(false)
      }
    }
    loadFeatured()
  }, [])

  if (loading || products.length === 0) return null

  return (
    <section className="py-24 bg-background relative z-20 overflow-hidden transition-colors duration-500 section-blur-divider">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div>
            <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block flex items-center gap-2">
              <Star className="w-3 h-3" /> Selección Exclusiva
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter uppercase font-michroma leading-tight">
              Productos <br /> <span className="silver-text">Destacados.</span>
            </h2>
          </div>
          <Link href="/store" className="text-accent max-w-sm font-medium border-l border-accent/10 pl-6 h-fit hover:text-foreground transition-colors group flex items-center gap-2">
            Ver Todo El Catálogo <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard maxTilt={4} scale={1.02} className="h-full">
                <Link href={`/store/products/${product.slug}`} className="block h-full cursor-hover-target">
                  <div className="group luxury-glass rounded-[32px] overflow-hidden flex flex-col h-full hover:border-accent/30 transition-all border border-white/5 relative bg-zinc-900/40">
                    <div className="absolute top-0 right-0 p-4 z-20">
                      <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shadow-xl">
                         <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                      </div>
                    </div>
                    
                    <div className={`h-48 relative overflow-hidden bg-gradient-to-br ${product.accent_gradient || 'from-zinc-800 to-zinc-950'} flex justify-center items-center p-6`}>
                      <Image 
                        src={getImageUrl(product.slug)} 
                        alt={product.name} 
                        fill 
                        className="object-contain group-hover:scale-110 transition-transform duration-700 p-8 drop-shadow-2xl" 
                      />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/60 mb-2 block">{product.brand}</span>
                        <h3 className="font-michroma font-black text-white uppercase text-lg leading-tight mb-2 group-hover:text-accent transition-colors">{product.name}</h3>
                        <p className="text-sm text-zinc-400 font-medium line-clamp-2">{product.tagline || product.description}</p>
                      </div>
                      
                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="font-michroma font-black text-xl text-white">${product.price.toLocaleString()}</span>
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-colors border border-white/10">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
