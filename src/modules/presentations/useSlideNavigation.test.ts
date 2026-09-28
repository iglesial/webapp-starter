import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSlideNavigation } from './useSlideNavigation';

describe('useSlideNavigation', () => {
  it('starts at index 0 by default', () => {
    const { result } = renderHook(() => useSlideNavigation({ total: 3 }));
    expect(result.current.index).toBe(0);
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);
  });

  it('starts at the given initialIndex', () => {
    const { result } = renderHook(() => useSlideNavigation({ total: 3, initialIndex: 1 }));
    expect(result.current.index).toBe(1);
  });

  it('advances with next() and clamps at the last slide', () => {
    const { result } = renderHook(() => useSlideNavigation({ total: 3 }));
    act(() => result.current.next());
    expect(result.current.index).toBe(1);
    act(() => result.current.next());
    expect(result.current.index).toBe(2);
    expect(result.current.isLast).toBe(true);
    act(() => result.current.next());
    expect(result.current.index).toBe(2);
  });

  it('retreats with prev() and clamps at the first slide', () => {
    const { result } = renderHook(() => useSlideNavigation({ total: 3, initialIndex: 1 }));
    act(() => result.current.prev());
    expect(result.current.index).toBe(0);
    expect(result.current.isFirst).toBe(true);
    act(() => result.current.prev());
    expect(result.current.index).toBe(0);
  });

  it('jumps to an arbitrary index with goTo(), clamped to bounds', () => {
    const { result } = renderHook(() => useSlideNavigation({ total: 5 }));
    act(() => result.current.goTo(3));
    expect(result.current.index).toBe(3);
    act(() => result.current.goTo(99));
    expect(result.current.index).toBe(4);
    act(() => result.current.goTo(-5));
    expect(result.current.index).toBe(0);
  });

  it('navigates via ArrowRight/ArrowLeft keyboard events', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useSlideNavigation({ total: 3 }));
    await act(() => user.keyboard('{ArrowRight}'));
    expect(result.current.index).toBe(1);
    await act(() => user.keyboard('{ArrowLeft}'));
    expect(result.current.index).toBe(0);
  });

  it('jumps to bounds via Home/End keyboard events', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useSlideNavigation({ total: 4, initialIndex: 1 }));
    await act(() => user.keyboard('{End}'));
    expect(result.current.index).toBe(3);
    await act(() => user.keyboard('{Home}'));
    expect(result.current.index).toBe(0);
  });

  it('removes the keydown listener on unmount', async () => {
    const user = userEvent.setup();
    const { result, unmount } = renderHook(() => useSlideNavigation({ total: 3 }));
    unmount();
    await act(() => user.keyboard('{ArrowRight}'));
    expect(result.current.index).toBe(0);
  });
});
