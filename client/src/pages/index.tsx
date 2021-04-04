import { useApolloClient } from '@apollo/client';
import { Button, Flex } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { PostFeed } from '../components/posts/PostFeed';
import {
  useMeQuery,
  usePostsLazyQuery,
  usePostsQuery,
} from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const apolloClient = useApolloClient();
  const { data: meData } = useMeQuery({
    variables: { skipCommunities: false },
    skip: isServer(),
  });
  const [
    getPosts,
    { data, error, loading, fetchMore, variables },
  ] = usePostsLazyQuery();

  // if (!data && !loading) {
  //   return (
  //     <div>
  //       <div>failed to load content</div>
  //       <div>{error?.message}</div>
  //     </div>
  //   );
  // }

  useEffect(() => {
    if (meData?.me?.communities) {
      // apolloClient.cache.evict({ fieldName: 'posts:{}' });
      // apolloClient.cache.gc();
      const ids = meData?.me?.communities.map((community) => community.id);
      getPosts({
        variables: {
          limit: 20,
          cursor: null,
          communityId: null,
          communityIds: ids,
        },
      });
      if (data) {
        const arr = data.posts.posts.filter((post) =>
          ids.includes(post.community.id)
        );
        console.log(arr);
      }
    }
  }, [data?.posts, meData?.me]);

  return (
    <Layout>
      {!data && loading ? (
        <div>loading...</div>
      ) : (
        data && <PostFeed posts={data?.posts.posts!} />
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
