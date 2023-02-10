import { render } from '@testing-library/react';

import {
  Iauth, defaultSetAuth, AuthProvider,
} from 'src/providers/Auth.provider';

describe('AuthProvider', () => {
  it('AuthProvider renders', () => {
    render(<AuthProvider />);
    const newRoot = document.getElementById('root') as HTMLElement;
    expect(newRoot.innerHTML.includes('play-buttons')).toBe(true);
  });
  it('setAuthDefault', () => {
    expect(defaultSetAuth({} as Iauth)).toBeUndefined();
  });
});
