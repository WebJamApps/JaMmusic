import { SortContainer, SortSection, TEST_GQL } from 'src/containers/SortContainer';
import renderer, { ReactTestRendererJSON } from 'react-test-renderer';
import { MockedProvider } from '@apollo/client/testing';
import { ApolloError } from '@apollo/client';

describe('SortContainer', () => {
  it('renders loading...', () => {
    const mocks = [
      {
        request: {
          query: TEST_GQL,
          variables: {
            name: 'Buck',
          },
        },
        result: {
          data: {
            dog: { id: '1', name: 'Buck', breed: 'bulldog' },
          },
        },
      },
    ];
    const sc:any = renderer.create(<MockedProvider mocks={mocks} addTypename={false}><SortContainer /></MockedProvider>).toJSON();
    expect(sc.children[0]).toBe('Loading...');
  });
  it('renders SortSection when error', () => {
    const props = {
      error: new ApolloError({ graphQLErrors: ['failed' as any] }), data: {}, dice: [], sorted: [], randomString: '', loading: false,
    };
    const ss = renderer.create(<SortSection {...props} />).toJSON() as ReactTestRendererJSON;
    expect(ss.type).toBe('p');
  });
  it('renders SortSection as div', () => {
    const props = {
      error: undefined, data: {}, dice: [], sorted: [], randomString: '', loading: false,
    };
    const ss = renderer.create(<SortSection {...props} />).toJSON() as ReactTestRendererJSON;
    expect(ss.type).toBe('div');
  });
});
