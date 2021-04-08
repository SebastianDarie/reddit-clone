import { Box, useColorModeValue as mode } from '@chakra-ui/react';

export type WrapperVariant = 'small' | 'medium' | 'regular';

interface WrapperProps {
  variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  variant = 'regular',
}) => {
  return (
    <Box
      bg={mode('inherit', 'inherit')}
      mt={8}
      mx="auto"
      maxW={
        variant === 'regular'
          ? '800px'
          : variant === 'medium'
          ? '600px'
          : '400px'
      }
      w="100%"
    >
      {children}
    </Box>
  );
};
