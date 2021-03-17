import React from 'react';
import superagent from 'superagent';
import type { ISong } from '../../providers/Songs.provider';
import type { MusicDashboard } from './index';
import forms from '../../lib/forms';
import SongsTable from './SongsTable';

export class MusicDashboardController {
  view: MusicDashboard;

  forms: typeof forms;

  superagent: typeof superagent;

  constructor(view: MusicDashboard) {
    this.view = view;
    this.forms = forms;
    this.changePicDiv = this.changePicDiv.bind(this);
    this.addPic = this.addPic.bind(this);
    this.addSong = this.addSong.bind(this);
    this.editSongButtons = this.editSongButtons.bind(this);
    this.superagent = superagent;
    this.modifySongsSection = this.modifySongsSection.bind(this);
    this.updateSongAPI = this.updateSongAPI.bind(this);
    this.resetSongForm = this.resetSongForm.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  modifySongsSection():JSX.Element {
    const { auth, dispatch } = this.view.props;
    return (
      <div
        className="search-table-outer"
        style={{
          maxWidth: '96%', margin: 'auto', zIndex: 0,
        }}
      >
        <h5 style={{ textAlign: 'center', marginBottom: '3px' }}>Modify Songs</h5>
        <SongsTable token={auth.token} dispatch={dispatch} />
      </div>
    );
  }

  addPic(): void {
    const { picTitle, picUrl } = this.view.state;
    const { scc, auth } = this.view.props;
    const image = { title: picTitle, url: picUrl, type: 'JaMmusic-music' };
    scc.transmit('newImage', { image, token: auth.token });
    window.location.assign('/music');
  }

  async addSong(): Promise<string> {
    const { songState } = this.view.state;
    const { auth } = this.view.props;
    const newSong = { ...songState, _id: undefined };
    let r: superagent.Response;
    try {
      r = await this.superagent.post(`${process.env.BackendUrl}/song`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(newSong);
    } catch (e) { return `${e.message}`; }
    if (r.status === 201) { window.location.reload(); return 'song created'; }
    return `${r.status} song was not created`;
  }

  async updateSongAPI(): Promise<string> {
    const { songState } = this.view.state;
    const { editSong } = this.view.props;
    const { auth } = this.view.props;
    const songChanges = { ...songState, _id: undefined };
    let r: superagent.Response;
    try {
      r = await this.superagent.put(`${process.env.BackendUrl}/song/${editSong._id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(songChanges);
    } catch (e) { return `${e.message}`; }
    if (r.status === 200) { window.location.reload(); return 'song updated'; }
    return `${r.status} song was not updated`;
  }

  changePicDiv(): JSX.Element {
    let { editPic } = this.view.props;
    const { picTitle, picUrl } = this.view.state;
    if (!editPic) editPic = { title: '', url: '', type: '' };
    return (
      <div
        className="material-content elevation3"
        style={{ maxWidth: '320px', margin: '30px auto' }}
      >
        <h5 style={{ marginBottom: 0 }}>
          {editPic && editPic._id ? 'Edit ' : 'Add '}
          Pictures
        </h5>
        <form id="picsForm">
          <label htmlFor="picTitle">
            Picture Title
            <input id="picTitle" placeholder={editPic.title} value={picTitle} onChange={this.view.onChange} />
          </label>
          <label htmlFor="picUrl">
            Image Address
            <input id="picUrl" placeholder={editPic.url} value={picUrl} onChange={this.view.onChange} />
          </label>
          <p>{' '}</p>
          <button disabled={!(picTitle && picUrl)} type="button" onClick={this.addPic}>Add Picture</button>
        </form>
      </div>
    );
  }

  songForm(songState: ISong):JSX.Element {
    return (
      <>
        <label htmlFor="title">
          * Title
          <input id="title" value={songState.title} onChange={this.view.onChangeSong} />
        </label>
        <label htmlFor="url">
          * Url
          <input id="url" value={songState.url} onChange={this.view.onChangeSong} />
        </label>
        <label htmlFor="artist">
          * Artist
          <input id="artist" value={songState.artist} onChange={this.view.onChangeSong} />
        </label>
        <p>* Category</p>
        {this.forms.makeDropdown('category', songState.category, this.view.handleCategoryChange, ['original', 'mission', 'pub'])}
      </>
    );
  }

  moreSongForm(songState: ISong):JSX.Element {
    return (
      <>
        <label htmlFor="artist">
          Album
          <input id="album" value={songState.album} onChange={this.view.onChangeSong} />
        </label>
        <label htmlFor="image">
          Image
          <input id="image" value={songState.image} onChange={this.view.onChangeSong} />
        </label>
        <label htmlFor="composer">
          Composer
          <input id="composer" value={songState.composer} onChange={this.view.onChangeSong} />
        </label>
        <label htmlFor="year">
          * Year
          <input type="number" id="year" value={songState.year} onChange={this.view.onChangeSong} />
        </label>
      </>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  editSongButtons(editSong: ISong):JSX.Element | null {
    return (editSong._id !== '' ? (
      <span>
        <button className="floatRight" type="button" id="cancel-edit-song" onClick={this.resetSongForm}>
          Cancel
        </button>
        <button
          className=""
          type="button"
          onClick={this.updateSongAPI}
        >
          Edit
          {' '}
          Song
        </button>
      </span>
    ) : null);
  }

  songButtons(editSong: ISong): JSX.Element {
    const { songState } = this.view.state;
    return (
      <div style={{ textAlign: 'left', marginTop: '10px' }}>
        <span style={{
          fontSize: '16px', marginRight: '20px', position: 'relative', display: 'inline-block',
        }}
        >
          <i>* Required</i>
        </span>
        {this.editSongButtons(editSong)}
        {editSong._id === '' ? (
          <button
            disabled={!(songState.year && songState.title && songState.url && songState.artist && songState.category)}
            type="button"
            onClick={this.addSong}
          >
            Add Song
          </button>
        ) : null}
      </div>
    );
  }

  changeSongDiv(): JSX.Element {
    let { editSong } = this.view.props;
    const { songState } = this.view.state;
    if (!editSong) {
      editSong = {
        title: '', url: '', artist: '', category: 'original', _id: '', year: 2021,
      };
    }
    return (
      <div
        className="material-content elevation3"
        style={{ maxWidth: '320px', margin: '30px auto' }}
      >
        <h5 style={{ marginBottom: 0 }}>
          {editSong && editSong._id !== '' ? 'Edit ' : 'Add '}
          Song
        </h5>
        <form id="picsForm">
          {this.songForm(songState)}
          {this.moreSongForm(songState)}
          <p>{' '}</p>
          {this.songButtons(editSong)}
        </form>
      </div>
    );
  }

  resetSongForm():void {
    const { dispatch } = this.view.props;
    dispatch({
      type: 'EDIT_SONG',
      songData: {
        _id: '', category: '', year: 2021, title: '', url: '',
      },
    });
    this.view.setState({
      songState: {
        _id: '', category: '', year: 2021, title: '', url: '',
      },
    });
    window.location.reload();
  }

  pictureBlock(): JSX.Element {
    return (
      <div className="material-content elevation3" style={{ maxWidth: '9.1in', margin: 'auto' }}>
        <h5 style={{ textAlign: 'center', marginBottom: 0 }}>Modify Photo Slideshow</h5>
        {this.changePicDiv()}
      </div>
    );
  }

  songBlock(): JSX.Element {
    return (
      <div className="Song-Block">
        <p>&nbsp;</p>
        {this.changeSongDiv()}
        <p>&nbsp;</p>
        {this.modifySongsSection()}
        <p>&nbsp;</p>
      </div>
    );
  }
}
export default MusicDashboardController;
