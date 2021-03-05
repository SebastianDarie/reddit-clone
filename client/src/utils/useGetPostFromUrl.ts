import { QueryResult } from '@apollo/client';
import { useRouter } from 'next/router';
import { Exact, PostQuery, usePostQuery } from '../generated/graphql';

export const useGetPostFromUrl = (): QueryResult<
  PostQuery,
  Exact<{
    id: number;
  }>
> => {
  const router = useRouter();
  const intId =
    typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  return usePostQuery({
    skip: intId === -1,
    variables: {
      id: intId,
    },
  });
};
