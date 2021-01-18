import { withUrqlClient } from 'next-urql';
import { Layout } from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NavLink from 'next/link';
import { Link } from '@chakra-ui/react';

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <Layout>
      <NavLink href='/create-post'>
        <Link>Create Post</Link>
      </NavLink>
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
