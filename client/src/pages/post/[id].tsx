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
import {
  useMeQuery,
  useCommentMutation,
  PostDocument,
  PostQuery,
} from '../../generated/graphql';
import { CommentSchema } from '../../validation/yup';

const Post = ({}) => {
  const { data, error, loading } = useGetPostFromUrl();
  const { data: meData } = useMeQuery();
  const [comment] = useCommentMutation();

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
          validationSchema={CommentSchema}
          onSubmit={async (values, { resetForm }) => {
            comment({
              variables: { postId: data.post!.id, text: values.comment },
              update: (cache, { data: commentData }) => {
                const newComment = commentData?.comment;
                const currComments = cache.readQuery<PostQuery>({
                  query: PostDocument,
                  variables: { id: data.post?.id },
                });

                cache.writeQuery({
                  query: PostDocument,
                  data: {
                    post: {
                      ...currComments?.post,
                      comments: [...currComments!.post?.comments, newComment],
                    },
                  },
                });
              },
              // update(cache, { data: commentData }) {
              //   cache.modify({
              //     id: cache.identify(data.post!),
              //     fields: {
              //       comments(existingCommentRefs = [], { readField }) {
              //         const newCommentRef = cache.writeFragment({
              //           data: commentData,
              //           fragment: gql`
              //             fragment _ on Comment {
              //               id
              //               text
              //               points
              //               voteStatus
              //               creator {
              //                 id
              //                 username
              //               }
              //             }
              //           `,
              //         });
              //         return [...existingCommentRefs, newCommentRef];
              //       },
              //     },
              //   });
              // },
            });
            resetForm();
          }}
        >
          {({ values }) => (
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
                label={`Comment as ${meData?.me?.username}`}
              />
              <Button
                alignSelf="flex-end"
                mt={2}
                mb={4}
                type="submit"
                isDisabled={!!!values.comment}
                colorScheme="teal"
              >
                Comment
              </Button>
            </Form>
          )}
        </Formik>
      </Flex>

      <Flex flexDir="column">
        {data.post.comments
          .slice()
          .sort((a, b) => b.points - a.points)
          .map((comment) => (
            <CommentTemplate
              key={comment.id}
              comment={comment}
              meData={meData}
            />
          ))}
      </Flex>
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
