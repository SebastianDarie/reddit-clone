import { useApolloClient } from '@apollo/client';
import { Button, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { PostFeed } from '../components/posts/PostFeed';
import {
  Post,
  useMeQuery,
  usePostsLazyQuery,
  usePostsQuery,
} from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const apolloClient = useApolloClient();
  const [
    getPosts,
    { data, error, loading, fetchMore, variables },
  ] = usePostsLazyQuery();
  const [filteredPosts, setFilteredPosts] = useState<
    Omit<Post[], 'text' | 'creatorId' | 'communityId' | 'updatedAt'>
  >([]);

  useEffect(() => {
    getPosts({
      variables: {
        limit: 20,
        cursor: null,
        communityId: null,
        communityIds: null,
      },
    });
    if (data) {
      // const arr = data.posts.posts.filter((post) =>
      //   ids.includes(post.community.id)
      // );
      // console.log(data, arr);
      // setFilteredPosts(arr);
      // console.log(loading);
      setFilteredPosts(data.posts.posts);
    }

    // return () => {
    //   apolloClient.cache.evict({ fieldName: 'posts:{}' });
    //   apolloClient.cache.gc();
    // };
  }, [data?.posts]);

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
        <PostFeed posts={filteredPosts} />
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
