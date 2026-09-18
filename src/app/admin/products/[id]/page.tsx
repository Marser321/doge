'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ImagePlus, LoaderCircle, Save } from 'lucide-react';

import { CrmPageIntro } from '@/components/admin/CrmPrimitives';
import { STORE_DEPARTMENTS } from '@/content/store-taxonomy';
import { apiRequest } from '@/lib/api-client';
import { db, Product } from '@/lib/db';

const imageFor = (product: Product) => product.product_images?.find((image) => image.is_primary)?.image_url || product.product_images?.[0]?.image_url || '/products/product-placeholder.svg';

export default function ProductEditorPage() {
  const params = useParams<{ id: string }>();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  useEffect(() => {
    db.products.getAll().then(({ data, error: loadError }) => {
      setProduct(data?.find((candidate) => candidate.id === productId) || null);
      setError(loadError?.message || '');
    }).finally(() => setLoading(false));
  }, [productId]);

  const updateField = (field: keyof Product, value: string | number | boolean | null) => {
    setProduct((current) => current ? { ...current, [field]: value } : current);
  };

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;
    setSaving(true);
    setError('');
    const result = await db.products.update(product.id, {
      name: product.name,
      brand: product.brand,
      tagline: product.tagline,
      description: product.description,
      detailed_description: product.detailed_description,
      price: Number(product.price),
      category: product.category,
      benefit_label: product.benefit_label,
      is_active: product.is_active,
      is_featured: product.is_featured,
    });
    if (result.error) setError(result.error.message);
    else if (result.data) setProduct(result.data);
    setSaving(false);
  }

  async function replaceImage(event: ChangeEvent<HTMLInputElement>) {
    const photo = event.target.files?.[0];
    if (!photo || !product) return;
    setUploading(true);
    setError('');
    const form = new FormData();
    form.set('product_id', product.id);
    form.set('photo', photo);
    form.set('alt_text', imageAlt.trim() || product.name);
    try {
      await apiRequest('/api/products/media', { method: 'POST', body: form, auth: 'required' });
      const result = await db.products.getAll();
      const refreshed = result.data?.find((candidate) => candidate.id === product.id) || null;
      setProduct(refreshed);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'No fue posible sustituir la imagen.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  if (loading) return <div className="grid min-h-96 place-items-center"><LoaderCircle className="size-6 animate-spin text-zinc-500" /></div>;
  if (!product) return <div className="space-y-5"><CrmPageIntro eyebrow="Catálogo" title="Producto no encontrado" description="El producto pudo haber sido archivado o no estar disponible para tu rol." /><Link href="/admin/products" className="inline-flex text-sm text-sky-200 hover:text-white">Volver al catálogo</Link></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-20">
      <CrmPageIntro eyebrow="Catálogo" title={`Editar · ${product.name}`} description="Actualiza la ficha pública o sustituye su imagen principal sin perder el historial de media." actions={<Link href="/admin/products" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-zinc-300 transition hover:bg-white/5"><ArrowLeft className="size-4" /> Catálogo</Link>} />
      {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>}
      <form onSubmit={save} className="grid gap-7 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="h-fit space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 lg:sticky lg:top-24">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/20"><Image src={imageFor(product)} alt={product.product_images?.find((image) => image.is_primary)?.alt_text || product.name} fill sizes="(min-width: 1024px) 320px, 100vw" className="object-contain p-5" /></div>
          <label className="block text-xs font-medium text-zinc-400">Texto alternativo<input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} maxLength={300} placeholder={product.name} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white" /></label>
          <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-sky-400/20 bg-sky-400/5 px-4 text-sm font-medium text-sky-100 transition hover:bg-sky-400/10"><ImagePlus className="size-4" /> {uploading ? 'Subiendo…' : 'Sustituir imagen'}<input disabled={uploading} onChange={replaceImage} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" /></label>
          <p className="text-xs leading-5 text-zinc-500">La nueva imagen se vuelve principal; la anterior se conserva como historial.</p>
        </aside>
        <section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-zinc-400 sm:col-span-2">Nombre<input required value={product.name} onChange={(event) => updateField('name', event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
            <label className="text-sm text-zinc-400">Marca<input value={product.brand || ''} onChange={(event) => updateField('brand', event.target.value || null)} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
            <label className="text-sm text-zinc-400">Precio USD<input required min="0" step="0.01" type="number" value={product.price} onChange={(event) => updateField('price', Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
            <label className="text-sm text-zinc-400 sm:col-span-2">Tagline<input value={product.tagline || ''} onChange={(event) => updateField('tagline', event.target.value || null)} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
            <label className="text-sm text-zinc-400 sm:col-span-2">Descripción<textarea value={product.description || ''} onChange={(event) => updateField('description', event.target.value || null)} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
            <label className="text-sm text-zinc-400 sm:col-span-2">Detalle<textarea value={product.detailed_description || ''} onChange={(event) => updateField('detailed_description', event.target.value || null)} rows={5} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
            <label className="text-sm text-zinc-400">Categoría<select value={product.category || ''} onChange={(event) => updateField('category', event.target.value || null)} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white"><option value="">Sin categoría</option>{STORE_DEPARTMENTS.flatMap((department) => department.subcategories).map((category) => <option key={category.id} value={category.id}>{category.label.es}</option>)}</select></label>
            <label className="text-sm text-zinc-400">Etiqueta<input value={product.benefit_label || ''} onChange={(event) => updateField('benefit_label', event.target.value || null)} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
          </div>
          <div className="flex flex-wrap gap-5 border-t border-white/10 pt-5">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-300"><input checked={product.is_active} onChange={(event) => updateField('is_active', event.target.checked)} type="checkbox" className="size-4 rounded border-white/20 bg-zinc-950" /> Visible en tienda</label>
            <label className="inline-flex items-center gap-2 text-sm text-zinc-300"><input checked={product.is_featured} onChange={(event) => updateField('is_featured', event.target.checked)} type="checkbox" className="size-4 rounded border-white/20 bg-zinc-950" /> Destacado</label>
          </div>
          <button disabled={saving} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black disabled:opacity-50">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        </section>
      </form>
    </div>
  );
}
