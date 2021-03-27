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

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 20,
      cursor: null,
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
        <Stack spacing={8}>
          {data?.posts.posts.map((p) =>
            !p ? null : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpvoteSection post={p} />
                <Box data-testid="posts" flex={1}>
                  <Flex>
                    <Flex flexDir="column">
                      <Flex
                        color="gray.500"
                        fontSize={12}
                        fontWeight={400}
                        mb="4px"
                      >
                        <Text>Posted by u/ </Text>
                        <NextLink
                          href="/user/[username]"
                          as={`/user/${p.creator.username}`}
                        >
                          <Link mr="2px">{p.creator.username}</Link>
                        </NextLink>
                        {formatTimestamp(new Date(+p.createdAt).getTime())}
                      </Flex>

                      <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                        <Link>
                          <Heading fontSize={18} mt={2}>
                            {p.title}
                          </Heading>
                        </Link>
                      </NextLink>
                    </Flex>
                    <Box ml="auto">
                      <EditDeletePostButtons
                        id={p.id}
                        creatorId={p.creator.id}
                        editable={!!p.textSnippet}
                        image={p.image}
                      />
                    </Box>
                  </Flex>
                  <Flex align="center">
                    <PostData post={p as any} />
                  </Flex>
                  <Flex mt={4}>
                    <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                      <Link _hover={{ textDecoration: 'none' }}>
                        <Flex alignItems="center">
                          <IconButton
                            aria-label="comments"
                            size="md"
                            variant="outline"
                            icon={<FaRegCommentAlt />}
                            mr={2}
                          />
                          <Text>{p.comments.length} Comments</Text>
                        </Flex>
                      </Link>
                    </NextLink>
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
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
