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
import * as Yup from 'yup';
//import { useRouter } from 'next/router';
import { useState } from 'react';
import { Layout } from '../components/Layout';
//import { useCreatePostMutation } from '../generated/graphql';
import { useIsAuth } from '../utils/useIsAuth';
import { withApollo } from '../utils/withApollo';
import { DividerWithText } from '../components/DividerWithText';
import { TextForm } from '../components/forms/TextForm';
import { ImageForm } from '../components/forms/ImageForm';
import { LinkForm } from '../components/forms/LinkForm';

const Title = Yup.string()
  .min(3, 'Choose an interesting title!')
  .max(300, 'Too much already!')
  .required('Anything works!');

const TextSchema = Yup.object().shape({
  title: Yup.string().concat(Title),
  text: Yup.string()
    .min(3, "There's gotta be more to your content!")
    .max(10000, 'Create separate posts!')
    .required('Why did you click create post?'),
});

const LinkSchema = Yup.object().shape({
  title: Yup.string().concat(Title),
  link: Yup.string()
    .min(9, 'Make sure it is a valid url')
    .max(2000, 'Too much shorthen it')
    .required('Add a link to something'),
});

const ImageSchema = Yup.object().shape({
  title: Yup.string().concat(Title),
  image: Yup.mixed().required('Please upload an image'),
  // .test(
  //   'fileSize',
  //   'File too large',
  //   (value) => value && value.size <= 20000 * 1024
  // )
  // .test('fileFormat', 'Unsupported Format', (value) => {
  //   console.log(value);
  //   return (
  //     value &&
  //     ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'].includes(
  //       value.type
  //     )
  //   );
  // }),
});

const CreatePost: React.FC<unknown> = ({}) => {
  //const router = useRouter();
  useIsAuth();
  const [postType, setPostType] = useState('text');
  //const [createPost] = useCreatePostMutation();

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
          initialValues={{ title: '', text: '', link: '', image: null }}
          validationSchema={
            postType === 'link'
              ? LinkSchema
              : postType === 'image'
              ? ImageSchema
              : TextSchema
          }
          onSubmit={async (values) => {
            // const { errors } = await createPost({
            //   variables: { input: values },
            //   update: (cache) => {
            //     cache.evict({ fieldName: 'posts:{}' });
            //   },
            // });
            // if (!errors) {
            //   router.push('/');
            // }
            console.log(values);
          }}
        >
          {({ isSubmitting }) => (
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
                    onClick={() => setPostType('text')}
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
                    onClick={() => setPostType('image')}
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
                    onClick={() => setPostType('link')}
                  >
                    <VisuallyHidden>Link Post</VisuallyHidden>
                    <BiLink color={postType === 'link' ? 'orangered' : ''} />
                  </Button>
                </SimpleGrid>
                {postType === 'text' ? (
                  <TextForm isSubmitting={isSubmitting} />
                ) : postType === 'image' ? (
                  <ImageForm
                    isSubmitting={isSubmitting}
                    //setFieldValue={setFieldValue}
                  />
                ) : (
                  <LinkForm isSubmitting={isSubmitting} />
                )}
              </Box>
            </Box>
          )}
        </Formik>
      </Box>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
