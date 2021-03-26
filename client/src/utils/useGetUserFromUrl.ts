import { QueryResult } from '@apollo/client';
import { useRouter } from 'next/router';
import { Exact, UserQuery, useUserQuery } from '../generated/graphql';

export const useGetUserFromUrl = (): QueryResult<
  UserQuery,
  Exact<{
    username: string;
  }>
> => {
  const router = useRouter();
  const username =
    typeof router.query.username === 'string' ? router.query.username : '';
  return useUserQuery({
    skip: username === '',
    variables: {
      username,
    },
  });
};
