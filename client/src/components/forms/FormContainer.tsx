import { Box, useColorModeValue as mode } from '@chakra-ui/react';
import { FormProps } from '../../shared/interfaces';

export const FormContainer: React.FC<FormProps> = ({ children }) => {
  return (
    <Box maxW={{ sm: 'md' }} mx={{ sm: 'auto' }} mt="8" w={{ sm: 'full' }}>
      <Box
        bg={mode('white', 'gray.700')}
        py="8"
        px={{ base: '4', md: '10' }}
        shadow="base"
        rounded={{ sm: 'lg' }}
      >
        {children}
      </Box>
    </Box>
  );
};
