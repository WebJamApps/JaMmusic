import { SortContainer, TEST_GQL } from 'src/containers/SortContainer';
import renderer from 'react-test-renderer';
import { MockedProvider } from '@apollo/client/testing';

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
});
