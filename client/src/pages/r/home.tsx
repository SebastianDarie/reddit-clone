import { Button, Flex } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { PostFeed } from '../../components/posts/PostFeed';
import { useMeQuery, usePostsLazyQuery } from '../../generated/graphql';
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
        <div>loading...</div>
      ) : (
        data && <PostFeed posts={data.posts.posts} />
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
