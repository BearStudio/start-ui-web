import React, { FC, Fragment, useState } from 'react';

import {
  ButtonGroup,
  Flex,
  FlexProps,
  IconButton,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { HiCheck, HiPencilAlt, HiX } from 'react-icons/hi';
import TextareaAutosize from 'react-textarea-autosize';

export interface EditableProps extends FlexProps {
  value?: string;
  onSubmit?: any;
  onChange?: any;
  onCancel?: any;
  isSubmitDisabled?: boolean;
}

export const Editable: FC<EditableProps> = ({
  value = '',
  onSubmit = () => {},
  onChange = () => {},
  onCancel = () => {},
  isSubmitDisabled = false,
  ...rest
}) => {
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(value);

  const handleEdit = () => {
    if (isEditing) {
      setIsEditing(false);
      onSubmit(content.trim());
      return;
    }

    setIsEditing(true);
    setContent(value);
  };

  const handleCancel = () => {
    setContent(value);
    setIsEditing((x) => !x);
    onCancel(value);
  };

  const handleChange = (e) => {
    setContent(e.target?.value);

    onChange(e);
  };

  return (
    <Flex {...rest}>
      {isEditing ? (
        <Textarea
          as={TextareaAutosize}
          value={content}
          transition="none"
          ml="-0.5rem"
          mr={3}
          px={2}
          py={1}
          minH={4}
          autoFocus
          maxRows={10}
          onChange={handleChange}
        />
      ) : (
        <Text
          flexGrow={1}
          color="gray.500"
          lineHeight="1.375" // set this lineHeight to be the same as textarea default lineHeight
          py={1}
          mr={2}
        >
          {(value || '').split('\n').map((item, key) => (
            <Fragment key={key}>
              {item}
              <br />
            </Fragment>
          ))}
        </Text>
      )}
      <ButtonGroup size="sm">
        {isEditing && (
          <IconButton
            aria-label={t('components.editable.cancel')}
            onClick={handleCancel}
            icon={<HiX />}
          />
        )}
        <IconButton
          aria-label={
            isEditing
              ? t('components.editable.submit')
              : t('components.editable.edit')
          }
          isDisabled={isSubmitDisabled}
          onClick={handleEdit}
          icon={isEditing ? <HiCheck /> : <HiPencilAlt />}
        />
      </ButtonGroup>
    </Flex>
  );
};
