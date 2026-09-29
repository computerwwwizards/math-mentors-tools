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
  onClick,
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

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (onPointerUp) {
        onPointerUp(e as any);
      }

      const target = e.target as HTMLElement;
      const keyEl = target.closest('[data-value],[data-area]') as HTMLElement | null;
      if (!keyEl) return;

      const value = keyEl.dataset.value ?? keyEl.dataset.area ?? '';
      const area = keyEl.dataset.area;

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

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (onClick) {
        onClick(e as any);
      }
    },
    [onClick]
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
      onClick={handleClick}
      {...(domProps as any)}
    >
      {children}
    </Component>
  );
}
