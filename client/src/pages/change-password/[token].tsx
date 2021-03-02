import { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  Link,
} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import NextLink from 'next/link';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import {
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            variables: {
              newPassword: values.newPassword,
              token:
                typeof router.query.token === 'string'
                  ? router.query.token
                  : '',
            },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.changePassword.user,
                },
              });
            },
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ('token' in errorMap) {
              setTokenError(errorMap.token);
            }

            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="new password"
              label="New Password"
              type="password"
            />
            {tokenError ? (
              <Box>
                <Alert
                  status="error"
                  mt={2}
                  flexDirection="column"
                  alignItems="center"
                >
                  <AlertIcon />
                  <AlertTitle mr={2}>{tokenError}</AlertTitle>
                  <AlertDescription>
                    Click the link below to get a new token
                  </AlertDescription>
                  <CloseButton
                    position="absolute"
                    right="8px"
                    top="8px"
                    onClick={() => setTokenError('')}
                  />
                </Alert>
                <NextLink href="/forgot-password">
                  <Link>Forgot Password</Link>
                </NextLink>
              </Box>
            ) : null}
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ChangePassword);
