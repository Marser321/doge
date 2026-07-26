'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ChevronRight, ExternalLink, MessageCircle, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { resolveDepartment, resolveSubcategory } from '@/content/store-taxonomy';
import { db, Product } from '@/lib/db';

const productImage = (product: Product) => product.product_images?.find((image) => image.is_primary)?.image_url || product.product_images?.[0]?.image_url || '/products/product-placeholder.svg';

export default function StoreProductPage() {
  const { lang } = useLanguage();
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let current = true;
    async function load() {
      const { data } = await db.products.getBySlug(slug);
      if (!current) return;
      setProduct(data);
      if (data) {
        const { data: relatedProducts } = await db.products.getRelated(data.category, data.id);
        if (current && relatedProducts) setRelated(relatedProducts);
      }
      if (current) setLoading(false);
    }
    void load();
    return () => { current = false; };
  }, [slug]);

  function recordIntent(channel: 'whatsapp' | 'affiliate') {
    if (!product) return;
    void fetch('/api/commerce/intents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({ product_id: product.id, channel, source: 'product-detail' }),
      keepalive: true,
    });
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-background text-foreground"><span className="text-sm text-zinc-400">Cargando catálogo…</span></main>;
  if (!product) return <main className="grid min-h-screen place-items-center bg-background p-6 text-center text-foreground"><div><h1 className="text-2xl font-semibold">Producto no encontrado</h1><Link href="/store" className="mt-5 inline-block text-sm text-accent underline">Volver al catálogo</Link></div></main>;

  const isAffiliate = product.sale_type === 'amazon_affiliate' && Boolean(product.amazon_affiliate_url);
  const contactUrl = `https://wa.me/17869283948?text=${encodeURIComponent(`Hola DOGE.S.M LLC, quisiera consultar por ${product.name}.`)}`;
  const department = resolveDepartment(product.category);
  const subcategory = resolveSubcategory(product.category);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link href="/store" className="inline-flex items-center gap-2 text-sm text-accent transition hover:text-foreground"><ArrowLeft className="size-4" /> Catálogo</Link>
        <Link href="/booking" className="text-sm font-medium text-accent transition hover:text-foreground">Solicitar servicio</Link>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:grid-cols-2 md:px-10 md:py-20">
        <div className="relative min-h-80 overflow-hidden rounded-3xl border border-white/10 bg-foreground/[0.04] sm:min-h-[34rem]">
          <Image src={productImage(product)} alt={product.name} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-10" />
        </div>
        <div className="flex flex-col justify-center">
          {department && (
            <nav className="mb-4 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <Link href={`/store?dept=${department.id}`} className="transition hover:text-foreground">{department.label[lang]}</Link>
              {subcategory && (
                <>
                  <ChevronRight className="size-3" aria-hidden="true" />
                  <span className="text-accent">{subcategory.label[lang]}</span>
                </>
              )}
            </nav>
          )}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{product.brand || 'DOGE'}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{product.name}</h1>
          {product.tagline && <p className="mt-5 text-lg text-accent">{product.tagline}</p>}
          <p className="mt-6 max-w-xl leading-7 text-zinc-400">{product.description}</p>
          <p className="mt-8 text-3xl font-semibold">${Number(product.price).toLocaleString()} <span className="text-sm font-normal text-zinc-500">USD estimado</span></p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {product.sale_type === 'own_stock' && !product.available ? (
              <span className="inline-flex min-h-12 items-center justify-center rounded-xl bg-zinc-800 px-5 py-3 text-sm font-semibold text-zinc-400">Temporalmente no disponible</span>
            ) : isAffiliate ? (
              <a href={product.amazon_affiliate_url!} target="_blank" rel="noopener noreferrer" onClick={() => recordIntent('affiliate')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ff9900] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90">Ver proveedor <ExternalLink className="size-4" /></a>
            ) : (
              <a href={contactUrl} target="_blank" rel="noopener noreferrer" onClick={() => recordIntent('whatsapp')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90">Contactar concierge <MessageCircle className="size-4" /></a>
            )}
            <Link href="/booking" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-foreground/20 px-5 py-3 text-sm font-medium transition hover:bg-foreground/5">Servicio para propiedad <ShoppingBag className="size-4" /></Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-foreground/[0.025] px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Detalles</p><h2 className="mt-4 text-3xl font-semibold">Información del producto</h2></div>
          <div><p className="leading-7 text-zinc-400">{product.detailed_description || product.description}</p>
            {product.specs?.length > 0 && <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">{product.specs.map((spec) => <div key={`${spec.label}-${spec.value}`} className="border-t border-white/10 pt-4"><dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">{spec.label}</dt><dd className="mt-1 text-sm text-foreground">{spec.value}</dd></div>)}</dl>}
          </div>
        </div>
      </section>

      {related.length > 0 && <section className="mx-auto max-w-7xl px-6 py-16 md:px-10"><h2 className="text-2xl font-semibold">También puede interesarte</h2><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <Link key={item.id} href={`/store/products/${item.slug}`} className="group rounded-2xl border border-white/10 bg-foreground/[0.03] p-5 transition hover:border-white/25"><div className="relative h-40"><Image src={productImage(item)} alt={item.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-contain" /></div><p className="mt-4 text-xs uppercase tracking-wider text-accent">{item.brand || 'DOGE'}</p><h3 className="mt-2 font-semibold">{item.name}</h3><p className="mt-2 text-sm text-zinc-400">${Number(item.price).toLocaleString()} USD</p></Link>)}</div></section>}
    </main>
  );
}
