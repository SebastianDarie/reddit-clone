import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  useDisclosure,
  useMergeRefs,
  useColorModeValue as mode,
  FormErrorMessage,
  Link,
  InputProps,
} from '@chakra-ui/react';
import { useField } from 'formik';
import NextLink from 'next/link';
import * as React from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

export const PasswordField = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const { isOpen, onToggle } = useDisclosure();
    const inputRef = React.useRef<HTMLInputElement>(null);

    const mergeRef = useMergeRefs(inputRef, ref);

    const onClickReveal = () => {
      onToggle();
      const input = inputRef.current;
      if (input) {
        input.focus({ preventScroll: true });
        const length = input.value.length * 2;
        requestAnimationFrame(() => {
          input.setSelectionRange(length, length);
        });
      }
    };

    const [field, { error }] = useField(props as string);

    return (
      <FormControl id="password" isInvalid={!!error}>
        <Flex justify="space-between">
          <FormLabel>Password</FormLabel>
          <Box
            color={mode('blue.600', 'blue.200')}
            fontWeight="semibold"
            fontSize="sm"
          >
            <NextLink href="/forgot-password">
              <Link ml="auto">Forgot Password?</Link>
            </NextLink>
          </Box>
        </Flex>
        <InputGroup>
          <InputRightElement>
            <IconButton
              bg="transparent !important"
              variant="ghost"
              aria-label={isOpen ? 'Mask password' : 'Reveal password'}
              icon={isOpen ? <HiEyeOff /> : <HiEye />}
              onClick={onClickReveal}
            />
          </InputRightElement>
          <Input
            id={field.name}
            ref={mergeRef}
            type={isOpen ? 'text' : 'password'}
            autoComplete="current-password"
            {...field}
            {...props}
          />
        </InputGroup>
        {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
      </FormControl>
    );
  }
);

PasswordField.displayName = 'PasswordField';
