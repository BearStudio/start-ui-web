import React, { FC, Fragment, useState } from 'react';

import {
  ButtonGroup,
  Flex,
  FlexProps,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { HiCheck, HiPencilAlt, HiX } from 'react-icons/hi';

import { TextareaAutosize } from '../TextareaAutosize';

export interface EditableProps extends FlexProps {
  value?: string;
  onSubmit?: (string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel?: (string) => void;
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
        <TextareaAutosize value={content} onChange={handleChange} />
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
            aria-label="cancel"
            onClick={handleCancel}
            icon={<HiX />}
          />
        )}
        <IconButton
          aria-label={isEditing ? 'submit' : 'edit'}
          isDisabled={isSubmitDisabled}
          onClick={handleEdit}
          icon={isEditing ? <HiCheck /> : <HiPencilAlt />}
        />
      </ButtonGroup>
    </Flex>
  );
};
