import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
} from '@chakra-ui/react';
import { useField } from 'formik';

interface ImageProps {
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
}

export const ImageForm = ({ setFieldValue }: ImageProps): JSX.Element => {
  const [field, { error }] = useField('image');

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>Image</FormLabel>
      <Input
        id={field.name}
        type="file"
        accept="image/png, image/jpg, image/jpeg, image/gif"
        name="image"
        size="lg"
        padding="6px 5px"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setFieldValue('image', e.target?.files[0]);
          }
        }}
      />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
