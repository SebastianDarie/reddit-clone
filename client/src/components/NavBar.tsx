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
  Skeleton,
  SkeletonCircle,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { ClassNames } from '@emotion/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { FaChartLine } from 'react-icons/fa';
import { GiUfo } from 'react-icons/gi';
import NextLink from 'next/link';
import Image from 'next/image';
import { useApolloClient } from '@apollo/client';
import { useRouter } from 'next/router';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

export const NavBar: React.FC<Record<string, never>> = ({}) => {
  const apolloClient = useApolloClient();
  const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const { data, loading } = useMeQuery({
    variables: { skipCommunities: false },
    skip: isServer(),
  });

  const { colorMode, toggleColorMode } = useColorMode();

  const currPage =
    router.asPath !== '/' ? router.asPath?.match(/([^\/]+$)/)?.[0] : 'All';

  let body = null;

  if (loading) {
    body = (
      <Flex align="center" w="225px">
        <SkeletonCircle size="8" mr={2} />
        <Skeleton height="20px" w="80%" />
      </Flex>
    );
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
        <ClassNames>
          {({ css }) => (
            <Image
              src={data.me?.photoUrl!}
              alt="profile pic"
              className={css`
                border-radius: 50%;
              `}
              width={32}
              height={32}
            />
          )}
        </ClassNames>
        <NextLink href="/user/[username]" as={`/user/${data.me.username}`}>
          <Link ml={2} mr={2}>
            {data.me.username}
          </Link>
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
                {currPage === 'home' ? (
                  <GiUfo />
                ) : currPage === 'All' ? (
                  <FaChartLine />
                ) : null}
                <Text
                  ml={currPage === 'home' || currPage === 'All' ? 1 : undefined}
                >
                  {currPage?.replace(/%20/g, ' ')}
                </Text>
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuGroup title="Reddit Feeds">
                <NextLink href="/r/home">
                  <MenuItem>Home</MenuItem>
                </NextLink>
                <NextLink href="/">
                  <MenuItem>All</MenuItem>
                </NextLink>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="My Communities">
                {data?.me?.communities!.map((community) => (
                  <NextLink
                    href="/r/[name]"
                    as={`/r/${community.name}`}
                    key={community.id}
                  >
                    <MenuItem>{community.name}</MenuItem>
                  </NextLink>
                ))}
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Other">
                <NextLink href="/create-post">
                  <MenuItem>Create Post</MenuItem>
                </NextLink>
                <NextLink href="/create-community">
                  <MenuItem>Create Community</MenuItem>
                </NextLink>
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
