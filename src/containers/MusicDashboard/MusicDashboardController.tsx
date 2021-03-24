import React from 'react';
import Superagent from 'superagent';
import type { MusicDashboard } from './index';
import Forms from '../../lib/forms';
import SongsTable from '../../components/SongsTable';
import SongEditorUtils from '../../components/SongEditor/songEditorUtils';
import SongEditor from '../../components/SongEditor';

export class MusicDashboardController {
  view: MusicDashboard;

  forms = Forms;

  superagent = Superagent;

  songEditorUtils = SongEditorUtils;

  constructor(view: MusicDashboard) {
    this.view = view;
    this.changePicDiv = this.changePicDiv.bind(this);
    this.addPic = this.addPic.bind(this);
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
        {/* {this.changeSongDiv()} */}
        <SongEditor controller={this} editSong={this.view.props.editSong} songState={this.view.state.songState} comp={this.view} />
        <p>&nbsp;</p>
        {this.modifySongsSection()}
        <p>&nbsp;</p>
      </div>
    );
  }
}
export default MusicDashboardController;
