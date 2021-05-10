import React from 'react';
import type { MusicDashboard } from '../../containers/MusicDashboard';
import type { MusicDashboardController } from '../../containers/MusicDashboard/MusicDashboardController';

export interface Iimage {
  url: string;
  title: string;
  type: string;
  caption: string;
}

type PageProps = {
  comp: MusicDashboard,
  controller: MusicDashboardController,
  editPic: Iimage,
};

export const PicEditor = ({ comp, controller, editPic }:PageProps): JSX.Element => (
  <form id="picsForm">
    <label htmlFor="picTitle">
      Picture Title
      <input id="picTitle" placeholder={editPic.title} value={comp.state.picTitle} onChange={comp.onChange} />
    </label>
    <label htmlFor="picUrl">
      Image Address
      <input id="picUrl" placeholder={editPic.url} value={comp.state.picUrl} onChange={comp.onChange} />
    </label>
    <label htmlFor="picCaption">
      Picture Caption
      <input id="picCaption" placeholder={editPic.caption} value={comp.state.showCaption} onChange={comp.onChange} />
    </label>
    <p>{' '}</p>
    <button disabled={!(comp.state.picTitle && comp.state.picUrl)} type="button" onClick={controller.addPic}>Add Picture</button>
  </form>
);
export default PicEditor;
