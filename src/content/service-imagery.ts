import type { Lang } from '@/data/i18n';

export type ServiceVisualId =
  | 'windowCleaning'
  | 'pressureWashing'
  | 'carpetCleaning'
  | 'residentialVip'
  | 'postConstruction'
  | 'floridaControl'
  | 'retailGlass'
  | 'waterfrontResidences'
  | 'officeAtrium'
  | 'hospitalityLobby'
  | 'marina'
  | 'exteriorSurfaces';

type LocalizedText = Record<Lang, string>;

export type ServiceVisual = {
  src: `/services/${string}.webp`;
  alt: LocalizedText;
  stillPrompt: string;
  animationPrompt: string;
};

type VisualInput = {
  file: string;
  alt: LocalizedText;
  scene: string;
  subject: string;
  composition: string;
  materials: string;
  movement: string;
};

const sharedStillPrompt = `Use case: photorealistic-natural
Asset type: responsive website service-card and section-background poster
Style/medium: realistic editorial architectural photography in Miami and South Florida, never stock photography.
Lighting/mood: soft natural coastal daylight, quiet, precise and premium.
Color palette: titanium noir shadows, cool ocean blue, pale limestone and brushed metal.
Constraints: no people, faces, hands or uniforms; no logos, brands, labels, readable text, watermarks, signage, identifiable vehicle plates or vessel names. No neon, exaggerated HDR or artificial lens flare.
Composition: cinematic 3:2 landscape, central 60 percent kept crop-safe for responsive cards, with calm negative space for an accessible UI overlay.
Avoid: clutter, distorted architecture, text artifacts, generic advertising and any company identity.`;

const stillPrompt = (input: VisualInput) => `${sharedStillPrompt}
Primary request: ${input.scene}
Subject: ${input.subject}
Materials/textures: ${input.materials}
Composition/framing: ${input.composition}`;

const animationPrompt = (input: VisualInput) => `Use case: photorealistic-natural
Asset type: a silent 6–8 second seamless background loop derived from the approved ${input.file} service poster.
Primary request: preserve the exact architecture, materials, color palette and framing of the supplied still. ${input.movement}
Camera: one locked, extremely slow cinematic movement only; no cuts, no zoom jumps, no hand-held shake and no speed ramping.
Constraints: do not introduce people, hands, vehicles, logos, readable text, signs, brands, watermarks, new furniture or changed architecture. Keep the center crop-safe for card text. End on a frame that can loop into the beginning.
Audio: none.`;

const createVisual = (input: VisualInput): ServiceVisual => ({
  src: `/services/${input.file}.webp` as ServiceVisual['src'],
  alt: input.alt,
  stillPrompt: stillPrompt(input),
  animationPrompt: animationPrompt(input),
});

/**
 * Canonical service-art direction. UI consumers must take image paths and alt
 * copy from here; still and animation prompts remain versioned beside them.
 */
