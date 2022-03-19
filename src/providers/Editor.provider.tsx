import { createContext, ReactChild } from 'react';
import createPersistedState from 'use-persisted-state';
import type { ISong } from './Data.provider';

type InitEditor = { song: ISong; tour: Record<string, unknown>; image: Record<string, unknown>; };

const useEditorState: (arg0: InitEditor) =>
[InitEditor, (arg0: InitEditor) => void] =
  createPersistedState('editor', sessionStorage);

const song: ISong = { category: '', year: 2021, title: '', url: '', _id: '' };

const initEditor:InitEditor = { song, tour: {}, image: {} };

export const EditorContext = createContext({
  editor: initEditor,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setEditor:/*istanbul ignore next*/(_arg0: InitEditor) => { },
});

type Props = { children: ReactChild };
export const EditorProvider = ({ children }: Props): JSX.Element => {
  const { Provider } = EditorContext;
  const [editor, setEditor] = useEditorState(initEditor);
  return (<Provider value={{ editor, setEditor }}>{children}</Provider>
  );
};

