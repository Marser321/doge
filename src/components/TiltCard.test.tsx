import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { TiltCard } from './TiltCard';

function mockEnvironment({ width, reducedMotion = false }: { width: number; reducedMotion?: boolean }) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
}

async function nextFrame() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe('TiltCard', () => {
  beforeEach(() => {
    // React informa por consola el error que el test espera no ver.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test('en un teléfono muestra el contenido sin inclinación y sin romper la página', async () => {
    mockEnvironment({ width: 390 });
    const { container } = render(<TiltCard>Contenido</TiltCard>);
    await nextFrame();

    expect(screen.getByText('Contenido')).toBeTruthy();
    expect(container.querySelector('.tilt-card')).toBeNull();
  });

  test('con movimiento reducido en computadora tampoco rompe la página', async () => {
    mockEnvironment({ width: 1440, reducedMotion: true });
    const { container } = render(<TiltCard>Contenido</TiltCard>);
    await nextFrame();

    expect(screen.getByText('Contenido')).toBeTruthy();
    expect(container.querySelector('.tilt-card')).toBeNull();
  });

  test('en computadora conserva la inclinación', async () => {
    mockEnvironment({ width: 1440 });
    const { container } = render(<TiltCard>Contenido</TiltCard>);
    await nextFrame();

    expect(container.querySelector('.tilt-card')).not.toBeNull();
  });

  test('sobrevive al cruzar el ancho de teléfono en los dos sentidos', async () => {
    mockEnvironment({ width: 1440 });
    const { container } = render(<TiltCard>Contenido</TiltCard>);
    await nextFrame();

    for (const [width, tilted] of [[390, false], [1440, true], [390, false]] as const) {
      window.innerWidth = width;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.getByText('Contenido')).toBeTruthy();
      expect(container.querySelector('.tilt-card') !== null).toBe(tilted);
    }
  });
});
