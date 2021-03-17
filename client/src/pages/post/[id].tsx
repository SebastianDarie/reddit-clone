import { Box, Button, Flex, Heading, IconButton, Text } from '@chakra-ui/react';
import { FaRegCommentAlt } from 'react-icons/fa';
import { Formik, Form } from 'formik';
import { EditDeletePostButtons } from '../../components/posts/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import { withApollo } from '../../utils/withApollo';
import { PostData } from '../../components/posts/PostData';
import { InputField } from '../../components/form-fields/InputField';
import { UpvoteSection } from '../../components/posts/UpvoteSection';
import { CommentTemplate } from '../../components/comments/CommentTemplate';

const Post = ({}) => {
  const { data, error, loading } = useGetPostFromUrl();

  if (loading) {
    <Layout>
      <Box>loading...</Box>
    </Layout>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex justifyContent="space-between">
        <Heading fontSize={20}>{data.post.title}</Heading>
        <UpvoteSection post={data.post as any} row />

        <EditDeletePostButtons
          id={data.post.id}
          creatorId={data.post.creator.id}
          editable={!!data.post.text}
          image={data.post.image}
        />
      </Flex>

      <PostData post={data.post as any} single />

      <Flex alignItems="center" mt={2}>
        <IconButton
          aria-label="comments"
          size="md"
          variant="outline"
          icon={<FaRegCommentAlt />}
          mr={2}
        />
        <Text>{data.post.comments.length} Comments</Text>
      </Flex>

      <Flex mt={2}>
        <Formik
          initialValues={{ comment: '' }}
          //validationSchema={TextSchema}
          onSubmit={async (values) => {
            console.log(values);
          }}
        >
          {({ values, isSubmitting }) => (
            <Form
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <InputField
                textarea
                name="comment"
                placeholder="What are your thoughts?"
                label={`Comment as ${data.post?.creator.username}`}
              />
              <Button
                alignSelf="flex-end"
                mt={2}
                mb={4}
                type="submit"
                isDisabled={!!!values.comment}
                isLoading={isSubmitting}
                colorScheme="teal"
              >
                Comment
              </Button>
            </Form>
          )}
        </Formik>
      </Flex>

      <Flex flexDir="column">
        {data.post.comments.map((comment) => (
          <CommentTemplate key={comment.id} comment={comment} />
        ))}
      </Flex>
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
