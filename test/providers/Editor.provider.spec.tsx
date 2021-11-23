import React from 'react';
import { act } from 'react-dom/test-utils';
import ReactDOM from 'react-dom';
import { EditorProvider } from '../../src/providers/Editor.provider';

describe('EditorProvider', () => {
  let container: ReactDOM.Container;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => { document.body.removeChild(container); });
  it('EditorProvider is defined', () => {
    act(() => { ReactDOM.render(<EditorProvider><div /></EditorProvider>, container); });
    expect(document.getElementById('play-buttons')).toBeDefined();
  });
});
