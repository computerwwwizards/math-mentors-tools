import React, { useCallback } from 'react';

export interface KeysGroupBaseProps {
  layout?: string;
  preventFocusSteal?: boolean;
  onKey?: (value: string) => void;
  [key: `onKey${string}`]: any;
}

export type KeysGroupProps<T extends React.ElementType = 'div'> =
  KeysGroupBaseProps &
    Omit<React.ComponentPropsWithoutRef<T>, keyof KeysGroupBaseProps | 'as'> & {
      as?: T;
    };

export function KeysGroup<T extends React.ElementType = 'div'>({
  as,
  layout = '',
  preventFocusSteal = true,
  onKey,
  style,
  children,
  onPointerDown,
  onPointerUp,
  onMouseDown,
  onTouchStart,
  ...restProps
}: KeysGroupProps<T>) {
  const Component = as || 'div';

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (preventFocusSteal) {
        e.preventDefault();
      }
      if (onPointerDown) {
        onPointerDown(e as any);
      }
    },
    [preventFocusSteal, onPointerDown]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (preventFocusSteal) {
        e.preventDefault();
      }
      if (onMouseDown) {
        onMouseDown(e as any);
      }
    },
    [preventFocusSteal, onMouseDown]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (preventFocusSteal) {
        e.preventDefault();
      }
      if (onTouchStart) {
        onTouchStart(e as any);
      }
    },
    [preventFocusSteal, onTouchStart]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (onPointerUp) {
        onPointerUp(e as any);
      }

      const target = e.target as HTMLElement;
      if (!target) return;

      const value = target.dataset?.value ?? target.dataset?.area;
      if (value === undefined) return;

      const area = target.dataset.area;

      if (onKey) {
        onKey(value);
      }

      if (area) {
        const capitalizedArea = area.charAt(0).toUpperCase() + area.slice(1);
        const specificHandlerName = `onKey${capitalizedArea}`;
        const specificHandler = (restProps as Record<string, any>)[
          specificHandlerName
        ];
        if (typeof specificHandler === 'function') {
          specificHandler(value);
        }
      }
    },
    [onKey, onPointerUp, restProps]
  );

  const combinedStyle: React.CSSProperties = {
    display: 'grid',
    ...(layout ? { gridTemplateAreas: layout } : {}),
    ...style,
  };

  const domProps: Record<string, any> = {};
  for (const [key, val] of Object.entries(restProps)) {
    if (key.startsWith('onKey') && key !== 'onKey') {
      continue;
    }
    domProps[key] = val;
  }

  return (
    <Component
      role="toolbar"
      style={combinedStyle}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      {...(domProps as any)}
    >
      {children}
    </Component>
  );
}
