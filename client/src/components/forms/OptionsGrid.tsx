import {
  Button,
  SimpleGrid,
  VisuallyHidden,
  useColorModeValue as mode,
} from '@chakra-ui/react';
import { FormikState } from 'formik';
import { Dispatch, SetStateAction } from 'react';
import { BiImage, BiLink, BiMessageDetail } from 'react-icons/bi';
import { FormValues } from '../../shared/interfaces';

interface OptionsGridProps {
  postType: string;
  setPostType: Dispatch<SetStateAction<string>>;
  resetForm: (nextState?: Partial<FormikState<FormValues>> | undefined) => void;
}

export const OptionsGrid: React.FC<OptionsGridProps> = ({
  postType,
  resetForm,
  setPostType,
}) => {
  return (
    <SimpleGrid mt="6" mb="6" columns={3} spacing="3">
      <Button
        borderBottom={
          postType === 'text' ? `2px solid ${mode('inherit', 'white')}` : ''
        }
        color="currentColor"
        variant="outline"
        onClick={() => {
          setPostType('text');
          resetForm();
        }}
      >
        <VisuallyHidden>Text Post</VisuallyHidden>
        <BiMessageDetail color={postType === 'text' ? 'orangered' : ''} />
      </Button>
      <Button
        borderBottom={
          postType === 'image' ? `2px solid ${mode('inherit', 'white')}` : ''
        }
        color="currentColor"
        variant="outline"
        onClick={() => {
          setPostType('image');
          resetForm();
        }}
      >
        <VisuallyHidden>Image Post</VisuallyHidden>
        <BiImage color={postType === 'image' ? 'orangered' : ''} />
      </Button>
      <Button
        borderBottom={
          postType === 'link' ? `2px solid ${mode('inherit', 'white')}` : ''
        }
        color="currentColor"
        variant="outline"
        onClick={() => {
          setPostType('link');
          resetForm();
        }}
      >
        <VisuallyHidden>Link Post</VisuallyHidden>
        <BiLink color={postType === 'link' ? 'orangered' : ''} />
      </Button>
    </SimpleGrid>
  );
};
