import Image from 'next/image';
import Link from 'next/link';
import { Anchor, ArrowRight, Building2, Droplets, Home, Store, Waves, type LucideIcon } from 'lucide-react';
import { serviceImagery, type ServiceVisualId } from '@/content/service-imagery';
import type { TranslationKey } from '@/data/i18n';

type Service = {
  titleKey: TranslationKey;
  categoryKey: TranslationKey;
  descriptionKey: TranslationKey;
  visual: ServiceVisualId;
  icon: LucideIcon;
};

const services: Service[] = [
  {
    titleKey: 'pps.retail.title',
    categoryKey: 'pps.retail.cat',
    descriptionKey: 'pps.retail.desc',
    visual: 'retailGlass',
    icon: Store,
  },
  {
    titleKey: 'pps.residential.title',
    categoryKey: 'pps.residential.cat',
    descriptionKey: 'pps.residential.desc',
    visual: 'waterfrontResidences',
    icon: Home,
  },
  {
    titleKey: 'pps.offices.title',
    categoryKey: 'pps.offices.cat',
    descriptionKey: 'pps.offices.desc',
    visual: 'officeAtrium',
    icon: Building2,
  },
  {
    titleKey: 'pps.hospitality.title',
    categoryKey: 'pps.hospitality.cat',
    descriptionKey: 'pps.hospitality.desc',
    visual: 'hospitalityLobby',
    icon: Waves,
  },
  {
    titleKey: 'pps.marina.title',
    categoryKey: 'pps.marina.cat',
    descriptionKey: 'pps.marina.desc',
    visual: 'marina',
    icon: Anchor,
  },
  {
    titleKey: 'pps.exterior.title',
    categoryKey: 'pps.exterior.cat',
    descriptionKey: 'pps.exterior.desc',
    visual: 'exteriorSurfaces',
    icon: Droplets,
  },
];

/**
 * A native, vertical service grid. It replaces the pinned 900%-scroll GSAP
 * sequence so touch users, keyboard users and reduced-motion users all retain
 * direct, predictable access to each service.
 */
export function PrecisionProtocolScroll({ t }: { t: (key: TranslationKey) => string }) {
  return (
    <section className="bg-zinc-950 px-5 py-20 text-white sm:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-200">{t('pps.badge')}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t('pps.title')}</h2>
          <p className="mt-5 text-base leading-7 text-zinc-300">{t('pps.subtitle')}</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.titleKey} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="relative h-52 bg-zinc-900">
                  <Image src={serviceImagery[service.visual].src} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover opacity-75 transition duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-zinc-950/70 px-3 py-1.5 text-xs font-medium backdrop-blur-sm"><Icon className="size-3.5 text-red-200" /> {t(service.categoryKey)}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{t(service.titleKey)}</h3>
                  <p className="mt-3 min-h-14 text-sm leading-6 text-zinc-300">{t(service.descriptionKey)}</p>
                  <Link href="/booking" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-red-200 transition hover:text-white">
                    {t('pps.cta')} <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
