import React from 'react';
import TourTableProvider from '../../src/providers/TourTable.provider';
import { act } from 'react-dom/test-utils';
import ReactDOM from 'react-dom';

describe('TourTableProvider', () => {
  let container: ReactDOM.Container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('TourTableProvider is defined', ()=>{
    act(() => {ReactDOM.render(<TourTableProvider><div /></TourTableProvider>, container); });
    expect(document.getElementById('play-buttons')).toBeDefined();
  });
});
