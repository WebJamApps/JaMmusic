import { gql, useQuery } from '@apollo/client';

function makeRandomString(): string {
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const withNoDigits = randomString.replace(/[0-9]/g, 'X');
  return withNoDigits;
}

export const TEST_GQL = gql`
  query Gqldocs {
    gqldocs {
      title
      author
    }
  }
`;
export function SortContainer(): JSX.Element {
  const { loading, error, data } = useQuery(TEST_GQL);
  const dice = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6));
  const sorted = [...dice].sort();
  const randomString = makeRandomString();
  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <p>
        Error :
        {' '}
        {error.message}
      </p>
    );
  }
  return (
    <div id="sort-container" style={{ margin: 'auto', textAlign: 'center' }}>
      <h4>Sorting Example</h4>
      <p style={{ textAlign: 'left', marginLeft: '10px' }}>
        Given this random number array:
        {' '}
        <strong>{dice}</strong>
        <br />
        This is the sorted array:
        {' '}
        <strong>{sorted}</strong>
        <br />
        <br />
        Given this random string of letters:
        {' '}
        <strong>{randomString}</strong>
        <br />
        This is the sorted string:
        {' '}
        <strong>
          {randomString.split('').sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })).join('')}
        </strong>
      </p>
      <p>{JSON.stringify(data)}</p>
    </div>
  );
}

