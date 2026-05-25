import { vi } from 'vitest';
import { SortContainer, SortSection, TEST_GQL } from 'src/containers/SortContainer';
import { render, screen } from '@testing-library/react';
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
    render(<MockedProvider mocks={mocks} addTypename={false}><SortContainer /></MockedProvider>);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
  it('renders SortSection when error', () => {
    const props = {
      error: new ApolloError({ graphQLErrors: ['failed' as any] }), data: {}, dice: [], sorted: [], randomString: '', loading: false,
    };
    render(<SortSection {...props} />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
  it('renders SortSection as div', () => {
    const props = {
      error: undefined, data: {}, dice: [], sorted: [], randomString: '', loading: false,
    };
    render(<SortSection {...props} />);
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
