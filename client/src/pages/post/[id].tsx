import { Box, Flex, Heading } from '@chakra-ui/react';
import { EditDeletePostButtons } from '../../components/posts/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import { withApollo } from '../../utils/withApollo';
import { PostData } from '../../components/posts/PostData';

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
        <EditDeletePostButtons
          id={data.post.id}
          creatorId={data.post.creator.id}
          editable={!!data.post.text}
          image={data.post.image}
        />
      </Flex>

      <PostData post={data.post as any} single />
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
