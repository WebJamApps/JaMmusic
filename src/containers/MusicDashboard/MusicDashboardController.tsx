import React from 'react';
import Superagent from 'superagent';
import type { MusicDashboard } from './index';
import Forms from '../../lib/forms';
import SongsTable from '../../components/SongsTable';
import SongEditorUtils from '../../components/SongEditor/songEditorUtils';
import SongEditor from '../../components/SongEditor';
import { PicEditor } from '../../components/PicEditor';

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
    const { picTitle, picUrl, showCaption } = this.view.state;
    const { scc, auth } = this.view.props;
    const image = {
      title: picTitle,
      url: picUrl,
      caption: showCaption,
      type: 'JaMmusic-music',
    };
    scc.transmit('newImage', { image, token: auth.token });
    window.location.assign('/music');
  }

  changePicDiv(): JSX.Element {
    let { editPic } = this.view.props;
    const { picTitle, picUrl, showCaption } = this.view.state;
    if (!editPic) {
      editPic = {
        title: '',
        url: '',
        type: '',
        caption: '',
      };
    }
    return (
      <div
        className="material-content elevation3"
        style={{ maxWidth: '320px', margin: '30px auto' }}
      >
        <h5 style={{ marginBottom: 0 }}>
          {editPic && editPic._id ? 'Edit ' : 'Add '}
          Pictures
        </h5>
        <PicEditor comp={this.view} controller={this} editPic={editPic} />
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
