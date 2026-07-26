import { describe, expect, it } from 'vitest';
import { serviceImagery } from './service-imagery';

describe('service imagery', () => {
  it('keeps the complete service library local, distinct and prompt-ready', () => {
    const visuals = Object.values(serviceImagery);

    expect(visuals).toHaveLength(12);
    expect(new Set(visuals.map(({ src }) => src)).size).toBe(12);

    for (const visual of visuals) {
      expect(visual.src).toMatch(/^\/services\/[a-z-]+\.webp$/);
      expect(visual.alt.es).toBeTruthy();
      expect(visual.alt.en).toBeTruthy();
      expect(visual.stillPrompt).toContain('no people');
      expect(visual.stillPrompt).toContain('no logos');
      expect(visual.animationPrompt).toContain('6–8 second seamless background loop');
      expect(visual.animationPrompt).toContain('no cuts');
    }
  });
});
