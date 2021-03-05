import { getPage } from 'next-page-tester';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { screen } from '@testing-library/react';
import renderer from 'react-test-renderer';
//import { cleanup, screen } from '../testUtils';
import Index from '../../pages/index';
import { PostsDocument } from '../../generated/graphql';

describe('Index page', () => {
  it('should match the snapshot', () => {
    const component = renderer.create(
      <MockedProvider addTypename={false}>
        <Index />
      </MockedProvider>
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('use @apollo/client', () => {
  test('render posts', async () => {
    const mocks:
      | readonly MockedResponse<Record<string, unknown>>[]
      | undefined = [
      {
        request: {
          query: PostsDocument,
          variables: {
            limit: 5,
            cursor: null,
          },
        },
        result: {
          data: {
            posts: {
              posts: [
                {
                  id: 237,
                  title: 'new post by tim',
                  text: 'Tim gang',
                  points: 1,
                },
                {
                  id: 236,
                  title: 'new apollo post',
                  text: 'first post with apollo wip',
                  points: 2,
                },
                {
                  id: 235,
                  title: 'jcxkcjb jhbhb hxbjxbchbxcjb',
                  text: 'cbx hxb hj hxb b bjhx bhxb jcb ',
                  points: 0,
                },
                {
                  id: 234,
                  title: 'cjh bjh bx jxchbjhcbjh bch',
                  text: 'bc jkbxcjh bhxc cb',
                  points: 0,
                },
                {
                  id: 233,
                  title: 'jbhbhjbchcsbchbcdhj',
                  text: 'cbsjhcbdhjbschbshcsdjh',
                  points: 0,
                },
              ],
            },
          },
        },
      },
    ];

    const { render } = await getPage({
      route: '/',
      wrapper: {
        Page: (Page) => (pageProps) => {
          return (
            <MockedProvider mocks={mocks}>
              <Page {...pageProps} />
            </MockedProvider>
          );
        },
      },
    });
    render();

    await screen.findByText('new post by tim');
  });
});
