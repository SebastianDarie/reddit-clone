import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { GiUfo } from 'react-icons/gi';
import NextLink from 'next/link';
import { useApolloClient } from '@apollo/client';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

export const NavBar: React.FC<Record<string, never>> = ({}) => {
  const apolloClient = useApolloClient();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });

  const { colorMode, toggleColorMode } = useColorMode();

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
          <Button as={Link} mr={4} bg="#8cc1d2">
            Create Post
          </Button>
        </NextLink>
        <NextLink href="/user/[username]" as={`/user/${data.me.username}`}>
          <Link mr={2}>{data.me.username}</Link>
        </NextLink>
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
    <Flex bg="#d2a28c" p={4} position="sticky" top={0} zIndex={1}>
      <Flex align="center" flex={1} m="auto" maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading>Reddit</Heading>
          </Link>
        </NextLink>
        <Flex justify="center" w="100%">
          <Menu isLazy>
            <MenuButton as={Button} bg="#8cc1d2">
              <Flex align="center">
                <GiUfo />
                <Text ml={1}>Home</Text>
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuGroup title="Reddit Feeds">
                <MenuItem>Home</MenuItem>
                <MenuItem>All</MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="My Communities">
                <MenuItem>React</MenuItem>
                <MenuItem>GraphQL</MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Other">
                <MenuItem>Create Post</MenuItem>
                <MenuItem>Create Community</MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>
        </Flex>
        <Box ml="auto" mr={2}>
          {body}
        </Box>
        <IconButton
          aria-label="Change colorMode"
          bg={colorMode === 'dark' ? '#978cd2' : '#c8d28c'}
          color={colorMode === 'light' ? '#978cd2' : '#fff800'}
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
        />
      </Flex>
    </Flex>
  );
};
