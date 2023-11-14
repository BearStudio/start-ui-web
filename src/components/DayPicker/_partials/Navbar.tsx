import { ButtonGroup, IconButton } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

type CustomNavbarProps = {
  onPreviousClick(): void;
  onNextClick(): void;
};

export const Navbar: React.FC<React.PropsWithChildren<CustomNavbarProps>> = ({
  onPreviousClick,
  onNextClick,
}) => {
  return (
    <ButtonGroup size="sm" variant="@secondary">
      <IconButton
        aria-label="Mois précédent"
        icon={<FiChevronLeft fontSize="sm" />}
        float="right"
        onClick={() => onPreviousClick()}
      />
      <IconButton
        aria-label="Mois suivant"
        icon={<FiChevronRight fontSize="sm" />}
        float="right"
        onClick={() => onNextClick()}
      />
    </ButtonGroup>
  );
};
