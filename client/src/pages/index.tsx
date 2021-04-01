import NextLink from 'next/link';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FaRegCommentAlt } from 'react-icons/fa';
import { Layout } from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { UpvoteSection } from '../components/posts/UpvoteSection';
import { EditDeletePostButtons } from '../components/posts/EditDeletePostButtons';
import { withApollo } from '../utils/withApollo';
import { PostData } from '../components/posts/PostData';
import { formatTimestamp } from '../utils/formatTimestamp';
import { PostFeed } from '../components/posts/PostFeed';

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 20,
      cursor: null,
      communityId: null,
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

export default withApollo({ ssr: true })(Index);
