import Image from 'next/image';
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
  IconButton,
  Text,
} from '@chakra-ui/react';
import { GiCakeSlice, GiVineFlower } from 'react-icons/gi';
import { RiPencilLine, RiSettings5Line } from 'react-icons/ri';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { withApollo } from '../../utils/withApollo';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { useGetUserFromUrl } from '../../utils/useGetUserFromUrl';
import { useDeleteUserMutation, useMeQuery } from '../../generated/graphql';
import { isServer } from '../../utils/isServer';

interface UserProps {}

const User: React.FC<UserProps> = ({}) => {
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

  return (
    <Layout variant="small">
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
              <IconButton
                aria-label="edit"
                icon={<RiPencilLine />}
                borderRadius="50%"
              />
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
                        // onClick={async () => {
                        //   const response = await deleteUser({
                        //     variables: { username: data.user?.username! },
                        //     update: (cache) =>
                        //       cache.evict({ id: 'User' + data.user?.id }),
                        //   });
                        //   if (!response.errors) {
                        //     router.push('/');
                        //   }
                        // }}
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
                103
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
      </Flex>
    </Layout>
  );
};

export default withApollo({ ssr: true })(User);
