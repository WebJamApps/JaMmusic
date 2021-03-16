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
    this.editButton = this.editButton.bind(this);
    this.superagent = superagent;
    this.modifySongsSection = this.modifySongsSection.bind(this);
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
        <SongsTable token={auth.token} dispatch={dispatch} setState/>
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
  
   async updateSong(): Promise<string> {
    const { editSong } = this.view.state;
    const { auth } = this.view.props;
    const newSong = { ...editSong, _id:undefined };
    let r: superagent.Response;
    try {
      r = await this.superagent.put(`${process.env.BackendUrl}/song/${editSong._id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(newSong);
    } catch (e) { return `${e.message}`; }
    if (r.status === 200) { window.location.reload(); return 'song edited'; }
    return `${r.status} song was not edited`;
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
  editButton():null {
    // const { editTour } = this.props;
    // eslint-disable-next-line no-lone-blocks
    { /* {editTour._id ? (
          <button className="floatRight" type="button" id="cancel-edit-pic" onClick={this.resetEditForm}>
            Cancel
          </button>
        ) : null} */ }
    // eslint-disable-next-line no-lone-blocks
    { /* <button
          className="floatRight"
          disabled={this.validateForm()}
          type="button"
          onClick={editTour._id ? this.editTourAPI : this.createTour}
        >
          {editTour._id ? 'Edit' : 'Create'}
          {' '}
          Tour
        </button> */ }
    return null;
  }

  addSongButton(): JSX.Element {
    const { songState } = this.view.state;
    return (
      <div style={{ textAlign: 'left', marginTop: '10px', maxWidth: '85%' }}>
        <span style={{
          fontSize: '16px', marginRight: '20px', position: 'relative', display: 'inline-block',
        }}
        >
          <i>* Required</i>
        </span>
        {this.editButton()}
        <button
          disabled={!(songState.year && songState.title && songState.url && songState.artist && songState.category)}
          type="button"
          onClick={this.addSong}
        >
          Add Song
        </button>
      </div>
    );
  }

  editSongButton(): JSX.Element {
    const { songState } = this.view.state;
    return (
      <div style={{ textAlign: 'left', marginTop: '10px', maxWidth: '85%' }}>
        <span style={{
          fontSize: '16px', marginRight: '20px', position: 'relative', display: 'inline-block',
        }}
        >
          <i>* Required</i>
        </span>
        <button
          style={{ position: 'relative',display:'inline-block'}}
          type="button"
          onClick={()=> this.view.setState({editSong:{ _id:'', category:'', year:2020, title:'', url:'' }})}
        >
          Cancel
        </button>
        <button
          disabled={!(songState.year && songState.title && songState.url && songState.artist && songState.category)}
          style={{ position: 'relative',display:'inline-block'}}
          type="button"
          onClick={this.updateSong}
        >
          Edit Song
        </button>
      </div>
    );
  }

  changeSongDiv(): JSX.Element {
    const { songState, editSong } = this.view.state;
    return (
      <div
        className="material-content elevation3"
        style={{ maxWidth: '320px', margin: '30px auto' }}
      >
        <h5 style={{ marginBottom: 0 }}>
          {editSong && editSong._id ? 'Edit ' : 'Add '}
          Song
        </h5>
        <form id="picsForm">
          {this.songForm(songState)}
          {this.moreSongForm(songState)}
          <p>{' '}</p>
          {editSong && editSong._id ? this.editSongButton():this.addSongButton()}
        </form>
      </div>
    );
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
