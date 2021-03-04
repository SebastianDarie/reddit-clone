import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import theme from '../theme';

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no, user-scalable=0"
        />
        <title>reddit: the front page of the internet</title>
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  );
};

export default MyApp;
