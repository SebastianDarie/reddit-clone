//import TestRenderer from 'react-test-renderer';
//import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, cleanup } from '../testUtils';
import Index from '../../pages/index';

// const mocks:
//   | readonly MockedResponse<Record<string, unknown>>[]
//   | undefined = [];

afterEach(cleanup);

describe('Index page', () => {
  it('should match the snapshot', () => {
    const { asFragment } = render(<Index />, {});
    expect(asFragment()).toMatchSnapshot();
    // const component = TestRenderer.create(
    //   <MockedProvider mocks={mocks} addTypename>
    //     <Index />
    //   </MockedProvider>
    // );

    // const tree = component.toJSON();
    // expect(tree.children).toContain('new post by tim');
  });
});
