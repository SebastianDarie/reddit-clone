import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useMeQuery } from '../generated/graphql';

export const useIsAuth = (): void => {
  const { data, loading } = useMeQuery({
    variables: { skipCommunities: true },
  });
  const router = useRouter();
  useEffect(() => {
    if (!loading && !data?.me) {
      router.replace('/login?next=' + router.pathname);
    }
  }, [loading, data, router]);
};
