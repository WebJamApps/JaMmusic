import { createContext, ReactChild } from 'react';
import createPersistedState from 'use-persisted-state';
import type { ISong } from './Data.provider';

export interface Iauth {
  isAuthenticated: boolean,
  error: string,
  token: string,
  user: {
    userType: string;
    email: string,
  };
}

const useAuthState: (arg0: Iauth) =>
[Iauth, (arg0: Iauth) => void] = createPersistedState('auth', localStorage);

export const defaultAuth: Iauth = {
  isAuthenticated: false,
  error: '',
  token: '',
  user: {
    userType: '',
    email: '',
  },
};

const initEditor: Ieditor = {
  isValid: false, hasChanged: false, song: defaultSong, tour: {}, image: {},
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setEditorDef = (_arg0: Ieditor) => {};

export const EditorContext = createContext({
  editor: initEditor,
  setEditor: setEditorDef,
});

type Props = { children: ReactChild };
export function EditorProvider({ children }: Props): JSX.Element {
  const { Provider } = EditorContext;
  const [editor, setEditor] = useEditorState(initEditor);
  return (<Provider value={{ editor, setEditor }}>{children}</Provider>
  );
}

