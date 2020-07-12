
import React from 'react';

export function SortContainer(): JSX.Element {
  const dice = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6));
  const sorted = [...dice].sort();
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const withNoDigits = randomString.replace(/[0-9]/g, '');
  return (
    <div
      id="sort-container"
      style={{
        margin: 'auto', textAlign: 'center',
      }}
    >
      <h4>Typescript Sorting Example</h4>
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
        <strong>{withNoDigits}</strong>
        <br />
        This is the sorted string:
        {' '}
        <strong>{withNoDigits.split('').sort().join('')}</strong>
      </p>
    </div>
  );
}

export default SortContainer;
