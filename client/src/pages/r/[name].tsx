import {
  Box,
  Button,
  Flex,
  SkeletonCircle,
  SkeletonText,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { PostFeed } from '../../components/posts/PostFeed';
import {
  GetCommunityDocument,
  GetCommunityQuery,
  Post,
  useAddCommunityUserMutation,
  useDeleteCommunityMutation,
  useLeaveCommunityMutation,
  useMeQuery,
  usePostsLazyQuery,
} from '../../generated/graphql';
import { isServer } from '../../utils/isServer';
import { useGetCommunityFromUrl } from '../../utils/useGetCommunityFromUrl';
import { withApollo } from '../../utils/withApollo';

interface CommunityProps {}

const Community: React.FC<CommunityProps> = ({}) => {
  const router = useRouter();
  const { data, error, loading } = useGetCommunityFromUrl();
  const { data: meData } = useMeQuery({
    variables: { skipCommunities: true },
    skip: isServer(),
  });
  const [
    getPosts,
    {
      data: postsData,
      error: postsErr,
      loading: postsLoading,
      fetchMore,
      variables,
    },
  ] = usePostsLazyQuery({ notifyOnNetworkStatusChange: true });
  const [addCommunityUser] = useAddCommunityUserMutation();
  const [leaveCommunity] = useLeaveCommunityMutation();
  const [deleteCommunity] = useDeleteCommunityMutation();

  if (!data && !meData && !postsData && loading) {
    <Layout>
      <Box>loading...</Box>
    </Layout>;
  }

  if (error || postsErr) {
    return <div>{error?.message || postsErr?.message}</div>;
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
      <Flex justify="center" mb={8}>
        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Box p="6">
            <Box d="flex" alignItems="center" justifyContent="space-between">
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
                  display={
                    currUser && data.getCommunity.users.length === 1
                      ? 'none'
                      : 'inline-flex'
                  }
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
                    onClick={async () => {
                      const { errors } = await deleteCommunity({
                        variables: { communityId: data.getCommunity?.id! },
                        update: (cache) => {
                          cache.evict({
                            id: 'Community:' + data.getCommunity?.id,
                          });
                          cache.evict({ id: 'User:' + meData?.me?.id });
                          cache.gc();
                        },
                      });

                      if (!errors) {
                        router.push('/');
                      }
                    }}
                  >
                    Delete
                  </Button>
                ) : null}
              </Flex>
            </Box>

            <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight">
              {data.getCommunity.description}
            </Box>

            <Box d="flex" mt="2" alignItems="center">
              <Box as="span" color="gray.600" fontSize="sm">
                {data.getCommunity.users.length} members
              </Box>
            </Box>
          </Box>
        </Box>
      </Flex>

      <Flex justify="center" align="center" mb={4}>
        <Button
          onClick={() => {
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
        <Box padding="6" boxShadow="lg">
          <SkeletonCircle size="10" />
          <SkeletonText mt="4" noOfLines={4} spacing="4" />
        </Box>
      ) : (
        postsData && <PostFeed posts={postsData?.posts.posts as Post[]} />
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
                  communityId: variables?.communityId,
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
