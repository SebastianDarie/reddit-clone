import { Form, Formik } from 'formik';
import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/form-fields/InputField';
import { MeDocument, MeQuery, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withApollo } from '../utils/withApollo';
import { PasswordField } from '../components/form-fields/PasswordField';
import { RegisterSchema } from '../validation/yup';

const Register: React.FC<unknown> = ({}) => {
  const router = useRouter();
  const [register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '', username: '', password: '' }}
        validationSchema={RegisterSchema}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({
            variables: { credentials: values },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.register.user,
                },
              });
            },
          });
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="Bob the Builder"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="email"
                placeholder="example@gmail.com"
                label="Email"
                type="email"
              />
            </Box>
            <Box mt={4}>
              <PasswordField name="password" placeholder="password" register />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Register);
