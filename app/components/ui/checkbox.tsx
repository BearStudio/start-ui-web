import { Checkbox as CheckboxPrimitive } from '@base-ui-components/react/checkbox';
import { getUiState } from '@bearstudio/ui-state';
import { CheckIcon, MinusIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/tailwind/utils';

export type CheckboxProps = Omit<CheckboxPrimitive.Root.Props, 'type'> & {
  /**
   * By default, the checkbox is wrapped in a `<label>`. Set to `false` if you do not want it.
   */
  noLabel?: boolean;
  labelProps?: React.ComponentProps<'label'>;
};

export function Checkbox({
  children,
  className,
  noLabel,
  labelProps,
  parent,
  ...props
}: CheckboxProps) {
  const Comp = noLabel ? React.Fragment : 'label';

  const compProps = noLabel
    ? {}
    : {
        ...labelProps,
        className: cn(
          'flex items-center gap-2 text-base text-primary',
          labelProps?.className
        ),
      };

  const ui = getUiState((set) => {
    if (parent) return set('parent');

    return set('default');
  });
  return (
    <Comp {...compProps}>
      {ui
        .match('parent', () => {
          return (
            <CheckboxPrimitive.Root
              className={cn(
                'flex size-5 cursor-pointer items-center justify-center rounded-sm outline-none',
                'focus-visible:ring-[3px] focus-visible:ring-ring/50',
                'data-checked:bg-primary data-unchecked:border data-unchecked:border-primary/50',
                'disabled:cursor-not-allowed disabled:bg-muted-foreground disabled:opacity-20',
                className
              )}
              render={(props, state) => {
                return (
                  <button type="button" {...props}>
                    <CheckboxPrimitive.Indicator
                      keepMounted={true}
                      className={cn(
                        'relative flex transition-transform duration-150 ease-in-out'
                      )}
                    >
                      <MinusIcon
                        className={cn(
                          'invisible size-3.5 scale-x-75 stroke-current stroke-3 text-primary transition-transform duration-150 ease-in-out',
                          {
                            'visible scale-x-100': state.indeterminate,
                          }
                        )}
                      />
                      <CheckIcon
                        className={cn(
                          'invisible absolute size-3.5 scale-50 rotate-45 stroke-current stroke-3 text-secondary transition-transform duration-150 ease-in-out',
                          {
                            'visible scale-100 rotate-0': state.checked,
                          }
                        )}
                      />
                    </CheckboxPrimitive.Indicator>
                  </button>
                );
              }}
              parent
              {...props}
            />
          );
        })
        .match('default', () => {
          return (
            <CheckboxPrimitive.Root
              className={cn(
                'flex size-5 cursor-pointer items-center justify-center rounded-sm outline-none',
                'focus-visible:ring-[3px] focus-visible:ring-ring/50',
                'aria-invalid:focus-visible:ring-destructive/50 aria-invalid:data-unchecked:border-destructive',
                'data-checked:bg-primary data-unchecked:border data-unchecked:border-primary/50',
                'disabled:cursor-not-allowed disabled:bg-muted-foreground disabled:opacity-20',
                className
              )}
              {...props}
            >
              <CheckboxPrimitive.Indicator
                keepMounted={true}
                className={cn(
                  'flex transition-transform duration-150 ease-in-out',
                  'data-checked:scale-100 data-checked:rotate-0 data-unchecked:invisible data-unchecked:scale-50 data-unchecked:rotate-45'
                )}
              >
                <CheckIcon className="size-3.5 stroke-3 text-primary-foreground" />
              </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
          );
        })
        .nonExhaustive()}
      {children}
    </Comp>
  );
}
