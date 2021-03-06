import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import { InputField } from '../../../components/form-fields/InputField';
import { Layout } from '../../../components/Layout';
import {
  usePostQuery,
  useUpdatePostMutation,
} from '../../../generated/graphql';
import { useGetIntId } from '../../../utils/useGetIntId';
import { withApollo } from '../../../utils/withApollo';

const PostSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Update your title!')
    .max(50, 'Too much already!')
    .required(),
  text: Yup.string()
    .min(3, "There's gotta be more to your content!")
    .max(40000, 'Create separate posts!')
    .required(),
});

const EditPost = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const { data, loading } = usePostQuery({
    skip: intId === -1,
    variables: {
      id: intId,
    },
  });
  const [updatePost] = useUpdatePostMutation();

  if (loading) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        validationSchema={PostSchema}
        onSubmit={async (values) => {
          await updatePost({ variables: { id: intId, ...values } });
          router.back();
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
              Update Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(EditPost);
