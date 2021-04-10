import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Heading,
  Link,
  Stack,
  Text,
  useColorModeValue as mode,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import NextLink from 'next/link';
import { InputField } from '../components/form-fields/InputField';
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withApollo } from '../utils/withApollo';
import { PasswordField } from '../components/form-fields/PasswordField';
import { FormContainer } from '../components/forms/FormContainer';

const LoginSchema = Yup.object().shape({
  usernameOrEmail: Yup.string()
    .min(3, 'Length does not match')
    .max(50, 'That is too much Jimbo')
    .required('Identify yourself'),
  password: Yup.string()
    .min(3, 'Passwords are minimum 3 characters')
    .max(50, 'That is the limit!')
    .required('Password is required'),
});

const Login: React.FC<unknown> = ({}) => {
  const router = useRouter();
  const [login] = useLoginMutation();
  const src = useColorModeValue(
    '/assets/reddit-logo.svg',
    '/assets/reddit-logo-black.svg'
  );

  return (
    <Box
      bg={mode('gray.50', 'inherit')}
      minH="100vh"
      py="12"
      px={{ sm: '6', lg: '8' }}
    >
      <Box maxW={{ sm: 'md' }} mx={{ sm: 'auto' }} w={{ sm: 'full' }}>
        <Box display="flex" justifyContent="center">
          <Image src={src} alt="reddit logo" height={128} width={128} />
        </Box>
        <Heading mt="6" textAlign="center" size="xl" fontWeight="extrabold">
          Sign in to your account
        </Heading>
        <Text mt="4" align="center" maxW="md" fontWeight="medium">
          <span>Don&apos;t have an account?</span>
          <NextLink href="/register">
            <Link
              marginStart="1"
              color={mode('blue.600', 'blue.200')}
              _hover={{ color: 'blue.600' }}
              display={{ base: 'block', sm: 'revert' }}
            >
              Register here
            </Link>
          </NextLink>
        </Text>
      </Box>

      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({
            variables: values,
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.login.user,
                },
                variables: { skipCommunities: true },
              });
              cache.evict({
                fieldName: 'posts:{"communityId":null,"communityIds":null}',
              });
              cache.gc();
            },
          });
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next === 'string') {
              router.push(router.query.next);
            } else {
              router.push('/');
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <FormContainer>
            <Form>
              <Stack spacing="6">
                <InputField
                  name="usernameOrEmail"
                  placeholder="Bob the Builder or example@gmail.com"
                  label="Username or Email"
                />
                <PasswordField
                  name="password"
                  placeholder="password"
                  register={false}
                />
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  fontSize="md"
                  isLoading={isSubmitting}
                >
                  Sign in
                </Button>
              </Stack>
            </Form>
          </FormContainer>
        )}
      </Formik>
    </Box>
  );
};

export default withApollo({ ssr: false })(Login);
