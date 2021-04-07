import {
  Box,
  Button,
  Flex,
  SkeletonCircle,
  SkeletonText,
} from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import { PostFeed } from '../components/posts/PostFeed';
import { usePostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const { data, error, loading, variables, fetchMore } = usePostsQuery({
    variables: {
      limit: 20,
      cursor: null,
      communityId: null,
      communityIds: null,
    },
    notifyOnNetworkStatusChange: true,
    partialRefetch: true,
  });

  if (!data && !loading) {
    return (
      <div>
        <div>failed to load content</div>
        <div>{error?.message}</div>
      </div>
    );
  }

  return (
    <Layout>
      {!data && loading ? (
        <Box padding="6" boxShadow="lg">
          <SkeletonCircle size="10" />
          <SkeletonText mt="4" noOfLines={4} spacing="4" />
        </Box>
      ) : (
        <PostFeed posts={data?.posts.posts} />
      )}

      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            m="auto"
            my={8}
            isLoading={loading}
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
              });
            }}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
