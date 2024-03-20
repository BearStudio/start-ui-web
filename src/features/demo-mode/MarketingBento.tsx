import { Grid, GridItem, Text } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';

export const MarketingBento = () => {
  return (
    <Grid
      gap="2"
      templateColumns={{ base: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }}
    >
      <GridItem
        borderRadius="md"
        bg="blackAlpha.200"
        rowSpan={2}
        aspectRatio={0.7}
        overflow="hidden"
      >
        <Link
          href="https://bear.studio/assets-start-ui-bento-01"
          target="_blank"
        >
          <Image
            src="https://raw.githubusercontent.com/BearStudio/assets/main/start-ui/marketing-bento-01.jpg"
            alt="Marketing content. Follow link for more info"
            width={420}
            height={600}
            sizes="420px"
            style={{ objectFit: 'cover' }}
          />
        </Link>
      </GridItem>
      <GridItem
        borderRadius="md"
        bg="blackAlpha.200"
        aspectRatio={1.45}
        overflow="hidden"
      >
        <Link
          href="https://bear.studio/assets-start-ui-bento-02"
          target="_blank"
        >
          <Image
            src="https://raw.githubusercontent.com/BearStudio/assets/main/start-ui/marketing-bento-02.jpg"
            alt="Marketing content. Follow link for more info"
            width={420}
            height={290}
            sizes="420px"
            style={{ objectFit: 'cover' }}
          />
        </Link>
      </GridItem>
      <GridItem
        borderRadius="md"
        bg="blackAlpha.200"
        rowSpan={2}
        aspectRatio={0.7}
        overflow="hidden"
      >
        <Link
          href="https://bear.studio/assets-start-ui-bento-03"
          target="_blank"
        >
          <Image
            src="https://raw.githubusercontent.com/BearStudio/assets/main/start-ui/marketing-bento-03.jpg"
            alt="Marketing content. Follow link for more info"
            width={420}
            height={600}
            sizes="420px"
            style={{ objectFit: 'cover' }}
          />
        </Link>
      </GridItem>
      <GridItem
        borderRadius="md"
        bg="blackAlpha.200"
        aspectRatio={1.45}
        overflow="hidden"
      >
        <Link
          href="https://bear.studio/assets-start-ui-bento-04"
          target="_blank"
        >
          <Image
            src="https://raw.githubusercontent.com/BearStudio/assets/main/start-ui/marketing-bento-04.jpg"
            alt="Marketing content. Follow link for more info"
            width={420}
            height={290}
            sizes="420px"
            style={{ objectFit: 'cover' }}
          />
        </Link>
      </GridItem>
      <Text
        fontSize="xs"
        gridColumn="1/-1"
        textAlign="center"
        style={{ textWrap: 'balance' }}
      >
        Shameless plug 😅 Remember that 🚀 Start UI is free and Open Source 😉
      </Text>
    </Grid>
  );
};
