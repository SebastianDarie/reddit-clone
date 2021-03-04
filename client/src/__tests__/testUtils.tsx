import { render, RenderResult } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';

const Providers: React.FC<Record<string, unknown>> = ({ children }) => {
  return <ChakraProvider>{children}</ChakraProvider>;
};

const customRender = (
  ui: React.ReactElement<unknown>,
  options = {}
): RenderResult => render(ui, { wrapper: Providers, ...options });

export * from '@testing-library/react';

export { customRender as render };
