import { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const ForgotPassword: React.FC<unknown> = ({}) => {
  const [forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword({ variables: values });
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box
              color="#24a0ed"
              fontSize={12}
              fontWeight={500}
              lineHeight="20px"
            >
              Thanks! If your Reddit username and email address match, you will
              get an email with a link to reset your password shortly.
            </Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="example@gmail.com"
                label="Email"
                type="email"
              />

              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                colorScheme="teal"
              >
                Reset Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
