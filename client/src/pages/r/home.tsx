import { Button, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { PostFeed } from '../../components/posts/PostFeed';
import {
  Post,
  useMeQuery,
  usePostsLazyQuery,
  usePostsQuery,
} from '../../generated/graphql';
import { withApollo } from '../../utils/withApollo';
import { Layout } from '../../components/Layout';
import { isServer } from '../../utils/isServer';

const Home = () => {
  const apolloClient = useApolloClient();
  const { data: meData } = useMeQuery({
    variables: { skipCommunities: false },
    skip: isServer(),
  });
  const [
    getPosts,
    { data, error, loading, fetchMore, variables },
  ] = usePostsLazyQuery();
  const [filteredPosts, setFilteredPosts] = useState<
    Omit<Post[], 'text' | 'creatorId' | 'communityId' | 'updatedAt'>
  >([]);

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

    // return () => {
    //   apolloClient.cache.evict({ fieldName: 'posts:{}' });
    //   apolloClient.cache.gc();
    // };
  }, [meData?.me?.id]);

  useEffect(() => {
    if (data) {
      const ids = meData?.me?.communities.map((community) => community.id);
      const arr = data.posts.posts.filter((post) =>
        ids.includes(post.community.id)
      );
      console.log(data, arr);
      setFilteredPosts(arr);
      console.log(loading);
    }

    // return () => {
    //   apolloClient.cache.evict({ fieldName: 'posts:{}' });
    //   apolloClient.cache.gc();
    // };
  }, [data?.posts.posts]);

  return (
    <Layout>
      {!data && loading ? (
        <div>loading...</div>
      ) : (
        data && filteredPosts && <PostFeed posts={filteredPosts} />
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

export default withApollo({ ssr: true })(Home);
