import React from 'react';
import Superagent from 'superagent';
import type { MusicDashboard } from './index';
import Forms from '../../lib/forms';
import SongsTable from '../../components/SongsTable';
import SongEditorUtils from '../../components/SongEditor/songEditorUtils';
import SongEditor from '../../components/SongEditor';
import PTable from '../../components/PhotoTable/PhotoTable';
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
    this.editPicAPI = this.editPicAPI.bind(this);
    this.onChangePic = this.onChangePic.bind(this);
    this.checkPicEdit = this.checkPicEdit.bind(this);
    this.resetEditPic = this.resetEditPic.bind(this);
  }

  checkPicEdit(): void {
    let {
      title, url,
    } = this.view.state;
    const { editPic, dispatch } = this.view.props;
    if (title === '' && editPic.title !== undefined) { title = editPic.title; }
    if (url === '' && editPic.url !== undefined) { url = editPic.url; }
    this.view.setState({
      title, url,
    });
    if (editPic.title !== undefined && editPic.url !== undefined) {
      dispatch({ type: 'EDIT_PIC', data: { _id: editPic._id } });
    }
  }

  onChangePic(evt: React.ChangeEvent<HTMLInputElement>): void {
    evt.persist();
    const { editPic } = this.view.props;
    if (editPic.title !== undefined && editPic.url !== undefined) this.checkPicEdit();
    this.view.setState((prevState) => ({ ...prevState, [evt.target.id]: evt.target.value }));
  }

  resetEditPic(evt: React.MouseEvent | null): void {
    if (evt) evt.preventDefault();
    const { dispatch } = this.view.props;
    dispatch({ type: 'EDIT_PIC', data: {} });
    this.view.setState({
      title: '', url: '',
    });
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
    const { title, url, showCaption } = this.view.state;
    const { scc, auth } = this.view.props;
    const image = {
      title,
      url,
      comments: showCaption,
      type: 'JaMmusic-music',
    };
    scc.transmit('newImage', { image, token: auth.token });
    window.location.assign('/music');
  }

  deleteData(id: string, message: string): boolean { // eslint-disable-next-line no-restricted-globals
    const result = confirm('Delete, are you sure?'); // eslint-disable-line no-alert
    if (result) {
      const { scc, auth } = this.view.props;
      const data = { id };
      if (scc && auth && id) {
        scc.transmit(message, { data: data.id, token: auth.token });
        window.location.assign('/music');
        return true;
      } return false;
    } return false;
  }

  editPicAPI(): boolean {
    const { title, url, showCaption } = this.view.state;
    const { editPic, scc, auth } = this.view.props;
    const image = {
      title,
      url,
      comments: showCaption,
      type: 'JaMmusic-music',
    };
    if (title && url && editPic._id) {
      scc.transmit('editImage', { image, token: auth.token, id: editPic._id });
      window.location.assign('/music');
      return true;
    } return false;
  }

  changePicDiv(): JSX.Element {
    const { editPic } = this.view.props;
    return (
      <div
        className="material-content elevation3"
        style={{ maxWidth: '320px', margin: '30px auto' }}
      >
        <h5 style={{ marginBottom: 0 }}>
          {editPic && editPic._id && editPic._id !== '' ? 'Edit ' : 'Add '}
          Pictures
        </h5>
        <PicEditor comp={this.view} controller={this} editPic={editPic} />
      </div>
    );
  }

  pictureBlock(): JSX.Element {
    const {
      dispatch, auth, showTable, images,
    } = this.view.props;
    return (
      <div className="material-content elevation3" style={{ maxWidth: '9.1in', margin: 'auto' }}>
        <h5 style={{ textAlign: 'center', marginBottom: 0 }}>Modify Photo Slideshow</h5>
        {this.changePicDiv()}
        {showTable ? (
          <h4 style={{ textAlign: 'center' }}>
            All Images
            <PTable auth={auth} dispatch={dispatch} images={images} controller={this} />
          </h4>
        ) : null}
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
