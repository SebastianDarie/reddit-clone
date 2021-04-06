import { useApolloClient } from '@apollo/client';
import { Button, Flex, IconButton } from '@chakra-ui/react';
import { BiRefresh } from 'react-icons/bi';
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { PostFeed } from '../components/posts/PostFeed';
import {
  PaginatedPosts,
  Post,
  useMeQuery,
  usePostsLazyQuery,
  usePostsQuery,
} from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  // const [
  //   getPosts,
  //   { data, error, loading, networkStatus, fetchMore, refetch, variables },
  // ] = usePostsLazyQuery({
  //   notifyOnNetworkStatusChange: true,
  //   partialRefetch: true,
  // });

  // useEffect(() => {
  //   getPosts({
  //     variables: {
  //       limit: 20,
  //       cursor: null,
  //       communityId: null,
  //       communityIds: null,
  //     },
  //   });
  //   if (data) {
  //     setFilteredPosts(data.posts.posts);
  //   }

  // }, [data?.posts]);

  const {
    data,
    error,
    loading,
    networkStatus,
    variables,
    fetchMore,
    refetch,
  } = usePostsQuery({
    variables: {
      limit: 20,
      cursor: null,
      communityId: null,
      communityIds: null,
    },
    notifyOnNetworkStatusChange: true,
    partialRefetch: true,
  });

  if (loading || networkStatus === 4) {
    <div>loading...</div>;
  }

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
      <Flex justify="center" align="center" mb={4}>
        <IconButton
          aria-label="refresh"
          icon={<BiRefresh />}
          onClick={() => refetch()}
        />
      </Flex>

      {data && <PostFeed posts={data?.posts.posts} />}

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
                // updateQuery: (prev: PaginatedPosts, { fetchMoreResult }) => {
                //   if (!fetchMoreResult) return prev;
                //   return Object.assign({}, prev, {
                //     posts: {
                //       ...prev.posts,
                //       ...fetchMoreResult.posts,
                //     },
                //   });
                // },
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
