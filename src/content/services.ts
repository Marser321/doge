import type { ComponentType } from 'react';

import {
  CarpetCleaningToolIcon,
  PressureWashingToolIcon,
  WindowCleaningToolIcon,
} from '@/components/services/ServiceToolIcons';
import type { ServiceVisualId } from '@/content/service-imagery';
import type { Lang } from '@/data/i18n';

/**
 * Los iconos de servicio representan la herramienta especializada del oficio.
 * El tipo es deliberadamente amplio para que convivan los SVG propios de
 * `ServiceToolIcons` y cualquier icono de lucide-react.
 */
export type ServiceIcon = ComponentType<{ className?: string }>;

/** Codes must match `service_catalog.code` in Supabase. */
export type ServiceId = 'window-cleaning' | 'pressure-washing' | 'carpet-cleaning';

/** Namespace used to resolve this service's form copy in `TRANSLATIONS`. */
export type ServiceKeyPrefix = 'wc' | 'pw' | 'cc';

type LocalizedText = Record<Lang, string>;

/** Optional equipment photo shown inside the service detail page. */
export type EquipmentImage = {
  src: string;
  alt: LocalizedText;
};

export type ServiceDefinition = {
  id: ServiceId;
  keyPrefix: ServiceKeyPrefix;
  icon: ServiceIcon;
  name: LocalizedText;
  description: LocalizedText;
  /** Short blurb for the search palette. */
  searchDescription: LocalizedText;
  /** Label used in the booking `service_code` select. */
  bookingLabel: LocalizedText;
  accent: string;
  visual: ServiceVisualId;
  equipment: EquipmentImage | null;
};

/**
 * Canonical launch catalogue. Every surface that lists services — the services
 * grid, the home bento, the search palette and the booking select — reads from
 * here so the copy and the slugs cannot drift apart again.
 */
export const SERVICES: ServiceDefinition[] = [
  {
    id: 'window-cleaning',
    keyPrefix: 'wc',
    icon: WindowCleaningToolIcon,
    name: { es: 'Limpieza de Cristales', en: 'Window Cleaning' },
    description: {
      es: 'Tecnología WFP de agua pura. Cristales impecables sin marcas ni químicos. Sube fotos de tus ventanas y recibe un estimado en horas.',
      en: 'WFP pure water technology. Spotless glass with no marks or chemicals. Upload photos of your windows and get an estimate within hours.',
    },
    searchDescription: { es: 'Tecnología WFP de agua pura', en: 'WFP pure water technology' },
    bookingLabel: { es: 'Limpieza de cristales', en: 'Window cleaning' },
    accent: 'from-blue-500/20 to-cyan-500/20',
    visual: 'windowCleaning',
    equipment: null,
  },
  {
    id: 'pressure-washing',
    keyPrefix: 'pw',
    icon: PressureWashingToolIcon,
    name: { es: 'Lavado a Presión', en: 'Pressure Washing' },
    description: {
      es: 'Recuperación de entradas, terrazas, pavimentos y fachadas con presión calibrada según el material. Sin dañar la piedra ni el sellado.',
      en: 'Recovery of driveways, terraces, paving and facades with pressure calibrated to each material. No damage to stone or sealant.',
    },
    searchDescription: { es: 'Superficies exteriores y pavimentos', en: 'Exterior surfaces and paving' },
    bookingLabel: { es: 'Lavado a presión', en: 'Pressure washing' },
    accent: 'from-sky-500/20 to-indigo-500/20',
    visual: 'pressureWashing',
    equipment: {
      src: '/services/surface_cleaner_luxury_1776053413810.png',
      alt: {
        es: 'Limpiador de superficies rotativo trabajando sobre el pavimento de una entrada residencial.',
        en: 'Rotary surface cleaner working across the paving of a residential driveway.',
      },
    },
  },
  {
    id: 'carpet-cleaning',
    keyPrefix: 'cc',
    icon: CarpetCleaningToolIcon,
    name: { es: 'Limpieza de Alfombras', en: 'Carpet Cleaning' },
    description: {
      es: 'Extracción por inyección de agua caliente para alfombras, tapetes y tapicería. Retira manchas y olores en profundidad con secado rápido.',
      en: 'Hot-water extraction for carpets, rugs and upholstery. Removes stains and odors in depth with fast drying.',
    },
    searchDescription: { es: 'Extracción profunda de alfombras y tapicería', en: 'Deep carpet and upholstery extraction' },
    bookingLabel: { es: 'Limpieza de alfombras', en: 'Carpet cleaning' },
    accent: 'from-amber-500/20 to-orange-500/20',
    visual: 'carpetCleaning',
    equipment: {
      src: '/services/carpet_extractor_luxury_1776053430536.png',
      alt: {
        es: 'Extractor de alfombras profesional en operación sobre una alfombra de sala residencial.',
        en: 'Professional carpet extractor in operation on a residential living-room carpet.',
      },
    },
  },
];

export const SERVICE_IDS = SERVICES.map((service) => service.id);

export function getService(id: ServiceId): ServiceDefinition {
  const service = SERVICES.find((candidate) => candidate.id === id);
  if (!service) throw new Error(`Servicio desconocido: ${id}`);
  return service;
}
