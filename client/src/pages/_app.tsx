import { memo, MemoExoticComponent, useEffect, useRef } from 'react';
import { NextComponentType, NextPageContext } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';
import { Chakra } from '../components/Chakra';

interface memoizedComponents {
  component: JSX.Element;
  scrollPos: number;
  asPath: string;
}

const ROUTES_TO_RETAIN = ['/r/[name]', '/user'];

// as keyof memoizedComponents
// as keyof memoizedComponents
// as keyof memoizedComponents
// as keyof memoizedComponents

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  // const router = useRouter();
  // const retainedComponents = useRef<memoizedComponents>({});

  // const isRetainableRoute = ROUTES_TO_RETAIN?.includes(router.asPath);

  // if (
  //   isRetainableRoute &&
  //   !retainedComponents.current[router.asPath]
  // ) {
  //   const MemoComponent = memo(Component);
  //   retainedComponents.current[router.asPath] = {
  //     component: <MemoComponent {...pageProps} />,
  //     scrollPos: 0,
  //   };
  // }

  // const handleRouteChangeStart = (_url: string) => {
  //   if (isRetainableRoute) {
  //     retainedComponents.current[
  //       router.asPath
  //     ].scrollPos = window.scrollY;
  //   }
  // };

  // useEffect(() => {
  //   router.events.on('routeChangeStart', handleRouteChangeStart);

  //   return () => {
  //     router.events.off('routeChangeStart', handleRouteChangeStart);
  //   };
  // }, [router.asPath]);

  // useEffect(() => {
  //   if (isRetainableRoute) {
  //     window.scrollTo(
  //       0,
  //       retainedComponents.current[router.asPath]
  //         .scrollPos
  //     );
  //   }
  // }, [Component, pageProps]);
  // console.log(isRetainableRoute, ROUTES_TO_RETAIN, router.asPath);

  return (
    <Chakra cookies={pageProps.cookies}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no, user-scalable=0"
        />
        <title>reddit: the front page of the internet</title>
      </Head>
      {/* <Box d={isRetainableRoute ? 'block' : 'none'}>
        {Object.entries(retainedComponents.current).map(([path, c]) => {
          <Box key={path} d={router.asPath === path ? 'block' : 'none'}>
            {c.component}
          </Box>;
        })}
      </Box>
      {!isRetainableRoute && <Component {...pageProps} />} */}
      <Component {...pageProps} />
    </Chakra>
  );
};

export { getServerSideProps } from '../components/Chakra';

export default MyApp;
