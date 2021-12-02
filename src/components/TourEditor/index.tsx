import React from 'react';
import AddTime from '../../containers/MusicDashboard/AddTime';
import type { MusicDashboard } from '../../containers/MusicDashboard';
import Ttable from '../TourTable/TourTable_old';
import Utils from './tourEditorUtils';

export interface IeditTour {
  date?:string; time?:string;
  tickets?:string; more?:string; venue?:string; location?:string; _id?:string; datetime?:string
}
type PageProps = { editTour:IeditTour, comp:MusicDashboard };

export const newTourForm = (comp:MusicDashboard, editTour:IeditTour): JSX.Element => {
  let {
    location, tickets, more, date, time, venue,
  } = comp.state;

  date = comp.fixDate(date, editTour);
  if (time === '' && editTour.time !== undefined) { time = editTour.time; }
  if (tickets === '' && editTour.tickets !== undefined) { tickets = editTour.tickets; }
  if (more === '' && editTour.more !== undefined) { more = editTour.more; }
  if (venue === '' && editTour.venue !== undefined) { venue = editTour.venue; }
  if (location === '' && editTour.location !== undefined) { location = editTour.location; }
  return (
    <div className="material-content elevation3" style={{ maxWidth: '9.1in', margin: 'auto' }}>
      <h5 style={{ textAlign: 'center', marginBottom: '30px' }}>
        {editTour._id ? 'Edit ' : 'Create a New '}
        Tour Event
      </h5>
      <p>{' '}</p>
      <form id="new-tour" style={{ marginLeft: '4px', marginTop: '12px' }}>
        <p>* Date</p>
        {comp.forms.makeInput('date', 'Date', true, comp.onChange, date)}
        <AddTime setFormTime={comp.setFormTime} initTime={time} show={true}/>
        {Utils.editor(venue, comp)}
        <p>{' '}</p>
        {comp.forms.makeInput('text', 'Location', true, comp.onChange, location)}
        {comp.forms.makeInput('text', 'Tickets', false, comp.onChange, tickets)}
        {comp.forms.makeInput('text', 'More', false, comp.onChange, more)}
        {Utils.tourButtons(comp)}
      </form>
    </div>
  );
};

export const TourEditor = ({ editTour, comp }:PageProps): JSX.Element => (
  <div className="Tour-Block">
    <p>&nbsp;</p>
    {newTourForm(comp, editTour)}
    <p>&nbsp;</p>
    {!editTour._id ? (
      <div className="search-table-outer" style={{ maxWidth: '96%', margin: 'auto', zIndex: 0 }}>
        <h5 style={{ textAlign: 'center', marginBottom: '3px' }}>Modify</h5>
        <Ttable deleteButton />
      </div>
    ) : null}
  </div>
);
