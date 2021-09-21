/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { renderMain } from '../src/main';

jest.mock('../src/providers/Songs.provider', () => function MockedProvider(props: any) {
  return (<div id="mockWrapper" />);
});

describe('Main', () => {
  it('renders to the root', () => {
    act(() => {
      renderMain();
      expect(document.getElementById('mockWrapper')).not.toBe(null);
      expect(document.getElementById('mockWrapper')).toBeDefined();
    });
  });
});
