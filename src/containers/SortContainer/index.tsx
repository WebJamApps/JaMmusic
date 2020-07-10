
import React from 'react';

export function SortContainer(): JSX.Element {
  const dice = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6));
  const sorted = [...dice].sort();
  return (
    <div
      id="sort-container"
      style={{
        margin: 'auto', textAlign: 'center',
      }}
    >
      <h4>Typescript Sorting Example</h4>
      <p style={{ textAlign: 'left', paddingLeft: '20px' }}>
        Given this array:
        {' '}
        <strong>{dice}</strong>
        <br />
        This is the sorted array:
        {' '}
        <strong>{sorted}</strong>
      </p>
    </div>
  );
}

export default SortContainer;
