import React, { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import { Layout } from '../components/Layout';
import { usePostsQuery, PostsQueryVariables } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { UpvoteSection } from '../components/UpvoteSection';
import { EditDeletePostButtons } from '../components/EditDeletePostButtons';

type Props = {
  variables: PostsQueryVariables;
  isLastPage: boolean;
  onLoadMore: (cursor: string) => void;
};

const Page = ({ variables, isLastPage, onLoadMore }: Props) => {
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  return (
    <>
      <Stack spacing={8}>
        {data?.posts.posts.map((p) =>
          !p ? null : (
            <Flex key={p.id} p={5} shadow='md' borderWidth='1px'>
              <UpvoteSection post={p} />
              <Box flex={1}>
                <NextLink href='/post/[id]' as={`/post/${p.id}`}>
                  <Link>
                    <Heading fontSize='xl'>{p.title}</Heading>
                  </Link>
                </NextLink>
                <Text>posted by {p.creator.username}</Text>
                <Flex align='center'>
                  <Text mt={4}>{p.textSnippet}</Text>

                  <Box ml='auto'>
                    <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                  </Box>
                </Flex>
              </Box>
            </Flex>
          )
        )}
      </Stack>
      {(isLastPage && fetching) || (isLastPage && data?.posts.hasMore) ? (
        <Flex>
          <Button
            m='auto'
            my={8}
            isLoading={fetching}
            onClick={() => {
              if (data?.posts) {
                onLoadMore(
                  data.posts.posts[data.posts.posts.length - 1].createdAt
                );
              }
            }}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </>
  );
};

const limit = 10;

const Index = () => {
  const [pageVariables, setPageVariables] = useState([
    {
      limit,
      cursor: null as null | string,
    },
  ]);

  return (
    <Layout>
      {pageVariables.map((vars, i) => {
        return (
          <Page
            key={'' + vars.cursor}
            variables={vars}
            isLastPage={i === pageVariables.length - 1}
            onLoadMore={(cursor) =>
              setPageVariables([...pageVariables, { cursor, limit }])
            }
          ></Page>
        );
      })}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
