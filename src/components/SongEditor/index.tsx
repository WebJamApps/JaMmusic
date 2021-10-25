import React from 'react';
import forms from '../../lib/forms';
import superagent from 'superagent';
// import type { MusicDashboard } from '../../containers/MusicDashboard';
import songEditorUtils from './songEditorUtils';
import { EditorContext } from '../../providers/Editor.provider';
import type { ISong } from '../../providers/Songs.provider';

export const onChangeSong = (evt: React.ChangeEvent<HTMLInputElement>, editor:any, setNewEditor:any): void => {
  evt.persist();
  const newEditor = { image:{}, tour:{}, song:{ ...editor.song, [evt.target.id]: evt.target.value } };
  // console.log(newEditor.song);
  setNewEditor(newEditor);
};

export const makeInput = (required:boolean, id:string, props:any):JSX.Element=>{
  return (<label htmlFor={id}>
  {required ? '* ' : ''}{id}
  <input id={id} value={props.editor.song[id] || ''} onChange={(evt)=>props.onChangeSong(evt, props.editor, props.setNewEditor)} />
</label>
  );
};

export const MoreSongForm = (props:{ setNewEditor: any, editor:any, onChangeSong: any }):JSX.Element => {
  return (
    <>
    {makeInput(false, 'album', props)}
      {/* <label htmlFor="artist">
        Album
        <input id="album" value={props.editor.song.album || ''} onChange={(evt)=>props.onChangeSong(evt, props.editor, props.setNewEditor)} />
      </label> */}
      {/* <label htmlFor="image">
        Image
        <input id="image" value={props.editor.song.image || ''} onChange={(evt)=>props.onChangeSong(evt, props.editor, props.setNewEditor)} />
      </label> */}
       {makeInput(false, 'image', props)}
       {makeInput(false, 'composer', props)}
      {/* <label htmlFor="composer">
        Composer
        <input id="composer" value={props.editor.song.composer || ''} onChange={(evt)=>props.onChangeSong(evt, props.editor, props.setNewEditor)} />
      </label> */}
      {/* <label htmlFor="year">
        * Year
        <input type="number" id="year" value={props.editor.song.year} 
        onChange={(evt)=>props.onChangeSong(evt, props.editor, props.setNewEditor)} />
      </label> */}
       {makeInput(true, 'year', props)}
    </>
  );
};

// eslint-disable-next-line react/sort-comp
const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>, editor:any, setNewEditor:any):void => {
  // console.log(editor.song);
  setNewEditor({ image:{}, tour:{}, song:{ ...editor.song, category: event.target.value } });
  // this.setState({ songState: { ...songState, category: event.target.value } });
};

export const SongForm = (props:{ forms:any, editor:any, setNewEditor:any, onChangeSong:any,
}):JSX.Element => {
  // console.log(props.songState);
  return (
    <>
      {/* <label htmlFor="title">
        * Title
        <input id="title" value={props.editor.song.title || ''} onChange={(evt)=>props.onChangeSong(evt, props.editor, props.setNewEditor)} />
      </label> */}
          {makeInput(true, 'title', props)}
{/* 
      <label htmlFor="url">
        * Url
        <input id="url" value={props.editor.song.url || ''} onChange={(evt)=>props.onChangeSong(evt, props.editor, props.setNewEditor)} />
      </label> */}
          {makeInput(true, 'url', props)}

      {/* <label htmlFor="artist">
        * Artist
        <input id="artist" value={props.editor.song.artist || ''} onChange={(evt)=>props.onChangeSong(evt, props.editor, props.setNewEditor)} />
      </label> */}
          {makeInput(true, 'artist', props)}

      <p>* Category</p>
      {props.forms.makeDropdown('category', props.editor.song.category || 'original', 
        (evt: React.ChangeEvent<HTMLSelectElement>) => handleCategoryChange(evt, props.editor, props.setNewEditor), ['original', 'mission', 'pub'])}
        <MoreSongForm setNewEditor={props.setNewEditor} editor={props.editor} onChangeSong={props.onChangeSong}/>
    </>
  );
};

export const EditSongButtons = ({ setNewEditor, editor, auth, updateSongAPI }:
{ setNewEditor:any, editor:any, auth:any, updateSongAPI:any }): JSX.Element => {
  return (
    <span>
      <button className="floatRight" type="button" id="cancel-edit-song" onClick={() => setNewEditor({ song:{}, tour:{}, image:{} })}>
        Cancel
      </button>
      <button
        className=""
        id="update-song-button"
        type="button"
        onClick={() => updateSongAPI(superagent, editor.song, auth, setNewEditor)}
      >
        Update
        {' '}
        Song
      </button>
    </span>
  );
};

export const SongButtons = ({ editor, setNewEditor, auth, addSongAPI, updateSongAPI  }:
{ setNewEditor:any, editor:{ song:ISong, tour:any, image:any }, auth:any, addSongAPI:any, updateSongAPI:any }): JSX.Element => {
  return (
  <div style={{ textAlign: 'left', marginTop: '10px' }}>
    <span style={{
      fontSize: '16px', marginRight: '20px', position: 'relative', display: 'inline-block',
    }}
    >
      <i>* Required</i>
    </span>
    {editor.song._id ? <EditSongButtons editor={editor} setNewEditor={setNewEditor} auth={auth} updateSongAPI={updateSongAPI}/> : 
      <button
        id="add-song-button"
        disabled={!(editor.song.year && editor.song.title && editor.song.url && editor.song.artist && editor.song.category)}
        type="button"
        onClick={() => addSongAPI(superagent, editor.song, auth, setNewEditor)}
      >
        Add Song
      </button>
      }
  </div>
  );
};

export const SongFormTitle = ({ editor }:{ editor:any }):JSX.Element=>{
  return (
    <h5 style={{ marginBottom: 0 }}>
    {editor.song && editor.song._id && editor.song._id !== '' ? 'Edit ' : 'Add '}
      Song
    </h5>
  );
};

export const SongEditor = ({
  auth,
}:{ auth:any }): JSX.Element => {
  const { editor, setNewEditor } = React.useContext(EditorContext);
  return (
  <div
    className="material-content elevation3"
    style={{ maxWidth: '320px', margin: '30px auto' }}
  >
    <SongFormTitle editor={editor}/>
    <form id="picsForm">
      <SongForm forms={forms} editor={editor} setNewEditor={setNewEditor} 
      onChangeSong={onChangeSong}
      />
      <p>{' '}</p>
      <SongButtons editor={editor} setNewEditor={setNewEditor} auth={auth} addSongAPI={songEditorUtils.addSongAPI} 
      updateSongAPI={songEditorUtils.updateSongAPI}/>
    </form>
  </div>
  );
};
