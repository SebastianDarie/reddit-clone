import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  SkeletonCircle,
  SkeletonText,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { PostFeed } from '../../components/posts/PostFeed';
import { Post, useMeQuery, usePostsLazyQuery } from '../../generated/graphql';
import { isServer } from '../../utils/isServer';
import { withApollo } from '../../utils/withApollo';

const Home = () => {
  const { data: meData } = useMeQuery({
    variables: { skipCommunities: false },
    skip: isServer(),
  });
  const [
    getPosts,
    { data, error, loading, fetchMore, variables },
  ] = usePostsLazyQuery({ notifyOnNetworkStatusChange: true });

  useEffect(() => {
    if (meData?.me?.communities) {
      const ids = meData?.me?.communities.map((community) => community.id);
      getPosts({
        variables: {
          limit: 20,
          cursor: null,
          communityId: null,
          communityIds: ids,
        },
      });
    }
  }, [meData?.me?.id]);

  if (!meData?.me?.communities) {
    return (
      <Alert status="warning">
        <AlertIcon />
        You did not join any communities yet!
      </Alert>
    );
  } else if (!data && !loading) {
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
        data && <PostFeed posts={data.posts.posts as Post[]} />
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            m="auto"
            my={8}
            isLoading={loading}
            onClick={() => {
              fetchMore!({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                  communityIds: variables?.communityIds,
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

export default withApollo({ ssr: true })(Home);
