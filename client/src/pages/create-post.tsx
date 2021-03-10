import {
  Box,
  Button,
  Divider,
  SimpleGrid,
  Text,
  VisuallyHidden,
  useColorModeValue as mode,
} from '@chakra-ui/react';
import { BiImage, BiLink, BiMessageDetail } from 'react-icons/bi';
import { Formik } from 'formik';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { useIsAuth } from '../utils/useIsAuth';
import { withApollo } from '../utils/withApollo';
import { DividerWithText } from '../components/DividerWithText';
import { InputField } from '../components/form-fields/InputField';
import { ImageForm } from '../components/forms/ImageForm';
import { FormWrapper } from '../components/forms/FormWrapper';
import { ImageSchema, LinkSchema, TextSchema } from '../validation/yup';

const CreatePost: React.FC<unknown> = ({}) => {
  const router = useRouter();
  useIsAuth();
  const [postType, setPostType] = useState('text');
  const [createPost] = useCreatePostMutation();

  return (
    <Layout variant="regular">
      <Box bg={mode('white', 'inherit')} py="12" px={{ sm: '6', lg: '8' }}>
        <Box maxW={{ sm: 'md' }} mx={{ sm: 'auto' }} w={{ sm: 'full' }}>
          <Text fontSize={18} fontWeight={500} lineHeight="22px" mb={2}>
            Create a post
          </Text>
          <Divider />
        </Box>
        <Formik
          initialValues={{ title: '', text: '', link: '', image: '' }}
          validationSchema={
            postType === 'link'
              ? LinkSchema
              : postType === 'image'
              ? ImageSchema
              : TextSchema
          }
          onSubmit={async (values) => {
            const { errors } = await createPost({
              variables: { input: values },
              update: (cache) => {
                cache.evict({ fieldName: 'posts:{}' });
              },
            });
            if (!errors) {
              router.push('/');
            }
          }}
        >
          {({ isSubmitting, setFieldValue, resetForm }) => (
            <Box
              maxW={{ sm: 'md' }}
              mx={{ sm: 'auto' }}
              mt="8"
              w={{ sm: 'full' }}
            >
              <Box
                bg={mode('white', 'gray.700')}
                py="8"
                px={{ base: '4', md: '10' }}
                shadow="base"
                rounded={{ sm: 'lg' }}
              >
                <DividerWithText>Options</DividerWithText>
                <SimpleGrid mt="6" mb="6" columns={3} spacing="3">
                  <Button
                    borderBottom={
                      postType === 'text'
                        ? `2px solid ${mode('inherit', 'white')}`
                        : ''
                    }
                    color="currentColor"
                    variant="outline"
                    onClick={() => {
                      setPostType('text');
                      resetForm();
                    }}
                  >
                    <VisuallyHidden>Text Post</VisuallyHidden>
                    <BiMessageDetail
                      color={postType === 'text' ? 'orangered' : ''}
                    />
                  </Button>
                  <Button
                    borderBottom={
                      postType === 'image'
                        ? `2px solid ${mode('inherit', 'white')}`
                        : ''
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
                      postType === 'link'
                        ? `2px solid ${mode('inherit', 'white')}`
                        : ''
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

                <FormWrapper isSubmitting={isSubmitting}>
                  {postType === 'text' ? (
                    <InputField
                      textarea
                      name="text"
                      placeholder="text"
                      label="Body"
                    />
                  ) : postType === 'link' ? (
                    <InputField name="link" placeholder="Url" label="Link" />
                  ) : (
                    <ImageForm setFieldValue={setFieldValue} />
                  )}
                </FormWrapper>
              </Box>
            </Box>
          )}
        </Formik>
      </Box>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
