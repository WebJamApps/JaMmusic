import { createContext, ReactChild } from 'react';
import createPersistedState from 'use-persisted-state';
import type { ISong } from './Songs.provider';

type Props = { children: ReactChild };
const useEditorState:any = createPersistedState('editor', sessionStorage);

//TODO determine best way to type this useSongsState here (without an any)
const song:ISong = { category:'', year:2021, title:'', url:'', _id:'' };

const initEditor = { song, tour:{}, image:{} };

export const EditorContext = createContext({
  editor: initEditor,
  setNewEditor:/*istanbul ignore next*/(...args:any) => {},
});

export const EditorProvider = ({ children }: Props): JSX.Element => {
  const { Provider } = EditorContext;
  const [editor, setEditor] = useEditorState({ song, tour:{}, image:{} });
  const setNewEditor = setEditor;
  return (<Provider value={{ editor, setNewEditor }}>{children}</Provider>
  );
};

