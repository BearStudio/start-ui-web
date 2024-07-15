import { ElementRef, ReactNode, useRef } from 'react';

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverProps,
  PopoverTrigger,
  Portal,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
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
  /**
   * Mostly the `FormField` that matches the schema you provided. Remember to
   * give the `control` props to the `FormField`.
   */
  children: (form: UseFormReturn<z.infer<TSchema>>) => ReactNode;
  /**
   * The schema for the form that is inside the FormPopover
   */
  schema: TSchema;
  /**
   * Render the PopoverTrigger child (the ref must be forwarded).
   */
  renderTrigger: (params: { onClick: () => void }) => ReactNode;
  /**
   * Render the cancel button (or anything else)
   */
  renderFooterSecondaryAction?: (params: { onClose: () => void }) => ReactNode;
  /**
   * Render the submit button (or anything else)
   */
  renderFooterPrimaryAction?: () => ReactNode;
  /**
   * The Popover root element props
   */
  popoverProps?: PopoverProps;
};

export const FormPopover = <TSchema extends z.Schema>(
  props: FormPopoverProps<TSchema>
) => {
  const popover = useDisclosure();
  const { t } = useTranslation(['common']);

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
                      {props.renderFooterSecondaryAction?.({
                        onClose: handleOnClose,
                      })}
                      {props.renderFooterPrimaryAction?.()}
                      {!props.renderFooterPrimaryAction && (
                        <Button type="submit" variant="@primary">
                          {t('common:submit')}
                        </Button>
                      )}
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
