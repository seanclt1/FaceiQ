import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollReveal } from '../useScrollReveal';

describe('useScrollReveal', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockUnobserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let observerCallback: IntersectionObserverCallback;

  beforeEach(() => {
    vi.clearAllMocks();

    mockObserve = vi.fn();
    mockUnobserve = vi.fn();
    mockDisconnect = vi.fn();

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn(function (callback) {
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
        takeRecords: () => [],
        root: null,
        rootMargin: '',
        thresholds: [],
      };
    }) as any;
  });

  it('should return ref and isVisible state', () => {
    const { result } = renderHook(() => useScrollReveal());

    expect(result.current).toHaveProperty('ref');
    expect(result.current).toHaveProperty('isVisible');
    expect(result.current.isVisible).toBe(false);
  });

  it('should start with isVisible as false', () => {
    const { result } = renderHook(() => useScrollReveal());
    expect(result.current.isVisible).toBe(false);
  });

  it('should create IntersectionObserver with default threshold', () => {
    renderHook(() => useScrollReveal());

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.1,
      })
    );
  });

  it('should accept custom options', () => {
    const customOptions = {
      threshold: 0.5,
      rootMargin: '10px',
    };

    renderHook(() => useScrollReveal(customOptions));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.5,
        rootMargin: '10px',
      })
    );
  });

  it('should observe element when ref is attached', () => {
    const { result } = renderHook(() => useScrollReveal());

    // Simulate ref attachment
    const mockElement = document.createElement('div');
    act(() => {
      (result.current.ref as any).current = mockElement;
    });

    // Re-render to trigger useEffect
    const { result: result2 } = renderHook(() => useScrollReveal());

    // The observer should be created
    expect(global.IntersectionObserver).toHaveBeenCalled();
  });

  it('should set isVisible to true when element intersects', () => {
    const { result } = renderHook(() => useScrollReveal());

    // Simulate ref attachment
    const mockElement = document.createElement('div');
    (result.current.ref as any).current = mockElement;

    // Simulate intersection
    act(() => {
      observerCallback(
        [
          {
            isIntersecting: true,
            target: mockElement,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('should not set isVisible to true when element does not intersect', () => {
    const { result } = renderHook(() => useScrollReveal());

    const mockElement = document.createElement('div');
    (result.current.ref as any).current = mockElement;

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: false,
            target: mockElement,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('should unobserve element after it becomes visible', () => {
    const { result } = renderHook(() => useScrollReveal());

    const mockElement = document.createElement('div');
    (result.current.ref as any).current = mockElement;

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: true,
            target: mockElement,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
  });

  it('should cleanup observer on unmount', () => {
    const { result, unmount } = renderHook(() => useScrollReveal());

    const mockElement = document.createElement('div');
    (result.current.ref as any).current = mockElement;

    unmount();

    expect(mockUnobserve).toHaveBeenCalled();
  });

  it('should only trigger visibility once (one-time animation)', () => {
    const { result } = renderHook(() => useScrollReveal());

    const mockElement = document.createElement('div');
    (result.current.ref as any).current = mockElement;

    // First intersection
    act(() => {
      observerCallback(
        [
          {
            isIntersecting: true,
            target: mockElement,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(result.current.isVisible).toBe(true);
    expect(mockUnobserve).toHaveBeenCalledTimes(1);

    // Try to trigger again (simulating scroll back up and down)
    act(() => {
      observerCallback(
        [
          {
            isIntersecting: false,
            target: mockElement,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    // Should still be visible
    expect(result.current.isVisible).toBe(true);
  });

  it('should handle multiple threshold values', () => {
    const customOptions = {
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };

    renderHook(() => useScrollReveal(customOptions));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: [0, 0.25, 0.5, 0.75, 1],
      })
    );
  });

  it('should handle custom root element', () => {
    const customRoot = document.createElement('div');
    const customOptions = {
      root: customRoot,
    };

    renderHook(() => useScrollReveal(customOptions));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        root: customRoot,
      })
    );
  });

  it('should handle rootMargin option', () => {
    const customOptions = {
      rootMargin: '50px 0px',
    };

    renderHook(() => useScrollReveal(customOptions));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '50px 0px',
      })
    );
  });

  it('should not observe if ref is null', () => {
    const { result } = renderHook(() => useScrollReveal());

    // Keep ref as null
    expect(result.current.ref.current).toBeNull();

    // Observer is created but observe should handle null gracefully
    expect(global.IntersectionObserver).toHaveBeenCalled();
  });

  it('should recreate observer when options change', () => {
    const { rerender } = renderHook(
      ({ options }) => useScrollReveal(options),
      { initialProps: { options: { threshold: 0.1 } } }
    );

    const firstCallCount = (global.IntersectionObserver as any).mock.calls.length;

    rerender({ options: { threshold: 0.5 } });

    const secondCallCount = (global.IntersectionObserver as any).mock.calls.length;

    expect(secondCallCount).toBeGreaterThan(firstCallCount);
  });

  it('should return a ref object that can be attached to a div', () => {
    const { result } = renderHook(() => useScrollReveal());

    expect(result.current.ref).toBeDefined();
    expect(result.current.ref).toHaveProperty('current');
  });

  it('should handle element intersection with very low threshold', () => {
    const { result } = renderHook(() => useScrollReveal({ threshold: 0.01 }));

    const mockElement = document.createElement('div');
    (result.current.ref as any).current = mockElement;

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: true,
            target: mockElement,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('should handle element intersection with high threshold', () => {
    const { result } = renderHook(() => useScrollReveal({ threshold: 0.9 }));

    const mockElement = document.createElement('div');
    (result.current.ref as any).current = mockElement;

    act(() => {
      observerCallback(
        [
          {
            isIntersecting: true,
            target: mockElement,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(result.current.isVisible).toBe(true);
  });
});
