import {
  ChakraProvider,
  cookieStorageManager,
  localStorageManager,
} from '@chakra-ui/react';
import http from 'http';

interface ChakraProps {
  cookies: string;
  children: React.ReactNode;
}

export function Chakra({ cookies, children }: ChakraProps): JSX.Element {
  const colorModeManager =
    typeof cookies === 'string'
      ? cookieStorageManager(cookies)
      : localStorageManager;

  return (
    <ChakraProvider colorModeManager={colorModeManager}>
      {children}
    </ChakraProvider>
  );
}

interface ServerSideProps {
  req: http.IncomingMessage;
}

export function getServerSideProps({
  req,
}: ServerSideProps): { props: { cookies: string } } {
  return {
    props: {
      cookies: req.headers.cookie ?? '',
    },
  };
}
