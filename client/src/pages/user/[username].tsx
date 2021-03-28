import Image from 'next/image';
import NextLink from 'next/link';
import { useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Link,
  Text,
} from '@chakra-ui/react';
import { GiCakeSlice, GiVineFlower } from 'react-icons/gi';
import { RiPencilLine, RiSettings5Line } from 'react-icons/ri';
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';
import { Layout } from '../../components/Layout';
import { PostData } from '../../components/posts/PostData';
import { withApollo } from '../../utils/withApollo';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { useGetUserFromUrl } from '../../utils/useGetUserFromUrl';
import {
  useDeleteUserMutation,
  useMeQuery,
  UserQuery,
} from '../../generated/graphql';
import { isServer } from '../../utils/isServer';

interface UserProps {}

const User: React.FC<UserProps> = ({}) => {
  const apolloClient = useApolloClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef(null);
  const { data, error, loading } = useGetUserFromUrl();
  const { data: meData } = useMeQuery({
    skip: isServer(),
  });
  const [deleteUser] = useDeleteUserMutation();

  if (!data && loading) {
    <Layout>
      <Box>loading...</Box>
    </Layout>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.user) {
    return (
      <Layout>
        <Box>Could not find user</Box>
      </Layout>
    );
  }

  const calculateKarma = (data: UserQuery | undefined): number => {
    let karma = 0;
    data?.user?.posts.forEach((post) => {
      karma++;
      karma += post.points * 2;
    });
    data?.user?.comments.forEach((comment) => {
      karma++;
      karma += comment.points * 2;
    });

    return karma;
  };

  return (
    <Layout variant="medium">
      <Flex flexDir="column">
        <Flex justify="space-between">
          <Flex flexDir="column">
            <Image
              src={data.user.photoUrl}
              alt="profile image"
              layout="fixed"
              width={100}
              height={100}
            />
            <Text fontSize={22} fontWeight={500} m="4px 0">
              {data.user.username}
            </Text>
            <Text color="gray.500" fontSize={12} fontWeight={500} mb="4px">
              u/{data.user.username} ·{' '}
              {formatTimestamp(new Date(+data.user.createdAt).getTime())}{' '}
            </Text>
          </Flex>

          {meData?.me?.id === data.user.id ? (
            <Flex flexDir="column">
              {/* <FormControl isInvalid={!!error}>
                <FormLabel htmlFor="profile">
                  <IconButton
                    aria-label="edit"
                    icon={<RiPencilLine />}
                    borderRadius="50%"
                  />
                </FormLabel>

                <Input
                  type="file"
                  accept="image/png, image/jpg, image/jpeg, image/gif"
                  id="profile"
                  name="profile"
                  label="profile"
                  display="none"
                  // onChange={(e) => {
                  //   if (e.target.files?.[0]) {
                  //     setFieldValue('image', e.target?.files[0]);
                  //   }
                  // }}
                />
              </FormControl> */}

              <IconButton
                aria-label="edit"
                icon={<RiSettings5Line />}
                borderRadius="50%"
                mt={2}
                onClick={() => setIsOpen(true)}
              />

              <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
              >
                <AlertDialogOverlay>
                  <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                      Delete Account
                    </AlertDialogHeader>

                    <AlertDialogBody>
                      Are you sure? Everything will be lost.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                      <Button ref={cancelRef} onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        colorScheme="red"
                        onClick={async () => {
                          const response = await deleteUser({
                            variables: { username: data.user?.username! },
                          });
                          if (!response.errors) {
                            await apolloClient.resetStore();
                            router.push('/');
                          }
                        }}
                        ml={3}
                      >
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialogOverlay>
              </AlertDialog>
            </Flex>
          ) : null}
        </Flex>

        <Flex justify="space-between" mt="4px">
          <Flex flexDir="column" mb="12px">
            <Text fontSize={14}>Karma</Text>
            <Flex alignItems="center">
              <GiVineFlower color="dodgerblue" />{' '}
              <Text color="gray.500" ml="4px">
                {calculateKarma(data)}
              </Text>
            </Flex>
          </Flex>
          <Flex flexDir="column" mb="12px">
            <Text fontSize={14}>Cake day</Text>
            <Flex alignItems="center">
              <GiCakeSlice color="dodgerblue" />{' '}
              <Text color="gray.500" ml="4px">
                {new Intl.DateTimeFormat('en-GB', {
                  dateStyle: 'full',
                }).format(new Date(+data.user.createdAt))}
              </Text>
            </Flex>
          </Flex>
        </Flex>

        <Flex flexDir="column">
          {data.user.posts
            .slice()
            .sort((a, b) => +b.createdAt - +a.createdAt)
            .map((post) => (
              <Flex key={post.id} p={4} shadow="md" borderWidth="1px">
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
                          as={`/user/${data.user?.username}`}
                        >
                          <Link mr="2px">{data.user?.username}</Link>
                        </NextLink>
                        {formatTimestamp(new Date(+post.createdAt).getTime())}
                      </Flex>

                      <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                        <Link>
                          <Heading fontSize={18} mt={2}>
                            {post.title}
                          </Heading>
                        </Link>
                      </NextLink>
                    </Flex>
                  </Flex>
                  <Flex align="center">
                    <PostData post={post as any} />
                  </Flex>
                </Box>
              </Flex>
            ))}
          {data.user.comments.map((comment) => (
            <Flex
              key={comment.id}
              flexDir="column"
              m="5px 0px"
              p={2}
              shadow="md"
              borderWidth="1px"
            >
              {/* <NextLink href="/post/[id]" as={`/post/${comment.postId}`}>
                <Link>
                  <Heading fontSize={18} mt={2}>
                    {
                      data.user?.posts.find(
                        (post) => post.id === comment.postId
                      )?.title
                    }
                  </Heading>
                </Link>
              </NextLink> */}
              <Flex alignItems="center" fontSize={12} fontWeight={400}>
                <Text color="gray.500">
                  {formatTimestamp(new Date(+comment.createdAt).getTime())}
                </Text>
                {comment.createdAt !== comment.updatedAt ? (
                  <>
                    <Text color="gray.500" pl="4px">
                      {' '}
                      ·{' '}
                    </Text>
                    <Text color="gray.500" fontStyle="italic" ml="3px">
                      edited{' '}
                      {formatTimestamp(new Date(+comment.updatedAt).getTime())}
                    </Text>
                  </>
                ) : null}
              </Flex>

              <Text fontWeight={400} mb={2}>
                {comment.text}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Layout>
  );
};

export default withApollo({ ssr: true })(User);
