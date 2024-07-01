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
import { UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LuChevronDown } from 'react-icons/lu';
import { P, match } from 'ts-pattern';
import { z } from 'zod';

import { Form } from '@/components/Form';
import { Icon } from '@/components/Icons';
import { isFunction } from '@/lib/guards';

export type FilterPopoverProps<TSchema extends z.Schema> = {
  /**
   * Give a boolean or a function to change the variant when there is a value
   */
  isActive?: boolean | ((values: z.infer<TSchema>) => boolean);
  onSubmit: (values: z.infer<TSchema>) => void;
  /**
   * Provide the value so the filter will have a default value and will remove
   * on reset.
   */
  value?: z.infer<TSchema>;
  /**
   * Use this callback if you want to handle a behavior on reset.
   */
  onReset?: () => void;
  /**
   * Render a custom label using this function. If you want live update of the
   * label, use the `value` parameter.
   * @param value The form value
   */
  formatLabel?: (value: z.infer<TSchema>) => ReactNode;
  children: (form: UseFormReturn<z.infer<TSchema>>) => ReactNode;
  filterButtonProps?: Omit<ButtonProps, 'onClick' | 'children'>;
  schema: TSchema;
};

export const FilterPopover = <TSchema extends z.Schema>(
  props: FilterPopoverProps<TSchema>
) => {
  const popover = useDisclosure();
  const { t } = useTranslation(['components']);

  const defaultFormatLabel = () => JSON.stringify(form.getValues());

  const form = useForm({
    resolver: zodResolver(props.schema),
    values: props.value,
  });

  const handleOnSubmit = (values: z.infer<TSchema>) => {
    props.onSubmit(values);
    popover.onClose();
  };

  const handleOnReset = () => {
    form.reset();
    handleOnSubmit(null);
    props.onReset?.();
  };

  const popoverBodyRef = useRef<ElementRef<'div'>>(null);

  const isActive = match(props.isActive)
    .with(P.boolean, (isActive) => isActive)
    .with(P.when(isFunction), (isActive) => isActive(form.getValues()))
    .otherwise(() => false);

  return (
    <Popover
      placement="bottom-start"
      isLazy
      isOpen={popover.isOpen}
      onClose={popover.onClose}
    >
      <PopoverTrigger>
        <Button
          variant={isActive ? '@secondary' : 'outline'}
          rightIcon={<Icon icon={LuChevronDown} />}
          onClick={popover.onOpen}
          {...props.filterButtonProps}
        >
          {props.formatLabel
            ? props.formatLabel(form.getValues())
            : defaultFormatLabel()}
        </Button>
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

                    <ButtonGroup size="sm" justifyContent="space-between">
                      <Button
                        variant="link"
                        type="reset"
                        onClick={handleOnReset}
                      >
                        {t('components:filterPopover.clear')}
                      </Button>
                      <Button type="submit" variant="@primary">
                        {t('components:filterPopover.filter')}
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
