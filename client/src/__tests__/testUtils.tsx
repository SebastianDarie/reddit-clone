import { render as defaultRender, RenderResult } from '@testing-library/react';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import { NextRouter } from 'next/router';
import { ChakraProvider } from '@chakra-ui/react';

export * from '@testing-library/react';

type DefaultParams = Parameters<typeof defaultRender>;
type RenderUI = DefaultParams[0];
type RenderOptions = DefaultParams[1] & { router?: Partial<NextRouter> };

export const render = (
  ui: RenderUI,
  { wrapper, router, ...options }: RenderOptions = {}
): RenderResult => {
  if (!wrapper) {
    wrapper = ({ children }) => (
      <RouterContext.Provider value={{ ...mockRouter, ...router }}>
        <ChakraProvider>{children}</ChakraProvider>
      </RouterContext.Provider>
    );
  }

  return defaultRender(ui, { wrapper, ...options });
};

const mockRouter: NextRouter = {
  basePath: '/',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  reload: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  back: jest.fn(() => Promise.resolve(true)),
  beforePopState: jest.fn(() => Promise.resolve(true)),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isReady: true,
};
