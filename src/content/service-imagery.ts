import type { Lang } from '@/data/i18n';

export type ServiceVisualId =
  | 'windowCleaning'
  | 'pressureWashing'
  | 'carpetCleaning';

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
    file: 'window-cleaning-result',
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
    file: 'pressure-washing-result',
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
    file: 'carpet-cleaning-result',
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
} as const satisfies Record<ServiceVisualId, ServiceVisual>;

export const primaryServiceVisuals = {
  'window-cleaning': 'windowCleaning',
  'pressure-washing': 'pressureWashing',
  'carpet-cleaning': 'carpetCleaning',
} as const satisfies Record<string, ServiceVisualId>;
