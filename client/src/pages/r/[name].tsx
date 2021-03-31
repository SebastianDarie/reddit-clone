import {
  Badge,
  Box,
  Flex,
  Stack,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Layout } from '../../components/Layout';
import { useGetCommunityFromUrl } from '../../utils/useGetCommunityFromUrl';
import { withApollo } from '../../utils/withApollo';

interface CommunityProps {}

const Community: React.FC<CommunityProps> = ({}) => {
  const { data, error, loading } = useGetCommunityFromUrl();

  if (!data && loading) {
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

  return (
    <Flex>
      <Layout>
        {/* <Box
        bg={useColorModeValue('gray.50', 'inherit')}
        minH="100vh"
        py="12"
        px={{ sm: '6', lg: '8' }}
      >
        <Box maxW={{ sm: 'md' }} mx={{ sm: 'auto' }} w={{ sm: 'full' }}> */}
        <Box as="section" pt="8" pb="12">
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
                Confirm your email. Check your email. We&apos;ve send a message
                to <b>sample@gmail.com</b>
              </Text>
            </HStack>
            {/* <ActionLink w={{ base: 'full', sm: 'auto' }} flexShrink={0}>
        Resend email
      </ActionLink> */}
          </Stack>
        </Box>
        {/* </Box>
      </Box> */}
      </Layout>

      <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Box p="6">
          <Box d="flex" alignItems="baseline">
            <Badge borderRadius="full" px="2" colorScheme="teal">
              New
            </Badge>
            <Box
              color="gray.500"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
              ml="2"
            >
              beds &bull; baths
            </Box>
          </Box>

          <Box
            mt="1"
            fontWeight="semibold"
            as="h4"
            lineHeight="tight"
            isTruncated
          >
            Modern home in city center in the heart of historic Los Angeles
          </Box>

          <Box>
            $1,990
            <Box as="span" color="gray.600" fontSize="sm">
              / wk
            </Box>
          </Box>

          <Box d="flex" mt="2" alignItems="center">
            <Box as="span" ml="2" color="gray.600" fontSize="sm">
              2 reviews
            </Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default withApollo({ ssr: true })(Community);
