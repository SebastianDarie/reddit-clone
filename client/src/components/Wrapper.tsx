import { Box, useColorModeValue as mode } from '@chakra-ui/react';

export type BackgroundVariant = 'transparent' | 'black' | 'white' | 'gray.50';
export type WrapperVariant = 'small' | 'regular';

interface WrapperProps {
  background?: BackgroundVariant;
  variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  //background,
  variant = 'regular',
}) => {
  return (
    <Box
      bg={mode('inherit', 'inherit')}
      mt={8}
      mx="auto"
      maxW={variant === 'regular' ? '800px' : '400px'}
      w="100%"
    >
      {children}
    </Box>
  );
};
