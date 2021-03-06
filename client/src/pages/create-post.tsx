import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { InputField } from '../components/form-fields/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { useIsAuth } from '../utils/useIsAuth';
import { withApollo } from '../utils/withApollo';

const PostSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Choose an interesting title!')
    .max(50, 'Too much already!')
    .required('Anything works!'),
  text: Yup.string()
    .min(3, "There's gotta be more to your content!")
    .max(40000, 'Create separate posts!')
    .required('Why did you click create post?'),
});

const CreatePost: React.FC<unknown> = ({}) => {
  const router = useRouter();
  useIsAuth();
  const [createPost] = useCreatePostMutation();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: '', text: '' }}
        validationSchema={PostSchema}
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
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="Bob the Builder"
              label="Title"
            />
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="text"
                label="Body"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
