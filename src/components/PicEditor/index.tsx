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

const radioButtons = (comp:MusicDashboard): JSX.Element => (
  <div id="radio-buttons">
    <label htmlFor="showCaption" style={{ display: 'inline', padding: '10px' }}>
      Show Caption
      <input
        type="radio"
        name="show-caption"
        id="showCaption"
        value="showCaption"
        checked={comp.state.showCaption === 'showCaption'}
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
        checked={comp.state.showCaption !== 'showCaption'}
        onChange={comp.handleRadioChange}
        style={{ opacity: 1 }}
      />
    </label>
  </div>
);

export const PicEditor = ({ comp, controller, editPic }:PageProps): JSX.Element => {
  let { picTitle, picUrl } = comp.state;
  if (picTitle === '' && editPic.title !== undefined){ picTitle = editPic.title; }
  if (picUrl === '' && editPic.url !== undefined){ picUrl = editPic.url };
  
  return(
  <form id="picsForm">
    <label htmlFor="picTitle">
      Picture Title
      <input id="picTitle" placeholder={picTitle} value={picTitle || ''} onChange={comp.onChange} />
    </label>
    <label htmlFor="picUrl">
      Image Address
      <input id="picUrl" placeholder={picUrl} value={picUrl || ''} onChange={comp.onChange} />
    </label>
    <p>{' '}</p>
    {radioButtons(comp)}
    <button disabled={!(picTitle && picUrl)} type="button" onClick={editPic._id ? controller.editPic : controller.addPic}>
      {editPic._id ? 'Edit' : 'Create'}
        {' '}
     Picture</button>
  </form>
  );
};
export default PicEditor;
