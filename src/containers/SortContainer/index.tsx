
function makeRandomString(): string {
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const withNoDigits = randomString.replace(/[0-9]/g, 'X');
  return withNoDigits;
}
export function SortContainer(): JSX.Element {
  const dice = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6));
  const sorted = [...dice].sort();
  const randomString = makeRandomString();
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
    </div>
  );
}

