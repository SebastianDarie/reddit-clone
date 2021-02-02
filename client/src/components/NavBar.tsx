import React from 'react';
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { useRouter } from 'next/router';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const router = useRouter();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery();

  let body = null;

  if (fetching) {
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href='/login'>
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href='/register'>
          <Link>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex align='center'>
        <NextLink href='/create-post'>
          <Button as={Link} mr={4}>
            Create Post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          variant='link'
          isLoading={logoutFetching}
          onClick={async () => {
            await logout();
            router.reload();
          }}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg='tan' p={4} position='sticky' top={0} zIndex={1}>
      <Flex align='center' flex={1} m='auto' maxW={800}>
        <NextLink href='/'>
          <Link>
            <Heading>NRG Reddit</Heading>
          </Link>
        </NextLink>
        <Box ml='auto'>{body}</Box>
      </Flex>
    </Flex>
  );
};
