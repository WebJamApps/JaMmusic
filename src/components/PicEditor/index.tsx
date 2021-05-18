import React from 'react';
import type { MusicDashboard } from '../../containers/MusicDashboard';
import type { MusicDashboardController } from '../../containers/MusicDashboard/MusicDashboardController';

type PageProps = {
  comp: MusicDashboard,
  controller: MusicDashboardController,
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

export const PicEditor = ({ comp, controller }:PageProps): JSX.Element => (
  <form id="picsForm">
    <label htmlFor="picTitle">
      Picture Title
      <input id="picTitle" placeholder={comp.state.picTitle} value={comp.state.picTitle} onChange={comp.onChange} />
    </label>
    <label htmlFor="picUrl">
      Image Address
      <input id="picUrl" placeholder={comp.state.picUrl} value={comp.state.picUrl} onChange={comp.onChange} />
    </label>
    <p>{' '}</p>
    {radioButtons(comp)}
    <button disabled={!(comp.state.picTitle && comp.state.picUrl)} type="button" onClick={controller.addPic}>Add Picture</button>
  </form>
);
export default PicEditor;
