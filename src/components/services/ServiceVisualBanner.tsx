import Image from 'next/image';
import type { Lang } from '@/data/i18n';
import { serviceImagery, type ServiceVisualId } from '@/content/service-imagery';

type ServiceVisualBannerProps = {
  visualId: ServiceVisualId;
  lang: Lang;
};

/** A semantic poster today and the static fallback for future motion loops. */
export function ServiceVisualBanner({ visualId, lang }: ServiceVisualBannerProps) {
  const visual = serviceImagery[visualId];

  return (
    <figure className="relative mb-10 h-56 overflow-hidden rounded-[28px] border border-foreground/10 bg-zinc-950 shadow-2xl sm:h-72">
      <Image
        src={visual.src}
        alt={visual.alt[lang]}
        fill
        sizes="(min-width: 1024px) 56rem, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950/55 via-zinc-950/5 to-transparent" aria-hidden="true" />
    </figure>
  );
}
