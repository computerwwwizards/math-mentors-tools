import React from 'react';

export interface KeyBaseProps {
  area?: string;
  value?: string;
  children?: React.ReactNode;
}

export type KeyProps<T extends React.ElementType = 'button'> = KeyBaseProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof KeyBaseProps | 'as'> & {
    as?: T;
  };

export function Key<T extends React.ElementType = 'button'>({
  as,
  area,
  value,
  children,
  style,
  ...restProps
}: KeyProps<T>) {
  const Component = as || 'button';

  const resolvedArea =
    area ||
    (typeof children === 'string' ? children.trim().toLowerCase() : undefined);
  const resolvedValue =
    value !== undefined
      ? value
      : area || (typeof children === 'string' ? children : '');

  const combinedStyle: React.CSSProperties = {
    ...(resolvedArea ? { gridArea: resolvedArea } : {}),
    ...style,
  };

  return (
    <Component
      {...(Component === 'button' ? { type: 'button' } : {})}
      data-area={resolvedArea}
      data-value={resolvedValue}
      style={combinedStyle}
      {...restProps}
    >
      {children}
    </Component>
  );
}
