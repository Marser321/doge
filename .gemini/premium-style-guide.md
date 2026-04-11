# DOGE.S.M LLC — Premium Style Guide

> Extracted from [Agency Agents / Senior Developer](https://github.com/msitarzewski/agency-agents) and adapted to Tailwind CSS v4 + Next.js App Router.

## Mandatory Design Standards

### 1. Luxury Glass (Glassmorphism Tier System)

| Tier | Blur | Saturate | Use Case |
|------|------|----------|----------|
| `glass-panel` | 16px | 100% | Cards, panels, modals |
| `luxury-glass` | 30px | 200% | Hero nav, feature sections, CTAs |
| `glass-panel-heavy` | 24px | 150% | Bottom nav, overlays |

```css
/* The luxury-glass pattern — ALWAYS use for hero and nav elements */
.luxury-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### 2. Magnetic Elements

All interactive elements MUST use the premium easing curve:

```css
/* The magnetic curve — cubic-bezier(0.16, 1, 0.3, 1) */
.magnetic-element {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.magnetic-element:hover {
  transform: scale(1.05) translateY(-2px);
}
```

### 3. Premium Typography Scale

Use `clamp()` for fluid responsive headings:

```
Hero H1:     clamp(3rem, 8vw, 7rem)
Section H2:  clamp(2rem, 5vw, 4rem)
Card H3:     clamp(1.25rem, 3vw, 2rem)
Body/Meta:   clamp(0.75rem, 1.2vw, 0.875rem)
```

### 4. Animation Performance Rules

- ALL animations MUST run at 60fps
- Use `transform` and `opacity` ONLY for animations (composited properties)
- Add `will-change: transform` to elements with continuous animations
- Total page load under 1.5 seconds
- Use `prefers-reduced-motion: reduce` to disable non-essential animations

### 5. Color Philosophy: Titanium Noir

- Dark mode: Near-black backgrounds (`#09090b`), zinc-based accents
- Light mode: Ice white (`#fafafa`), inverted accent hierarchy
- NEVER use pure black (`#000`) or pure white (`#fff`) as backgrounds
- Accents: Always muted zinc tones — no saturated colors

### 6. Spacing & Layout

- Use generous whitespace — luxury = silence between elements
- Minimum section padding: `py-24 md:py-48`
- Card padding: `p-8 md:p-10` minimum
- Border radius: `rounded-2xl` (16px) for cards, `rounded-[32px]` for hero elements
- Border: Always use themed glass borders, never solid colors

### 7. Theme Toggle (Mandatory)

Every page MUST support dark/light toggle via `data-theme` attribute on `<html>`. Theme transitions use `var(--ease-haptic)` at 600ms duration.

---

## Master Prompts (Permanent Design Rules)

### 8. Apple-Level Refinement Standard

> All implementations must achieve "Apple-level refinement" with meticulous attention to detail. Implement lightweight, purpose-driven animations for micro-interactions (hover states, clicks) and scroll reveals to create a sense of fluidity and delight. Avoid flat aesthetics; incorporate dynamic interactive elements, blur overlays, interpolated gradients, subtle glows, and parallax effects to create spatial depth.

### 9. Whimsy Injector Identity

> The "Whimsy Injector" role transforms functional interfaces into memorable experiences by adding personality and moments of joy. Analyze interfaces for opportunities for playful micro-interactions, celebration animations (particles, confetti after success actions), and unexpected visual details. Every added element MUST serve a functional or emotional purpose that improves cognitive retention without distracting the user.

### 10. Tactical Execution Patterns

**Entrance Animations (Consistency)**:
- Fade + translateY(20px), duration 0.6s, easing `easeOut`
- Lists/grids: stagger with 120ms delay between elements
- Always prefer subtlety

**Hover Micro-interactions**:
- CTA buttons: gradient shift + shadow bloom on hover (`cta-glow` utility)
- Feature cards: kinetic cursor-tilt ±5° max via `<TiltCard>` component
- All use `cubic-bezier(0.16, 1, 0.3, 1)` as the motion curve

**Cinematic Transitions**:
- Section blur dividers between major sections for cinematic scroll flow
- Circular mask expansion for scroll-revealed images (`PrecisionReveal`)
- Fade + blur layering for depth-of-field effects

### 11. Surgical Refactoring Shield

> **MANDATORY BEFORE ANY VISUAL CHANGE**: Proceed with exclusively visual improvements. Ensure through strict validation that operational functionality and underlying logic remain entirely unaltered. Obtain exhaustive understanding of how the interface interacts with the application and guarantee that the logic tree, React state management, and API connections remain perfectly intact after adding animations and redesign.
