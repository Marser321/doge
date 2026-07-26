import { Baby, Bath, PawPrint, ScrollText, Shirt, SprayCan, Trash2, type LucideIcon } from 'lucide-react';

import type { Lang } from '@/data/i18n';

type LocalizedText = Record<Lang, string>;

export type DepartmentId =
  | 'home-cleaning'
  | 'laundry'
  | 'paper-hygiene'
  | 'disposables'
  | 'personal-care'
  | 'baby-care'
  | 'pet-care';

export type StoreSubcategory = {
  id: string;
  label: LocalizedText;
};

export type StoreDepartment = {
  id: DepartmentId;
  icon: LucideIcon;
  label: LocalizedText;
  subcategories: StoreSubcategory[];
};

/**
 * Canonical store taxonomy. `products.category` stores one of these slugs —
 * normally a subcategory, or a department slug when no subcategory applies.
 * The department of a product is derived from the slug rather than stored, so
 * the two can never disagree.
 */
export const STORE_DEPARTMENTS: StoreDepartment[] = [
  {
    id: 'home-cleaning',
    icon: SprayCan,
    label: { es: 'Limpieza del hogar', en: 'Home Cleaning' },
    subcategories: [
      { id: 'all-purpose-cleaners', label: { es: 'Limpiadores multiusos', en: 'All-purpose cleaners' } },
      { id: 'bathroom-cleaners', label: { es: 'Limpiadores para baños', en: 'Bathroom cleaners' } },
      { id: 'kitchen-cleaners', label: { es: 'Limpiadores para cocina', en: 'Kitchen cleaners' } },
      { id: 'disinfectants', label: { es: 'Desinfectantes', en: 'Disinfectants' } },
      { id: 'glass-cleaners', label: { es: 'Limpiavidrios', en: 'Glass cleaners' } },
      { id: 'floor-cleaners', label: { es: 'Limpiadores para pisos', en: 'Floor cleaners' } },
      { id: 'degreasers', label: { es: 'Removedores de grasa', en: 'Degreasers' } },
      { id: 'air-fresheners', label: { es: 'Ambientadores', en: 'Air fresheners' } },
    ],
  },
  {
    id: 'laundry',
    icon: Shirt,
    label: { es: 'Lavandería', en: 'Laundry' },
    subcategories: [
      { id: 'liquid-detergents', label: { es: 'Detergentes líquidos', en: 'Liquid detergents' } },
      { id: 'powder-detergents', label: { es: 'Detergentes en polvo', en: 'Powder detergents' } },
      { id: 'laundry-pods', label: { es: 'Cápsulas', en: 'Laundry pods' } },
      { id: 'fabric-softeners', label: { es: 'Suavizantes', en: 'Fabric softeners' } },
      { id: 'stain-removers', label: { es: 'Quitamanchas', en: 'Stain removers' } },
      { id: 'bleach', label: { es: 'Blanqueadores', en: 'Bleach' } },
    ],
  },
  {
    id: 'paper-hygiene',
    icon: ScrollText,
    label: { es: 'Papel e higiene', en: 'Paper & Hygiene' },
    subcategories: [
      { id: 'toilet-paper', label: { es: 'Papel higiénico', en: 'Toilet paper' } },
      { id: 'paper-towels', label: { es: 'Toallas de papel', en: 'Paper towels' } },
      { id: 'napkins', label: { es: 'Servilletas', en: 'Napkins' } },
      { id: 'facial-tissues', label: { es: 'Pañuelos desechables', en: 'Facial tissues' } },
    ],
  },
  {
    id: 'disposables',
    icon: Trash2,
    label: { es: 'Desechables y bolsas', en: 'Disposables & Bags' },
    subcategories: [
      { id: 'trash-bags', label: { es: 'Bolsas de basura', en: 'Trash bags' } },
      { id: 'disposable-gloves', label: { es: 'Guantes desechables', en: 'Disposable gloves' } },
      { id: 'disposable-tableware', label: { es: 'Vasos, platos y cubiertos desechables', en: 'Disposable tableware' } },
      { id: 'aluminum-foil', label: { es: 'Papel aluminio', en: 'Aluminum foil' } },
      { id: 'plastic-wrap', label: { es: 'Film plástico', en: 'Plastic wrap' } },
    ],
  },
  {
    id: 'personal-care',
    icon: Bath,
    label: { es: 'Aseo personal', en: 'Personal Care' },
    subcategories: [
      { id: 'body-soap', label: { es: 'Jabones corporales', en: 'Body soaps' } },
      { id: 'shampoo', label: { es: 'Champús', en: 'Shampoos' } },
      { id: 'conditioner', label: { es: 'Acondicionadores', en: 'Conditioners' } },
      { id: 'toothpaste', label: { es: 'Pasta dental', en: 'Toothpaste' } },
      { id: 'toothbrushes', label: { es: 'Cepillos de dientes', en: 'Toothbrushes' } },
      { id: 'mouthwash', label: { es: 'Enjuagues bucales', en: 'Mouthwash' } },
      { id: 'deodorants', label: { es: 'Desodorantes', en: 'Deodorants' } },
      { id: 'body-lotions', label: { es: 'Cremas corporales', en: 'Body lotions' } },
      { id: 'razors', label: { es: 'Rasuradoras', en: 'Razors' } },
      { id: 'feminine-care', label: { es: 'Toallas sanitarias y productos femeninos', en: 'Feminine care' } },
    ],
  },
  {
    id: 'baby-care',
    icon: Baby,
    label: { es: 'Cuidado del bebé', en: 'Baby Care' },
    subcategories: [
      { id: 'diapers', label: { es: 'Pañales', en: 'Diapers' } },
      { id: 'baby-wipes', label: { es: 'Toallitas húmedas', en: 'Baby wipes' } },
      { id: 'baby-bath', label: { es: 'Champú y jabón para bebé', en: 'Baby shampoo & soap' } },
      { id: 'diaper-cream', label: { es: 'Cremas para pañal', en: 'Diaper cream' } },
      { id: 'bottles-accessories', label: { es: 'Biberones y accesorios', en: 'Bottles & accessories' } },
    ],
  },
  {
    id: 'pet-care',
    icon: PawPrint,
    label: { es: 'Cuidado de mascotas', en: 'Pet Care' },
    subcategories: [
      { id: 'pet-shampoo', label: { es: 'Champú para mascotas', en: 'Pet shampoo' } },
      { id: 'pet-wipes', label: { es: 'Toallitas', en: 'Pet wipes' } },
      { id: 'waste-bags', label: { es: 'Bolsas para desechos', en: 'Waste bags' } },
      { id: 'pet-hygiene', label: { es: 'Productos de higiene', en: 'Hygiene products' } },
    ],
  },
];

