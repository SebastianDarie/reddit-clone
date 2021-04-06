import { ApolloClient, InMemoryCache } from '@apollo/client';
import { NextPageContext } from 'next';
import { withApollo as createWithApollo } from 'next-apollo';
import { PaginatedPosts } from '../generated/graphql';

const createClient = (ctx: NextPageContext | undefined) =>
  new ApolloClient({
    assumeImmutableResults: true,
    ssrMode: typeof window === 'undefined',
    queryDeduplication: true,
    uri: process.env.NEXT_PUBLIC_API_URL as string,
    credentials: 'include',
    headers: {
      cookie:
        (typeof window === 'undefined'
          ? ctx?.req?.headers.cookie
          : undefined) || '',
    },
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: ['communityId', 'communityIds'],
              merge(
                existing: PaginatedPosts | undefined,
                incoming: PaginatedPosts
                //{ readField }
              ): PaginatedPosts {
                // const merged = { ...existing };
                // incoming.posts.forEach((post) => {
                //   merged[readField('id', post)] = post;
                // });
                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts],
                };
                //return merged;
              },
              // read(existing) {
              //   return existing && Object.values(existing);
              // },
            },
          },
        },
        Comment: {
          fields: {
            children: {
              merge(_existing, incoming) {
                return incoming;
              },
            },
          },
        },
        User: {
          fields: {
            communities: {
              merge(_existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
  });

export const withApollo = createWithApollo(createClient);
