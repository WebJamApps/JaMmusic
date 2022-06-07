import { createContext, ReactChild } from 'react';
import createPersistedState from 'use-persisted-state';
import type { ISong } from './Data.provider';

export interface Ieditor {
  isValid: boolean; hasChanged: boolean; song: ISong; gig:
  Record<string, unknown>; image: Record<string, unknown>;
}

const useEditorState: (arg0: Ieditor) =>
[Ieditor, (arg0: Ieditor) => void] =
  createPersistedState('editor', sessionStorage);

export const defaultSong: ISong = { category: '', year: 2021, title: '', url: '', _id: '' };

const initEditor: Ieditor = { isValid: false, hasChanged: false, song: defaultSong, gig: {}, image: {} };

export const EditorContext = createContext({
  editor: initEditor,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setEditor:/*istanbul ignore next*/(_arg0: Ieditor) => { },
});

type Props = { children: ReactChild };
export const EditorProvider = ({ children }: Props): JSX.Element => {
  const { Provider } = EditorContext;
  const [editor, setEditor] = useEditorState(initEditor);
  return (<Provider value={{ editor, setEditor }}>{children}</Provider>
  );
};