export const serviceImagery = {
  windowCleaning: createVisual({
    file: 'window-cleaning',
    alt: {
      es: 'Ventanales de una residencia frente al mar en Miami, con cristal limpio y una herramienta de agua pura sin operador visible.',
      en: 'Oceanfront Miami residence windows with clean glass and a pure-water tool without an operator in view.',
    },
    scene: 'Premium South Florida penthouse with floor-to-ceiling oceanfront windows freshly cleaned with pure water; immaculate glass reflects a pale blue Miami morning sky and distant bay, with a single unbranded telescopic water-fed cleaning pole only at the far edge of the frame.',
    subject: 'Pristine window glass, reflections and an elegant architectural waterfront view.',
    materials: 'crystal-clear glass, subtle water beads, natural stone and anodized metal.',
    composition: 'a wide window wall with the water view held in the central safe frame and the cleaning pole at the far edge.',
    movement: 'A nearly imperceptible dolly-in; water reflections and a few droplets drift naturally while every architectural line remains stable.',
  }),
  pressureWashing: createVisual({
    file: 'pressure-washing',
    alt: {
      es: 'Entrada y pavimento de piedra de una villa costera recién recuperados, con brillo húmedo controlado y sin operador a la vista.',
      en: 'Freshly recovered stone driveway and paving of a coastal villa, with a controlled wet sheen and no operator in view.',
    },
    scene: 'A South Florida coastal villa entry immediately after professional pressure washing; limestone pavers and architectural stone restored to an even tone, a crisp boundary between treated and untreated paving, and a thin controlled film of water with no equipment or operator in the frame.',
    subject: 'Restored exterior paving, even stone tone and precise surface recovery.',
    materials: 'clean limestone pavers, architectural stone, controlled water sheen and pale mortar joints.',
    composition: 'a low wide perspective along the generous clean approach, with the treated paving held in the central safe frame.',
    movement: 'A low, extremely slow travelling movement; the wet stone glints gently and palm shadows drift with no spray or action.',
  }),
  carpetCleaning: createVisual({
    file: 'carpet-cleaning',
    alt: {
      es: 'Sala residencial premium vacía con alfombra de lana recién extraída, fibras levantadas y luz natural suave.',
      en: 'Empty premium living room with a freshly extracted wool carpet, lifted fibers and soft natural light.',
    },
    scene: 'An immaculate empty Miami living room right after professional hot-water carpet extraction; a deep wool rug with visibly lifted, evenly groomed fibers, neutral linen seating pulled clear of the pile and warm oak millwork around it.',
    subject: 'Restored carpet pile, even fiber texture and quiet residential order.',
    materials: 'deep wool pile, woven linen, oak grain, honed stone and clean glass.',
    composition: 'a low angle across the groomed rug toward the seating, keeping the carpet field crop-safe for overlay text.',
    movement: 'A slow lateral slide close to the pile; daylight shifts almost imperceptibly across the fibers while the room stays empty.',
  }),
  residentialVip: createVisual({
    file: 'residential-vip',
    alt: {
      es: 'Sala residencial premium vacía frente a la bahía, con mármol, madera y mobiliario neutro impecablemente cuidado.',
      en: 'Empty premium bayfront living room with marble, wood and meticulously maintained neutral furniture.',
    },
    scene: 'An immaculate empty luxury residence in Miami, a calm living room with honed limestone flooring, warm oak millwork, neutral linen seating and carefully preserved natural materials after a meticulous deep-cleaning service.',
    subject: 'Elegant clean residential space, material preservation and quiet order.',
    materials: 'honed marble, oak grain, woven linen, brushed metal and clean glass.',
    composition: 'balanced architectural depth with the main seating and water view safely centered.',
    movement: 'A slow lateral slide; daylight and the soft shadow of sheer blinds shift only slightly while the room remains perfectly still.',
  }),
  postConstruction: createVisual({
    file: 'post-construction',
    alt: {
      es: 'Lobby nuevo y vacío de un condominio de Miami, con piedra, vidrio y acabados listos tras una limpieza post-construcción.',
      en: 'New empty Miami condominium lobby with stone, glass and finishes ready after post-construction cleaning.',
    },
    scene: 'A newly completed luxury condominium lobby in Miami after professional post-construction cleaning; pristine limestone, architectural glass and brushed steel, with one small unbranded extraction unit resting discreetly in the distant background.',
    subject: 'Clean new-build finishes, high-end materials and precise readiness.',
    materials: 'lightly honed stone, clean glass, fine metal and barely visible atmospheric dust far from the subject.',
    composition: 'strong depth lines toward the quiet lobby center, preserving open flooring for overlay text.',
    movement: 'A subtle forward push; a trace of out-of-focus atmospheric dust settles in the far background without suggesting an active construction site.',
  }),
  floridaControl: createVisual({
    file: 'florida-control',
    alt: {
      es: 'Área técnica de una propiedad costera con deshumidificador sin marca, piedra y madera secas junto a una ventana con humedad exterior leve.',
      en: 'Coastal-property technical area with an unbranded dehumidifier, dry stone and wood beside a window with slight outdoor humidity.',
    },
    scene: 'A serene, immaculate coastal-property utility room in South Florida for moisture-control assessment; an elegant unbranded dehumidifier, dry natural wood and limestone surfaces, and a clear window with subtle morning humidity only at its outer edge.',
    subject: 'Moisture prevention, dry materials and discreet professional readiness.',
    materials: 'dry oak, natural stone, softly misted glass edge and matte technical surfaces.',
    composition: 'calm layered technical corner with the appliance centered and clean wall space kept open for an overlay.',
    movement: 'A fixed camera with micro-movement; exterior condensation gently evolves while the dry interior remains unchanged.',
  }),
  retailGlass: createVisual({
    file: 'retail-glass',
    alt: {
      es: 'Fachada vacía de boutique premium en Miami, con vidrio impecable y reflejos urbanos discretos al amanecer.',
      en: 'Empty premium Miami boutique facade with immaculate glass and subtle urban reflections at dawn.',
    },
    scene: 'An empty luxury retail storefront in Miami at early morning, floor-to-ceiling spotless glass, refined stone facade and understated interior silhouettes, calm urban reflections with no shop identity.',
    subject: 'Pristine retail glazing and an inviting premium facade.',
    materials: 'polished glass, honed stone, brushed metal and subtle city reflection.',
    composition: 'symmetrical storefront geometry with no signboard in view and a clear central entry.',
    movement: 'A very slow, stable push-in; soft ambient reflections and palm shadows shift naturally across the glass.',
  }),
  waterfrontResidences: createVisual({
    file: 'waterfront-residences',
    alt: {
      es: 'Balcón vacío de torre residencial frente a la bahía de Miami, con barandas de vidrio limpias y vista de skyline.',
      en: 'Empty Miami bayfront tower balcony with clean glass railings and a skyline view.',
    },
    scene: 'An empty Miami waterfront high-rise residence balcony with immaculate transparent glass railings, a calm bay and distant skyline, pale limestone terrace and restrained outdoor furniture with no occupants.',
    subject: 'Clean glass balustrades, cared-for exterior materials and tranquil water view.',
    materials: 'spotless glass, honed limestone, brushed aluminum and a gentle water surface.',
    composition: 'layered foreground railing, bay and skyline with the central span kept clean for a card crop.',
    movement: 'A subtle parallax drift between railing, water and skyline; the bay surface ripples delicately.',
  }),
  officeAtrium: createVisual({
    file: 'office-atrium',
    alt: {
      es: 'Atrio corporativo vacío de Miami con vidrio, acero, piedra y áreas comunes impecablemente mantenidas.',
      en: 'Empty Miami corporate atrium with glass, steel, stone and impeccably maintained common areas.',
    },
    scene: 'An empty premium corporate atrium in Miami with immaculate glazing, brushed stainless steel, pale stone floor and quiet reception architecture, meticulously maintained with no office branding.',
    subject: 'Clean architectural glass, ordered shared facilities and precision maintenance.',
    materials: 'spotless glass, satin metal, honed stone and matte plaster.',
    composition: 'a deep sightline toward the glass facade, with simple open central space and no desks.',
    movement: 'A restrained advance through the atrium; daylight shifts almost imperceptibly across the floor and glass.',
  }),
  hospitalityLobby: createVisual({
    file: 'hospitality-lobby',
    alt: {
      es: 'Lobby vacío de hotel boutique costero, con piedra, roble, vegetación y vidrio preparados discretamente para huéspedes.',
      en: 'Empty coastal boutique-hotel lobby with stone, oak, greenery and glass discreetly prepared for guests.',
    },
    scene: 'An empty boutique hotel lobby in South Florida, immaculate pale stone, warm oak, restrained tropical greenery and polished glass, carefully prepared for guests but with no hotel identity visible.',
    subject: 'Discreet hospitality maintenance and pristine shared space.',
    materials: 'honed stone, clean glass, woven upholstery, brushed brass and controlled greenery.',
    composition: 'elegant depth with a calm wall-and-floor zone preserved for an overlay.',
    movement: 'A stable camera with gentle optical breathing; restrained reflections move across glass and metal while the lobby stays empty.',
  }),
  marina: createVisual({
    file: 'marina',
    alt: {
      es: 'Marina tranquila del sur de Florida con muelle limpio, barandas de acero y vidrio, y embarcaciones sin identificación.',
      en: 'Quiet South Florida marina with a clean dock, steel and glass railings, and unmarked vessels.',
    },
    scene: 'A calm upscale South Florida marina at morning with a perfectly clean dock, stainless-steel railings, immaculate glass windbreaks and elegant unbranded vessels moored in the distance without names or registration marks.',
    subject: 'Cared-for marine-exposed glass and metal surfaces, calm water reflections.',
    materials: 'stainless steel, clear glass, clean teak and soft water ripples.',
    composition: 'foreground rail and dock lead toward open water, preserving the central dock path for a card crop.',
    movement: 'Water ripples and reflections move softly while the camera glides forward at an almost unnoticeable pace.',
  }),
  exteriorSurfaces: createVisual({
    file: 'exterior-surfaces',
    alt: {
      es: 'Acceso de villa costera con piedra y pavimento tratados, brillo húmedo controlado y vegetación tropical sobria.',
      en: 'Coastal villa entry with treated stone and paving, controlled wet sheen and restrained tropical greenery.',
    },
    scene: 'A freshly restored exterior entry to a coastal South Florida villa: immaculate limestone pavers and architectural stone, fine controlled water sheen and precise material texture, with no operator or active equipment visible.',
    subject: 'Recovered exterior surfaces, wet stone sheen and calm material detail.',
    materials: 'clean pavers, natural stone, minimal controlled water sheen and clear glass.',
    composition: 'a refined low perspective across generous clean paving toward the villa, with the central approach crop-safe.',
    movement: 'A low, slow travelling movement; the wet stone glints gently and palm shadows drift with no action or spray.',
  }),
} as const satisfies Record<ServiceVisualId, ServiceVisual>;

export const primaryServiceVisuals = {
  'window-cleaning': 'windowCleaning',
  'pressure-washing': 'pressureWashing',
  'carpet-cleaning': 'carpetCleaning',
} as const satisfies Record<string, ServiceVisualId>;
