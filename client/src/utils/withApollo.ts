import { ApolloClient, InMemoryCache } from '@apollo/client';
import { NextPageContext } from 'next';
import { withApollo as createWithApollo } from 'next-apollo';
import { PaginatedPosts } from '../generated/graphql';

const createClient = (ctx: NextPageContext | undefined) =>
  new ApolloClient({
    ssrMode: typeof window === 'undefined',
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
              keyArgs: [],
              merge(
                existing: PaginatedPosts | undefined,
                incoming: PaginatedPosts
              ): PaginatedPosts {
                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts],
                };
              },
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
      },
    }),
  });

export const withApollo = createWithApollo(createClient);
