import { Box, Button, Input, Stack } from '@chakra-ui/react';
import { Form } from 'formik';
import { FormProps } from '../../shared/form.interface';
import { InputField } from '../form-fields/InputField';

type ImageProps = FormProps;

export const ImageForm = ({
  isSubmitting,
}: //setFieldValue,
ImageProps): JSX.Element => {
  return (
    <Form>
      <Stack spacing="6">
        <InputField name="title" placeholder="Bob the Builder" label="Title" />
        <Box mt={4}>
          {/* <Field
            name="image"
            component={ */}
          <Input
            type="file"
            accept="image/png, image/jpg, image/jpeg, image/gif"
            name="image"
            label="Image"
            //size={12}
            image
            // onChange={(e) => {
            //   setFieldValue('image', e.currentTarget.files[0]);
            // }}
          />
          {/* }
          /> */}
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
