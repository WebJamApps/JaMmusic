import React, {
  createContext, ReactChild,
} from 'react';
import createPersistedState from 'use-persisted-state';
import type { ISong } from './Songs.provider';
// import fetchSongs, { defaultSong } from './fetchSongs';
const useEditorState = createPersistedState('editor', sessionStorage);
// export interface ISong {
//   artist?: string;
//   composer?: string;
//   category: string;
//   album?: string;
//   year: number;
//   image?: string;
//   title: string;
//   url: string;
//   _id: string;
//   modify?:JSX.Element
// }

///const setEditor = ()=>{};

const song:ISong = { category:'', year:2021, title:'', url:'', _id:'' };

export const EditorContext = createContext({
  editor: { song, tour:{}, image:{} },
  setNewEditor:()=>{},
});
type Props = { children: ReactChild };

export const EditorProvider = ({ children }: Props): JSX.Element => {
  const { Provider } = EditorContext;
  const [editor, setEditor] = useEditorState({ song, tour:{}, image:{} });
  const setNewEditor:any = setEditor;
  return (<Provider value={{ editor, setNewEditor }}>{children}</Provider>
  );
};

export default EditorProvider;
