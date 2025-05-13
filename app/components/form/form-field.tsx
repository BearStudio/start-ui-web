import { ReactNode, useEffect, useId } from 'react';

import { useFieldContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

type FormFieldSize = 'sm' | 'default' | 'lg';

type FormFieldProps = {
  id?: string;
  size?: FormFieldSize;
  children?: ReactNode;
  className?: string;
};

export type FieldContextMeta = {
  id: string;
  descriptionId: string;
  errorId: string;
  size?: FormFieldSize;
};

export const FormField = (props: FormFieldProps) => {
  const _id = useId();
  const id = props.id ?? _id;

  const ctx = useFieldContext();

  useEffect(() => {
    ctx.setMeta((meta) => ({
      ...meta,
      id,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      size: props.size,
    }));
  }, [ctx, id, props.size]);

  return (
    <div className={cn('flex flex-col gap-1.5', props.className)}>
      {props.children}
    </div>
  );
};
