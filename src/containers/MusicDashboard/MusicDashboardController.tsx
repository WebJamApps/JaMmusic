
import Superagent from 'superagent';
import type { Iauth } from 'src/providers/Auth.provider';
import type { MusicDashboard } from './index';
import Forms from '../../lib/forms';
import SongsTable from '../../components/SongsTable';
import SongEditorUtils from '../../components/SongEditor/songEditorUtils';
import { SongEditor } from '../../components/SongEditor';

export class MusicDashboardController {
  view: MusicDashboard;

  forms = Forms;

  superagent = Superagent;

  songEditorUtils = SongEditorUtils;

  constructor(view: MusicDashboard) {
    this.view = view;
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
  modifySongsSection(auth:Iauth):JSX.Element {
    const { dispatch } = this.view.props;
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

  addPic(auth:Iauth): void {
    const { title, url, showCaption } = this.view.state;
    const { scc } = this.view.props;
    const image = {
      title,
      url,
      comments: showCaption,
      type: 'JaMmusic-music',
    };
    scc.transmit('newImage', { image, token: auth.token });
    window.location.assign('/music');
  }

  deleteData(auth:Iauth, message: string, id?: string): boolean { // eslint-disable-next-line no-restricted-globals
    const result = confirm('Delete, are you sure?'); // eslint-disable-line no-alert
    if (result) {
      const { scc } = this.view.props;
      const data = { id };
      if (scc && auth && id) {
        scc.transmit(message, { data: data.id, token: auth.token });
        window.location.reload();
        return true;
      } return false;
    } return false;
  }

  editPicAPI(auth:Iauth): boolean {
    const { title, url, showCaption } = this.view.state;
    const { editPic, scc } = this.view.props;
    const image = {
      title: title || editPic.title,
      url: url || editPic.url,
      comments: showCaption || editPic.comments,
      type: 'JaMmusic-music',
    };
    if (editPic._id) {
      scc.transmit('editImage', { image, token: auth.token, id: editPic._id });
      window.location.reload();
      return true;
    } return false;
  }

  // TODO this should be a functional component
  // changePicDiv(): JSX.Element {
  //   const { editPic } = this.view.props;
  //   return (
  //     <div
  //       className="material-content elevation3"
  //       style={{ maxWidth: '320px', margin: '30px auto' }}
  //     >
  //       <h5 style={{ marginBottom: 0 }}>
  //         {editPic && editPic._id && editPic._id !== '' ? 'Edit ' : 'Add '}
  //         Pictures
  //       </h5>
  //       <PicEditor comp={this.view} controller={this} editPic={editPic} />
  //     </div>
  //   );
  // }

  // TODO this should be a functional component
  // pictureBlock(auth:Iauth): JSX.Element {
  //   const {
  //     dispatch, showTable, images,
  //   } = this.view.props;
  //   return (
  //     <div className="material-content elevation3" style={{ maxWidth: '9.1in', margin: 'auto' }}>
  //       <h5 style={{ textAlign: 'center', marginBottom: 0 }}>Modify Photo Slideshow</h5>
  //       {this.changePicDiv()}
  //       {showTable ? (
  //         <h4 style={{ textAlign: 'center' }}>
  //           All Images
  //           <PhotoTable auth={auth} dispatch={dispatch} images={images} controller={this} />
  //         </h4>
  //       ) : null}
  //     </div>
  //   );
  // }

  songBlock(auth:Iauth): JSX.Element {
    return (
      <div className="Song-Block">
        <p>&nbsp;</p>
        <SongEditor auth={auth} />
        <p>&nbsp;</p>
        {this.modifySongsSection(auth)}
        <p>&nbsp;</p>
      </div>
    );
  }
}
export default MusicDashboardController;
