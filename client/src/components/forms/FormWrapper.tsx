import { Box, Button, Stack } from '@chakra-ui/react';
import { Form } from 'formik';
import { FormProps } from '../../shared/interfaces';
import { InputField } from '../form-fields/InputField';

export const FormWrapper: React.FC<FormProps> = ({
  children,
  isSubmitting,
}) => {
  return (
    <Form encType="multipart/form-data">
      <Stack spacing="6">
        <InputField name="title" placeholder="Bob the Builder" label="Title" />
        <Box mt={4}>{children}</Box>
        <Button
          mt={4}
          type="submit"
          isLoading={isSubmitting}
          colorScheme="teal"
        >
          Create Post
        </Button>
      </Stack>
    </Form>
  );
};
