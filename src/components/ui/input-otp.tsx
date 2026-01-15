import { cva, VariantProps } from 'class-variance-authority';
import { OTPInput, OTPInputContext as OTPInputContextFromLib } from 'input-otp';
import { MinusIcon } from 'lucide-react';
import { ReactNode } from 'react';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

const InputOTPContext = React.createContext<
  (VariantProps<typeof inputOTPVariants> & { invalid: boolean }) | null
>(null);

const inputOTPVariants = cva(
  cn(
    'relative flex items-center justify-center border-y border-e border-input text-base shadow-xs transition-all outline-none first:rounded-s-md first:border-s last:rounded-e-md aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 md:text-sm dark:data-[active=true]:aria-invalid:ring-destructive/40'
  ),
  {
    variants: {
      size: {
        default: 'h-9 w-10',
        sm: 'size-8',
        lg: 'h-10 w-11 md:text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const useInputOTPContext = () => {
  const ctx = React.use(InputOTPContext);
  if (!ctx) {
    throw new Error('Missing <InputOTP /> parent component');
  }
  return ctx;
};

function InputOTP({
  className,
  containerClassName,
  size,
  ...props
}: Omit<React.ComponentProps<typeof OTPInput>, 'size' | 'render'> &
  VariantProps<typeof inputOTPVariants> & { children: ReactNode }) {
  const invalid = !!props['aria-invalid'];
  const value = React.useMemo(
    () => ({
      size,
      invalid,
    }),
    [size, invalid]
  );

  return (
    <InputOTPContext value={value}>
      <OTPInput
        data-slot="input-otp"
        containerClassName={cn(
          'flex w-fit items-center gap-2 has-disabled:opacity-50',
          containerClassName
        )}
        className={cn(
          'text-base!', // Prevent zoom on iOS (no impact on visual render)
          'disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    </InputOTPContext>
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center', className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number;
}) {
  const ctx = useInputOTPContext();
  const { char, hasFakeCaret, isActive } =
    React.use(OTPInputContextFromLib)?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(inputOTPVariants({ size: ctx.size }), className)}
      aria-invalid={ctx.invalid ? true : undefined}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
