import NextLink from 'next/link';
import {
  Link,
  ListItem,
  Skeleton,
  UnorderedList,
  useColorModeValue as mode,
} from '@chakra-ui/react';
import { Layout } from '../components/Layout';
import { useGetCommunitiesQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

interface CommunitiesProps {}

const Communities: React.FC<CommunitiesProps> = ({}) => {
  const { data, error, loading } = useGetCommunitiesQuery({
    notifyOnNetworkStatusChange: true,
  });

  if (!data && !loading) {
    return (
      <>
        <div>failed to load communities</div>
        <div>{error?.message}</div>
      </>
    );
  }

  return (
    <Layout variant="regular">
      <Skeleton startColor="pink.500" endColor="orange.500" isLoaded={!loading}>
        <UnorderedList styleType="none">
          {data?.getCommunities.map((community) => (
            <NextLink
              key={community.id}
              href="/r/[name]"
              as={`/r/${community.name}`}
            >
              <Link p="15px 0 15px 30px" _hover={{ textDecoration: 'none' }}>
                <ListItem
                  _hover={{
                    backgroundColor: mode(
                      '#E2E8F0',
                      'rgba(255, 255, 255, 0.16)'
                    ),
                  }}
                >
                  {community.name}
                </ListItem>
              </Link>
            </NextLink>
          ))}
        </UnorderedList>
      </Skeleton>
    </Layout>
  );
};

export default withApollo({ ssr: true })(Communities);
