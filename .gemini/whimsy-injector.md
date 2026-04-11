# DOGE.S.M LLC — Whimsy Injector Design Rules

> Extracted from [Agency Agents / Whimsy Injector](https://github.com/msitarzewski/agency-agents) and adapted to the DOGE Titanium Noir aesthetic.

## Whimsy Taxonomy for DOGE

### 1. Subtle Whimsy (Always Active)

These are ambient, low-impact micro-interactions:

- **Shimmer Sweep**: A diagonal light sweep across CTA buttons on hover
- **Magnetic Hover**: Interactive elements lift 2px and scale 1.02× on hover
- **Glass Border Glow**: Glass panels brighten border opacity on hover (10% → 40%)
- **Silver Text Pulse**: Gradient headings subtly shift on scroll

### 2. Interactive Whimsy (User-Triggered)

These activate on explicit user interaction:

- **Form Validation Sparkle**: `✨` emoji appears with scale animation on valid input
- **Booking Confirmation Confetti**: Particle burst on step 3 completion
- **Plan Selection Pulse**: Selected membership plan emits a ring pulse

### 3. Discovery Whimsy (Easter Eggs)

Hidden features that reward exploration:

- **Konami Code** (`↑↑↓↓←→←→BA`): Activates 10-second rainbow gradient mode on dark theme
- **Logo 5-Click**: Clicking the DOGE logo 5× rapidly triggers floating emoji rain

### 4. Contextual Whimsy (Situation-Aware)

- **404 Pages**: "Esta página fue a limpiarse. Volvemos pronto."
- **Empty States**: "Tu carrito está más limpio que un cristal DOGE."
- **Loading States**: "Preparando suministros tácticos..."

## CSS Patterns

### Shimmer Sweep Button
```css
@utility btn-whimsy {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
/* Requires ::before pseudo-element for the light sweep */
```

### Celebration Keyframes
```css
@keyframes sparkle {
  0%, 100% { transform: scale(1); opacity: 0; }
  50% { transform: scale(1.3); opacity: 1; }
}

@keyframes celebrate {
  0% { transform: translateY(0) scale(0); opacity: 0; }
  50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
  100% { transform: translateY(-30px) scale(1); opacity: 0; }
}

@keyframes float-up {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
}
```

## Accessibility Rules

- ALL whimsy animations MUST respect `@media (prefers-reduced-motion: reduce)`
- Easter eggs must NOT interfere with screen readers
- Confetti particles use `aria-hidden="true"`
- No motion-dependent functionality — all whimsy is decorative
