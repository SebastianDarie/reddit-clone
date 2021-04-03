import { useApolloClient } from '@apollo/client';
import { Box, Button, Flex } from '@chakra-ui/react';
import { Layout } from '../../components/Layout';
import { PostFeed } from '../../components/posts/PostFeed';
import {
  GetCommunityDocument,
  GetCommunityQuery,
  useAddCommunityUserMutation,
  useLeaveCommunityMutation,
  useMeQuery,
  usePostsLazyQuery,
} from '../../generated/graphql';
import { isServer } from '../../utils/isServer';
import { useGetCommunityFromUrl } from '../../utils/useGetCommunityFromUrl';
import { withApollo } from '../../utils/withApollo';

interface CommunityProps {}

const Community: React.FC<CommunityProps> = ({}) => {
  const apolloClient = useApolloClient();
  const { data, error, loading } = useGetCommunityFromUrl();
  const { data: meData } = useMeQuery({
    variables: { skipCommunities: true },
    skip: isServer(),
  });
  const [
    getPosts,
    {
      data: postsData,
      // error: postsErr,
      loading: postsLoading,
      fetchMore,
      variables,
    },
  ] = usePostsLazyQuery();
  const [addCommunityUser] = useAddCommunityUserMutation();
  const [leaveCommunity] = useLeaveCommunityMutation();

  if (!data && !meData && !postsData && loading) {
    <Layout>
      <Box>loading...</Box>
    </Layout>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.getCommunity) {
    return (
      <Layout>
        <Box>Could not find community</Box>
      </Layout>
    );
  }

  const currUser = data.getCommunity.users.find(
    (user) => user.id === meData?.me?.id
  );

  return (
    <Layout>
      {/* <Box
        bg={useColorModeValue('gray.50', 'inherit')}
        minH="100vh"
        py="12"
        px={{ sm: '6', lg: '8' }}
      >
        <Box maxW={{ sm: 'md' }} mx={{ sm: 'auto' }} w={{ sm: 'full' }}> */}
      {/* <Box as="section" pt="8" pb="12">
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          py="3"
          px={{ base: '3', md: '6', lg: '8' }}
          color="white"
          bg={useColorModeValue('blue.600', 'blue.400')}
          justifyContent="center"
          alignItems="center"
        >
          <HStack direction="row" spacing="3">
            <Text fontWeight="medium" marginEnd="2">
              Confirm your email. Check your email. We&apos;ve send a message to{' '}
              <b>sample@gmail.com</b>
            </Text>
          </HStack>
          <ActionLink w={{ base: 'full', sm: 'auto' }} flexShrink={0}>
        Resend email
      </ActionLink>
        </Stack>
      </Box> */}

      <Flex justify="center" mb={8}>
        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Box p="6">
            <Box d="flex" alignItems="baseline" justifyContent="space-between">
              {/* <Badge borderRadius="full" px="2" colorScheme="teal">
                New
              </Badge> */}
              <Box
                color="gray.500"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
              >
                r/{data.getCommunity.name}
              </Box>
              <Flex>
                <Button
                  colorScheme={currUser ? 'red' : 'teal'}
                  size="xs"
                  variant="ghost"
                  borderRadius="999px"
                  onClick={() => {
                    currUser
                      ? leaveCommunity({
                          variables: { communityId: data.getCommunity!.id },
                          update: (cache) => {
                            const currData = cache.readQuery<GetCommunityQuery>(
                              {
                                query: GetCommunityDocument,
                                variables: { name: data.getCommunity?.name },
                              }
                            );
                            cache.writeQuery({
                              query: GetCommunityDocument,
                              variables: { name: data.getCommunity?.name },
                              data: {
                                getCommunity: {
                                  ...currData,
                                  users: [
                                    ...currData?.getCommunity?.users.filter(
                                      (user) => user.id !== currUser.id
                                    )!,
                                  ],
                                },
                              },
                            });

                            const normalizedId = cache.identify({
                              __typename: 'User',
                              id: meData?.me?.id,
                            });
                            cache.evict({ id: normalizedId });
                            cache.gc();
                          },
                        })
                      : addCommunityUser({
                          variables: {
                            communityId: data.getCommunity!.id,
                            userId: meData?.me?.id!,
                          },
                          update: (cache) => {
                            const currData = cache.readQuery<GetCommunityQuery>(
                              {
                                query: GetCommunityDocument,
                                variables: { name: data.getCommunity?.name },
                              }
                            );
                            cache.writeQuery({
                              query: GetCommunityDocument,
                              variables: { name: data.getCommunity?.name },
                              data: {
                                getCommunity: {
                                  ...currData,
                                  users: [
                                    ...currData?.getCommunity?.users!,
                                    { id: meData?.me?.id },
                                  ],
                                },
                              },
                            });

                            const normalizedId = cache.identify({
                              __typename: 'User',
                              id: meData?.me?.id,
                            });
                            cache.evict({ id: normalizedId });
                            cache.gc();
                          },
                        });
                  }}
                >
                  {currUser ? 'Leave' : 'Join'}
                </Button>

                {currUser ? (
                  <Button
                    colorScheme="red"
                    size="xs"
                    variant="ghost"
                    borderRadius="999px"
                  >
                    Delete
                  </Button>
                ) : null}
              </Flex>
            </Box>

            <Box
              mt="1"
              fontWeight="semibold"
              as="h4"
              lineHeight="tight"
              // isTruncated
            >
              {data.getCommunity.description}
            </Box>

            {/* <Box>
              $1,990
              <Box as="span" color="gray.600" fontSize="sm">
                / wk
              </Box>
            </Box> */}

            <Box d="flex" mt="2" alignItems="center">
              <Box as="span" color="gray.600" fontSize="sm">
                {data.getCommunity.users.length} members
              </Box>
            </Box>
          </Box>
        </Box>
      </Flex>
      {/* </Box>
      </Box> */}
      <Flex justify="center" align="center" mb={4}>
        <Button
          onClick={() => {
            apolloClient.cache.evict({ fieldName: 'posts:{}' });
            apolloClient.cache.gc();
            getPosts({
              variables: {
                limit: 20,
                cursor: null,
                communityId: data?.getCommunity?.id!,
                communityIds: null,
              },
            });
          }}
        >
          Load Posts
        </Button>
      </Flex>

      {!postsData && postsLoading ? (
        <div>loading...</div>
      ) : (
        postsData && <PostFeed posts={postsData?.posts.posts} />
      )}
      {postsData && postsData.posts.hasMore ? (
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
                    postsData.posts.posts[postsData.posts.posts.length - 1]
                      .createdAt,
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

export default withApollo({ ssr: true })(Community);
