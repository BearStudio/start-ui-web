import { ElementRef, ReactNode, useRef } from 'react';

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ButtonProps } from 'react-day-picker';
import FocusLock from 'react-focus-lock';
import { SubmitHandler, UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Form } from '@/components/Form';

export type FormPopoverProps<TSchema extends z.Schema> = {
  /**
   * The onSubmit function from the Form.
   * @param values The value that match the schema you provided.
   */
  onSubmit: (values: z.infer<TSchema>) => void;
  /**
   * Provide the value so the filter will have a default value and will remove
   * on reset.
   */
  value?: z.infer<TSchema>;

  children: (form: UseFormReturn<z.infer<TSchema>>) => ReactNode;
  /**
   * The schema for the form that is inside the FormPopover
   */
  schema: TSchema;
  /**
   * While enjoying the `reset` mode in the `with` prop, you can customize the
   * submit button label.
   */
  submitLabel?: ButtonProps['children'];
  /**
   * Render the PopoverTrigger child (the ref must be forwarded).
   */
  renderTrigger: (params: { onClick: () => void }) => ReactNode;
  /**
   * Using FormPopover, providing `with` prop will add button to clear or cancel
   * the form. Clear is useful for filters, Cancel for common forms.
   */
  with?: Array<'reset' | 'cancel'>;
  /**
   * Use this callback if you want to handle a behavior on reset, which is available
   * when the `with` prop with the `reset` value is given
   */
  onReset?: () => void;
};

export const FormPopover = <TSchema extends z.Schema>(
  props: FormPopoverProps<TSchema>
) => {
  const popover = useDisclosure();
  const { t } = useTranslation(['common', 'components']);

  const form = useForm({
    resolver: zodResolver(props.schema),
    values: props.value,
  });

  const handleOnClose = () => {
    popover.onClose();
    form.reset();
  };

  const handleOnSubmit: SubmitHandler<TSchema> = (values) => {
    props.onSubmit(values);
    popover.onClose();
  };

  const handleOnReset = () => {
    props.onReset?.();
    handleOnClose();
  };

  const popoverBodyRef = useRef<ElementRef<'div'>>(null);

  return (
    <Popover
      placement="bottom-start"
      isLazy
      isOpen={popover.isOpen}
      onClose={handleOnClose}
    >
      <PopoverTrigger>
        {props.renderTrigger({ onClick: popover.onOpen })}
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <FocusLock returnFocus persistentFocus={false}>
            <PopoverBody ref={popoverBodyRef}>
              {/* using portal for date picker to be in popover for example */}
              <Portal containerRef={popoverBodyRef}>
                <Form {...form} onSubmit={handleOnSubmit}>
                  <Stack>
                    {props.children(form)}

                    <ButtonGroup size="sm" justifyContent="end">
                      {props.with?.includes('reset') && (
                        <Button
                          variant="link"
                          type="reset"
                          onClick={handleOnReset}
                          me="auto"
                        >
                          {t('common:clear')}
                        </Button>
                      )}
                      {props.with?.includes('cancel') && (
                        <Button onClick={handleOnClose}>
                          {t('common:actions.cancel')}
                        </Button>
                      )}

                      <Button type="submit" variant="@primary">
                        {props.submitLabel ?? t('common:filter')}
                      </Button>
                    </ButtonGroup>
                  </Stack>
                </Form>
              </Portal>
            </PopoverBody>
          </FocusLock>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
