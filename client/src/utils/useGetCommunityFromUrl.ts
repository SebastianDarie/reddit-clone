import { QueryResult } from '@apollo/client';
import { useRouter } from 'next/router';
import {
  Exact,
  GetCommunityQuery,
  useGetCommunityQuery,
} from '../generated/graphql';

export const useGetCommunityFromUrl = (): QueryResult<
  GetCommunityQuery,
  Exact<{
    name: string;
  }>
> => {
  const router = useRouter();
  const name = typeof router.query.name === 'string' ? router.query.name : '';
  return useGetCommunityQuery({
    skip: name === '',
    variables: {
      name,
    },
  });
};
