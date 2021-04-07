import { AppProps } from 'next/app';
import Head from 'next/head';
import { Chakra } from '../components/Chakra';

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <Chakra cookies={pageProps.cookies}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no, user-scalable=0"
        />
        <title>reddit: the front page of the internet</title>
      </Head>

      <Component {...pageProps} />
    </Chakra>
  );
};

export { getServerSideProps } from '../components/Chakra';

export default MyApp;
