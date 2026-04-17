import { renderHook, act } from '@testing-library/react';
import { useMagnetic } from './useMagnetic';
import { expect, test, describe, beforeEach, mock } from 'bun:test';

// Mock framer-motion to simplify testing
// We mock useSpring to just return the underlying motion value, making it synchronous
mock.module('framer-motion', () => ({
  useMotionValue: (initial: number) => {
    let value = initial;
    return {
      get: () => value,
      set: (newValue: number) => { value = newValue; }
    };
  },
  useSpring: (value: any) => value, // Passthrough for tests
}));

describe('useMagnetic', () => {
  let mockMatchMedia: ReturnType<typeof mock>;

  beforeEach(() => {
    mockMatchMedia = mock((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  test('initial state', () => {
    const { result } = renderHook(() => useMagnetic());
    expect(result.current.isHovered).toBe(false);
    expect(result.current.magneticProps.style.x.get()).toBe(0);
    expect(result.current.magneticProps.style.y.get()).toBe(0);
  });

  test('handleMouseEnter sets isHovered to true', () => {
    const { result } = renderHook(() => useMagnetic());

    act(() => {
      result.current.magneticProps.onMouseEnter();
    });

    expect(result.current.isHovered).toBe(true);
  });

  test('handleMouseLeave resets state', () => {
    const { result } = renderHook(() => useMagnetic());

    // Set some initial state first
    act(() => {
      result.current.magneticProps.onMouseEnter();
      result.current.magneticProps.style.x.set(10);
      result.current.magneticProps.style.y.set(20);
    });

    expect(result.current.isHovered).toBe(true);

    act(() => {
      result.current.magneticProps.onMouseLeave();
    });

    expect(result.current.isHovered).toBe(false);
    expect(result.current.magneticProps.style.x.get()).toBe(0);
    expect(result.current.magneticProps.style.y.get()).toBe(0);
  });

  test('handleMouseMove applies magnetic effect', () => {
    const { result } = renderHook(() => useMagnetic(0.5));

    // Mock the ref element and its getBoundingClientRect
    const mockElement = document.createElement('div');
    mockElement.getBoundingClientRect = () => ({
      width: 100,
      height: 100,
      top: 50,
      left: 50,
      bottom: 150,
      right: 150,
      x: 50,
      y: 50,
      toJSON: () => {}
    });

    // Attach the ref
    // We need to bypass the read-only nature of the ref in tests
    (result.current.ref as any).current = mockElement;

    act(() => {
      // Simulate mouse move at (clientX: 120, clientY: 120)
      // Center of element is (100, 100) -> (left + width/2, top + height/2)
      // Distance is X: 20, Y: 20
      // Effect with strength 0.5 should be X: 10, Y: 10
      result.current.magneticProps.onMouseMove({
        clientX: 120,
        clientY: 120
      } as any);
    });

    expect(result.current.magneticProps.style.x.get()).toBe(10);
    expect(result.current.magneticProps.style.y.get()).toBe(10);
  });

  test('handleMouseMove does nothing if hover is not supported', () => {
    // Override matchMedia for this specific test
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: true, // true for '(hover: none)'
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }));

    const { result } = renderHook(() => useMagnetic());

    const mockElement = document.createElement('div');
    mockElement.getBoundingClientRect = () => ({
      width: 100, height: 100, top: 50, left: 50, bottom: 150, right: 150, x: 50, y: 50, toJSON: () => {}
    });

    (result.current.ref as any).current = mockElement;

    act(() => {
      result.current.magneticProps.onMouseMove({
        clientX: 120,
        clientY: 120
      } as any);
    });

    // Values should remain 0
    expect(result.current.magneticProps.style.x.get()).toBe(0);
    expect(result.current.magneticProps.style.y.get()).toBe(0);
  });

  test('handleMouseMove does nothing if ref is null', () => {
    const { result } = renderHook(() => useMagnetic());

    act(() => {
      result.current.magneticProps.onMouseMove({
        clientX: 120,
        clientY: 120
      } as any);
    });

    // Values should remain 0
    expect(result.current.magneticProps.style.x.get()).toBe(0);
    expect(result.current.magneticProps.style.y.get()).toBe(0);
  });
});
