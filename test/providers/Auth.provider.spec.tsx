
// import { act } from 'react-dom/test-utils';
// import ReactDOM from 'react-dom';
import {
  // AuthProvider,
  Iauth, defaultSetAuth,
} from 'src/providers/Auth.provider';

describe('AuthProvider', () => {
  let container: ReactDOM.Container;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => { document.body.removeChild(container); });
  // it('EditorProvider is defined', () => {
  //   act(() => { ReactDOM.render(<AuthProvider><div /></AuthProvider>, container); });
  //   expect(document.getElementById('play-buttons')).toBeDefined();
  // });
  it('setAuthDefault', () => {
    expect(defaultSetAuth({} as Iauth)).toBeUndefined();
  });
});