const DEPARTMENT_BY_ID = new Map(STORE_DEPARTMENTS.map((department) => [department.id as string, department]));

const DEPARTMENT_BY_SUBCATEGORY = new Map<string, StoreDepartment>(
  STORE_DEPARTMENTS.flatMap((department) =>
    department.subcategories.map((subcategory) => [subcategory.id, department] as const),
  ),
);

const SUBCATEGORY_BY_ID = new Map(
  STORE_DEPARTMENTS.flatMap((department) => department.subcategories.map((subcategory) => [subcategory.id, subcategory] as const)),
);

/** Every slug accepted by `products.category`: departments and subcategories. */
export const ALL_CATEGORY_SLUGS: ReadonlySet<string> = new Set([
  ...DEPARTMENT_BY_ID.keys(),
  ...SUBCATEGORY_BY_ID.keys(),
]);

export function isCategorySlug(value: string): boolean {
  return ALL_CATEGORY_SLUGS.has(value);
}

/** Resolves the department a stored category belongs to, if any. */
export function resolveDepartment(category: string | null | undefined): StoreDepartment | null {
  if (!category) return null;
  return DEPARTMENT_BY_SUBCATEGORY.get(category) ?? DEPARTMENT_BY_ID.get(category) ?? null;
}

export function resolveSubcategory(category: string | null | undefined): StoreSubcategory | null {
  if (!category) return null;
  return SUBCATEGORY_BY_ID.get(category) ?? null;
}

/** Human label for a stored category slug; falls back to the raw value. */
export function categoryLabel(category: string | null | undefined, lang: Lang): string | null {
  if (!category) return null;
  const subcategory = SUBCATEGORY_BY_ID.get(category);
  if (subcategory) return subcategory.label[lang];
  const department = DEPARTMENT_BY_ID.get(category);
  if (department) return department.label[lang];
  return category;
}
