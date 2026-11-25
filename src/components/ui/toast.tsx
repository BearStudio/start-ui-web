import {
  Toast,
  toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  type ToastType,
} from '@ui-sdk/react/toast';
import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { Button } from '@/components/ui/button';

const ToastIcon = (props: { type: ToastType }) =>
  match(props.type)
    .with('success', () => <CircleCheckIcon aria-hidden="true" />)
    .with('error', () => <CircleXIcon aria-hidden="true" />)
    .with('warning', () => <TriangleAlertIcon aria-hidden="true" />)
    .with('info', () => <InfoIcon aria-hidden="true" />)
    .with('loading', () => (
      <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
    ))
    .with('default', () => null)
    .exhaustive();

function Toaster() {
  const { t } = useTranslation(['components']);
  return (
    <ToastRegion
      side="top"
      align="center"
      shortcut="alt+t"
      aria-label={t('components:toast.region')}
      className="mt-2 h-(--toast-front-height) w-[min(356px,calc(100vw-16px))] data-expanded:h-[calc(var(--toast-stack-height)+(var(--toast-count)-1)*12px)] sm:mt-4 sm:w-[min(356px,calc(100vw-32px))]"
    >
      {(item) => (
        <Toast className="absolute inset-x-0 top-0 z-[calc(100-var(--toast-index))] flex h-(--toast-height) origin-bottom [translate:var(--toast-swipe-x,0px)_calc(var(--y)+var(--toast-swipe-y,0px))] [scale:calc(1-var(--toast-index)*0.05)] items-center gap-3 overflow-hidden rounded-lg border bg-background p-4 text-sm text-foreground shadow-lg transition-[translate,scale,opacity,height] duration-400 select-none [--y:calc(var(--toast-index)*12px)] not-data-expanded:not-data-front:h-(--toast-front-height) data-ending-style:opacity-0 data-expanded:[scale:1] data-expanded:[--y:calc(var(--toast-offset)+var(--toast-index)*12px)] data-starting-style:transition-none data-starting-style:not-data-front:opacity-0 data-starting-style:data-front:[--y:-100%] data-swiping:transition-none motion-reduce:transition-opacity [&>svg]:size-4 [&>svg]:shrink-0">
          <ToastIcon type={item.type} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <ToastTitle className="font-medium" />
            <ToastDescription className="text-muted-foreground" />
          </div>
          {!!item.cancel && (
            <ToastClose
              action={item.cancel.onCancel}
              render={<Button variant="secondary" size="xs" />}
            >
              {item.cancel.label}
            </ToastClose>
          )}
          {!!item.action && <ToastAction render={<Button size="xs" />} />}
        </Toast>
      )}
    </ToastRegion>
  );
}

export { toast, Toaster };
