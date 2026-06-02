import {
  cloneElement,
  ComponentProps,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from 'react-use-disclosure';

import { Button } from '@/platform/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerClose,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
} from '@/platform/components/ui/responsive-drawer';

export const ConfirmResponsiveDrawer = (props: {
  enabled?: boolean;
  children: ReactElement<{ onClick: () => void }>;
  title?: ReactNode;
  description?: ReactNode;
  onConfirm: () => unknown | Promise<unknown>;
  confirmText?: ReactNode;
  confirmVariant?: ComponentProps<typeof Button>['variant'];
  cancelText?: ReactNode;
}) => {
  const { t } = useTranslation(['common', 'components']);
  const [isPending, setIsPending] = useState(false);
  const { close, open, isOpen } = useDisclosure();

  const displayHeading =
    !props.title && !props.description
      ? t('components:confirmResponsiveDrawer.heading')
      : props.title;

  if (props.enabled === false) {
    // eslint-disable-next-line @eslint-react/no-clone-element
    const childrenWithOnConfirm = cloneElement(props.children, {
      onClick: () => {
        void props.onConfirm();
      },
    });
    return <>{childrenWithOnConfirm}</>;
  }

  // eslint-disable-next-line @eslint-react/no-clone-element
  const childrenWithOnOpen = cloneElement(props.children, {
    onClick: () => {
      open();
    },
  });

  const handleCancel = () => {
    setIsPending(false);
    close();
  };

  const handleConfirm = async () => {
    setIsPending(true);
    await props.onConfirm();
    setIsPending(false);
    close();
  };

  return (
    <>
      {childrenWithOnOpen}
      <ResponsiveDrawer
        open={isOpen}
        onOpenChange={(isOpen: boolean) => {
          if (isOpen) {
            open();
            return;
          }
          handleCancel();
        }}
      >
        <ResponsiveDrawerContent
          hideCloseButton
          className="sm:max-w-xs"
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleConfirm();
            }
          }}
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>{displayHeading}</ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription>
              {props.description}
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerFooter>
            <ResponsiveDrawerClose
              render={<Button variant="secondary" className="max-sm:w-full" />}
            >
              {props.cancelText ??
                t('components:confirmResponsiveDrawer.cancelText')}
            </ResponsiveDrawerClose>
            <Button
              variant={props.confirmVariant ?? 'default'}
              className="max-sm:w-full"
              loading={isPending}
              onClick={handleConfirm}
            >
              {props.confirmText ??
                t('components:confirmResponsiveDrawer.confirmText')}
            </Button>
          </ResponsiveDrawerFooter>
        </ResponsiveDrawerContent>
      </ResponsiveDrawer>
    </>
  );
};
