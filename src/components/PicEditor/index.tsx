import React from 'react';
import type { MusicDashboard } from '../../containers/MusicDashboard';
import type { MusicDashboardController } from '../../containers/MusicDashboard/MusicDashboardController';

export interface IeditPic {
  _id?: string;
  title?: string;
  url?: string;
}

type PageProps = {
  comp: MusicDashboard,
  controller: MusicDashboardController,
  editPic: IeditPic,
};

const radioButtons = (comp:MusicDashboard, editPic:any): JSX.Element => (
  <div id="radio-buttons" style={{ marginBottom:'10px' }}>
    <label htmlFor="showCaption" style={{ display: 'inline', padding: '10px', paddingLeft:'0px' }}>
      Show Caption
      <input
        type="radio"
        name="show-caption"
        id="showCaption"
        value="showCaption"
        checked={(!editPic._id && comp.state.showCaption === 'showCaption') || (editPic._id && editPic.comments === 'showCaption')}
        onChange={comp.handleRadioChange}
        style={{ opacity: 1 }}
      />
    </label>
    <label htmlFor="hideCaption" style={{ display: 'inline', padding: '20px' }}>
      Hide Caption
      <input
        type="radio"
        id="hideCaption"
        value="hideCaption"
        checked={(!editPic._id && comp.state.showCaption !== 'showCaption') || (editPic._id && editPic.comments !== 'showCaption')}
        onChange={comp.handleRadioChange}
        style={{ opacity: 1 }}
      />
    </label>
  </div>
);

export const PicEditor = ({ comp, controller, editPic }:PageProps): JSX.Element => {
  let { title, url } = comp.state;
  if (title === '' && editPic.title !== undefined) { title = editPic.title; }
  if (url === '' && editPic.url !== undefined) { url = editPic.url; }
  return (
    <form id="picsForm">
      <label htmlFor="title">
        Picture Title
        <input id="title" placeholder={title} value={title} onChange={controller.onChangePic} />
      </label>
      <label htmlFor="url">
        Image Address
        <input id="url" placeholder={url} value={url} onChange={controller.onChangePic} />
      </label>
      <p>{' '}</p>
      {radioButtons(comp, editPic)}
      {editPic._id ? (
        <button className="floatRight" type="button" id="cancel-edit-pic" onClick={controller.resetEditPic}>
          Cancel
        </button>
      ) : null}
      <button disabled={!(title && url)} type="button" onClick={editPic._id ? controller.editPicAPI : controller.addPic}>
        {editPic._id ? 'Edit' : 'Create'}
        {' '}
        Picture
      </button>
    </form>
  );
};
export default PicEditor;
