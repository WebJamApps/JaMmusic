import React from 'react';
import type { MusicDashboard } from './index';

export class MusicDashboardController {
  view: MusicDashboard;

  constructor(view: MusicDashboard) {
    this.view = view;
    this.changePicDiv = this.changePicDiv.bind(this);
    this.addPic = this.addPic.bind(this);
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
}
export default MusicDashboardController;
