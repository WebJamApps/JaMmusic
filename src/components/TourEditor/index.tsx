
// import AddTime from '../../containers/MusicDashboard/AddTime';
import type { MusicDashboard } from '../../containers/MusicDashboard';
import Ttable from '../TourTable';
import Utils from './tourEditorUtils';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

export interface IeditTour {
  date?: string; time?: Date | null;
  tickets?: string; more?: string; venue?: string; location?: string; _id?: string; datetime?: string
}
type PageProps = { editTour: IeditTour, comp: MusicDashboard };

export const newTourForm = (comp: MusicDashboard, editTour: IeditTour): JSX.Element => {
  let {
    location, tickets, more, date, venue, time,
  } = comp.state;
  const { datetime } = comp.state;
  date = comp.fixDate(date, editTour);
  if (datetime === '' && editTour.datetime !== undefined) { time = new Date(editTour.datetime); }
  if (tickets === '' && editTour.tickets !== undefined) { tickets = editTour.tickets; }
  if (more === '' && editTour.more !== undefined) { more = editTour.more; }
  if (venue === '' && editTour.venue !== undefined) { venue = editTour.venue; }
  if (location === '' && editTour.location !== undefined) { location = editTour.location; }
  return (
    <div className="material-content elevation3" style={{ maxWidth: '9.1in', margin: 'auto' }}>
      <h5 style={{ textAlign: 'center', marginBottom: '30px' }}>
        {editTour._id ? 'Edit ' : 'Create '}
        a Gig
      </h5>
      <p>{' '}</p>
      <form id="new-tour" style={{ marginLeft: '4px', marginTop: '12px' }}>
        <p>* Date</p>
        {comp.forms.makeInput('date', 'Date', true, comp.onChange, date)}
        <p>{' '}</p>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <TimePicker
            label="* Time"
            value={time}
            onChange={(newValue) => {
              comp.setFormTime(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
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

export const TourEditor = ({ editTour, comp }: PageProps): JSX.Element => (
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
