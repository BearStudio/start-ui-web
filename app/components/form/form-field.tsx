import { ReactNode, useEffect, useId } from 'react';

import { useFieldContext } from '@/lib/form/context';
import { cn } from '@/lib/tailwind/utils';

type FormFieldSize = 'sm' | 'default' | 'lg';

export type FieldContextMeta = ReturnType<
  ReturnType<typeof useFieldContext>['getMeta']
> & {
  id: string;
  descriptionId: string;
  errorId: string;
  size?: FormFieldSize;
};

export const FormField = (props: {
  id?: string;
  size?: FormFieldSize;
  children?: ReactNode;
  className?: string;
}) => {
  const _id = useId();
  const id = props.id ?? _id;

  const field = useFieldContext();

  useEffect(() => {
    field.setMeta((meta) => ({
      ...meta,
      id,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      size: props.size,
    }));
  }, [field.setMeta, id, props.size]);

  return (
    <div className={cn('flex flex-col gap-1.5', props.className)}>
      {props.children}
    </div>
  );
};
