import Image from 'next/image';
import { Box, Flex, Text } from '@chakra-ui/react';
import { GiCakeSlice, GiVineFlower } from 'react-icons/gi';
import { Layout } from '../../components/Layout';
import { withApollo } from '../../utils/withApollo';
import { formatTimestamp } from '../../utils/formatTimestamp';
import { useGetUserFromUrl } from '../../utils/useGetUserFromUrl';

interface UserProps {}

const User: React.FC<UserProps> = ({}) => {
  const { data, error, loading } = useGetUserFromUrl();

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
        {/* <Flex flexDir="column"> */}
        <Image
          src={data.user.photoUrl}
          alt="post image"
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
        {/* </Flex> */}
        <Flex justifyContent="space-between" mt="4px">
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
