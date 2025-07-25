import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui-components/react/checkbox-group';
import { cva, VariantProps } from 'class-variance-authority';

const checkboxGroupVariants = cva('flex flex-col items-start gap-1', {
  variants: {
    size: {
      // TODO
      default: '',
      sm: '',
      lg: '',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

type BaseCheckboxGroupProps = CheckboxGroupPrimitive.Props;

export type CheckboxGroupProps = BaseCheckboxGroupProps &
  VariantProps<typeof checkboxGroupVariants>;

export function CheckboxGroup({
  children,
  className,
  size,
  ...props
}: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      className={checkboxGroupVariants({
        size,
        className,
      })}
      {...props}
    >
      {children}
    </CheckboxGroupPrimitive>
  );
}
