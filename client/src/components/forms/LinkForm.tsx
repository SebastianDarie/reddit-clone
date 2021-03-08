import { Box, Button, Stack } from '@chakra-ui/react';
import { Form } from 'formik';
import { FormProps } from '../../shared/form.interface';
import { InputField } from '../form-fields/InputField';

export const LinkForm = ({ isSubmitting }: FormProps): JSX.Element => {
  return (
    <Form>
      <Stack spacing="6">
        <InputField name="title" placeholder="Bob the Builder" label="Title" />
        <Box mt={4}>
          <InputField name="link" placeholder="Url" label="Link" />
        </Box>
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
