/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { renderMain } from '../src/main';
import { act } from 'react-dom/test-utils';

jest.mock('../src/providers/Songs.provider', () => {
  return function MockedProvider(props: any) {
    return (<div id="mockWrapper"></div>);
  };
});

describe('Main', () => {
  it('renders to the root', () => {
    act(()=>{
      renderMain();
      expect(document.getElementById('mockWrapper')).not.toBe(null);
      expect(document.getElementById('mockWrapper')).toBeDefined();
    });
  });
});
