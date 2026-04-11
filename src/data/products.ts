export type ProductPurchaseStatus = "live" | "coming_soon";
export type ProductPurchaseChannel = "amazon" | "whatsapp";

export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  brand: string;
  name: string;
  tagline: string;
  desc: string;
  detailedDesc: string;
  price: number;
  img: string;
  accent: string;
  benefit: string;
  specs: ProductSpec[];
  purchaseChannel: ProductPurchaseChannel;
  purchaseStatus: ProductPurchaseStatus;
  purchaseUrl: string;
  purchaseLabel: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "dyson_v15",
    brand: "Dyson",
    name: "V15 Detect Absolute",
    tagline: "Sensor Piezo de Polvo Forense",
    desc: "El estándar de oro en aspiración de lujo. Detecta partículas microscópicas invisibles al ojo humano para una desinfección total.",
    detailedDesc:
      "Utilizado por nuestros equipos tácticos para auditorías de polvo fino. El láser detecta partículas que otros omiten, garantizando un ambiente hipoalergénico real para residencias de alto perfil.",
    price: 749,
    img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=2670&auto=format&fit=crop",
    accent: "from-purple-600 to-purple-900",
    benefit: "Garantía Extendida DOGE",
    specs: [
      { label: "Succión", value: "240AW" },
      { label: "Autonomía", value: "60 min" },
      { label: "Peso", value: "3.1kg" },
      { label: "Filtrado", value: "99.99%" },
    ],
    purchaseChannel: "amazon",
    purchaseStatus: "coming_soon",
    purchaseUrl: "https://amzn.to/3DysonV15",
    purchaseLabel: "Comprar en Amazon",
  },
  {
    id: "karcher_sc3",
    brand: "Kärcher",
    name: "SC 3 Carbon Elite",
    tagline: "Vapor Continuo Sin Químicos",
    desc: "Limpieza por vapor de grado industrial. Elimina el 99.99% de bacterias y virus mediante choque térmico controlado.",
    detailedDesc:
      "La herramienta fundamental para sanitización profunda de baños y cocinas. Sin químicos residuales, ideal para hogares con mascotas y niños pequeños donde la pureza superficial es prioridad.",
    price: 199,
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop",
    accent: "from-yellow-400 to-yellow-700",
    benefit: "DOGE Training Included",
    specs: [
      { label: "Presión", value: "3.5 Bar" },
      { label: "Calentamiento", value: "30 seg" },
      { label: "Depósito", value: "1.0L" },
      { label: "Alcance", value: "75m²" },
    ],
    purchaseChannel: "amazon",
    purchaseStatus: "coming_soon",
    purchaseUrl: "https://amzn.to/3KarcherSC3",
    purchaseLabel: "Comprar en Amazon",
  },
  {
    id: "bissell_big_green",
    brand: "Bissell",
    name: "Big Green Professional",
    tagline: "Extracción Profunda Tactica",
    desc: "La máquina definitiva para alfombras en Miami. Succión comercial que recupera las fibras dañadas por la arena y humedad.",
    detailedDesc:
      "Nuestra recomendación para el mantenimiento preventivo de suites en Brickell. Extrae la salinidad y humedad profunda que el aspirado regular no alcanza, extendiendo la vida de sus textiles de lujo.",
    price: 430,
    img: "/products/bissell_big_green.png",
    accent: "from-green-600 to-green-900",
    benefit: "Insumos Químicos Kit Pro",
    specs: [
      { label: "Motor", value: "Commercial" },
      { label: "Tanque", value: "1.75 Gal" },
      { label: "Cepillo", value: "PowerBrush" },
      { label: "Limpieza", value: "Xtra Large" },
    ],
    purchaseChannel: "amazon",
    purchaseStatus: "coming_soon",
    purchaseUrl: "https://amzn.to/3BissellBigGreen",
    purchaseLabel: "Comprar en Amazon",
  },
  {
    id: "mold_control",
    brand: "DOGE Lab",
    name: "Nano-Sellador de Hongos",
    tagline: "Protección Química Prolongada",
    desc: "Fórmula algorítmica concentrada. Inhibe la floración de esporas de humedad (moho) en paredes y placares ciegos.",
    detailedDesc:
      "Desarrollado específicamente para el clima del sur de Florida. Una barrera invisible de nanotecnología que sella los poros de las superficies más difíciles, esencial para vestidores y cavas de vino.",
    price: 85,
    img: "/products/mold_control.png",
    accent: "from-red-600 to-red-900",
    benefit: "Exclusivo DOGE.S.M LLC",
    specs: [
      { label: "Duración", value: "12 Meses" },
      { label: "Secado", value: "15 Min" },
      { label: "Base", value: "Nano-Titanio" },
      { label: "Olor", value: "Neutro" },
    ],
    purchaseChannel: "whatsapp",
    purchaseStatus: "live",
    purchaseUrl: "https://wa.me/17869283948",
    purchaseLabel: "Contactar Concierge",
  },
];

export const PRODUCTS_BY_ID: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((product) => [product.id, product]),
);
