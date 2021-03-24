import { ApolloClient, InMemoryCache } from '@apollo/client';
import { NextPageContext } from 'next';
import { withApollo as createWithApollo } from 'next-apollo';
import { Comment, CommentsPost, PaginatedPosts } from '../generated/graphql';

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
            // post: {
            //   keyArgs: [],
            //   merge: true,
            // merge(
            //   existing: CommentsPost | undefined,
            //   incoming: CommentsPost
            // ): CommentsPost {
            //   console.log(existing, incoming);
            // return {
            //   ...incoming,
            //   comments: [
            //     ...(existing?.comments.filter((staleData) => {
            //       return incoming.comments.some((freshData) => {
            //         return staleData.id === freshData.id;
            //       });
            //     }) || []),
            //   ],
            // };
            //   return {
            //     ...incoming,
            //     comments: [...incoming.comments],
            //   };
            // },
            // },
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
