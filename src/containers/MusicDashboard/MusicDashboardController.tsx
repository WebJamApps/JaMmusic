// import superagent from 'superagent';
import React from 'react';
// import { Editor } from '@tinymce/tinymce-react';
// import fetch from '../../lib/fetch';
import type { MusicDashboard } from './index';

export class MusicDashboardController {
  view: MusicDashboard;

  // fetch: typeof fetch;

  // superagent: superagent.SuperAgentStatic;

  constructor(view: MusicDashboard) {
    // this.fetch = fetch;
    this.view = view;
    // this.superagent = superagent;
    this.changePicDiv = this.changePicDiv.bind(this);
    // this.deleteBookApi = this.deleteBookApi.bind(this);
    // this.createHomeAPI = this.createHomeAPI.bind(this);
    // this.createPicApi = this.createPicApi.bind(this);
    // this.addForumAPI = this.addForumAPI.bind(this);
    // this.editPicAPI = this.editPicAPI.bind(this);
    // this.editor = this.editor.bind(this);
    // this.handleEditorChange = this.handleEditorChange.bind(this);
    // this.addForumButton = this.addForumButton.bind(this);
    // this.createBook = this.createBook.bind(this);
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
        <h5>
          {editPic && editPic._id ? 'Edit ' : 'Add '}
          Pictures
        </h5>
        <form id="picsForm">
          <label htmlFor="youthName">
            Picture Title
            <input id="youthName" placeholder={editPic.title} value={picTitle} onChange={this.view.onChange} />
          </label>
          <label htmlFor="youthURL">
            Image Address
            <input id="youthURL" placeholder={editPic.url} value={picUrl} onChange={this.view.onChange} />
          </label>
          <p>Buttons Here</p>
        </form>
      </div>
    );
  }
}
export default MusicDashboardController;
