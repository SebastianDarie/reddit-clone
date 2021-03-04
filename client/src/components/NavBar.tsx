import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useApolloClient } from '@apollo/client';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

export const NavBar: React.FC<{}> = ({}) => {
  const apolloClient = useApolloClient();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });

  let body = null;

  if (loading) {
    body = <>loading please wait</>;
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            Create Post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          variant="link"
          isLoading={logoutFetching}
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4} position="sticky" top={0} zIndex={1}>
      <Flex align="center" flex={1} m="auto" maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading>NRG Reddit</Heading>
          </Link>
        </NextLink>
        <Box ml="auto">{body}</Box>
      </Flex>
    </Flex>
  );
};
