import { Button, Flex } from '@chakra-ui/react';
import { PostFeed } from '../../components/posts/PostFeed';
import { usePostsQuery } from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';
import { Layout } from '../../components/Layout';

const All = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 20,
      cursor: null,
      communityId: null,
      communityIds: null,
    },
    notifyOnNetworkStatusChange: true,
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
        <div>loading...</div>
      ) : (
        <PostFeed posts={data?.posts.posts!} />
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

export default withApollo({ ssr: true })(All);
