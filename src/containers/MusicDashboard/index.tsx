import React, { Component } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import moment from 'moment';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import mapStoreToProps from '../../redux/mapStoreToProps';
import forms from '../../lib/forms';
import commonUtils from '../../lib/commonUtils';
import AddTime from '../../lib/timeKeeper';
import Ttable from '../../components/tour-table';

type MusicDashboardProps = {
  dispatch: (...args: any) => any;
  scc: {transmit: (...args: any[]) => any};
  auth: {token: string};
  editTour: {date?: string; time?: string; tickets?: string; more?: string; venue?: string; location?: string; _id?: string; datetime?: string};
};
type MusicDashboardState = {
  location: string;
  venue: any | string;
  redirect: boolean;
  date: string;
  time: string;
  tickets: string;
  more: string;
  [x: number]: any;
};
export class MusicDashboard extends Component<MusicDashboardProps, MusicDashboardState> {
  forms: any;

  commonUtils: any;

  constructor(props: any) {
    super(props);
    this.state = {
      redirect: false, date: '', time: '', tickets: '', more: '', venue: '', location: '',
    };
    this.forms = forms;
    this.onChange = this.onChange.bind(this);
    this.createTour = this.createTour.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.createTourApi = this.createTourApi.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.setFormTime = this.setFormTime.bind(this);
    this.commonUtils = commonUtils;
    this.checkEdit = this.checkEdit.bind(this);
    this.editTourAPI = this.editTourAPI.bind(this);
    this.resetEditForm = this.resetEditForm.bind(this);
  }

  componentDidMount() { this.commonUtils.setTitleAndScroll('Music Dashboard'); }

  onChange(evt: any) {
    this.checkEdit();
    this.setState({ [evt.target.id]: evt.target.value });
  }

  setFormTime(data) {
    this.setState({ time: data });
  }

  checkEdit() {
    let {
      date, time, tickets, more, venue, location,
    } = this.state;
    const { editTour } = this.props;
    if (date === '' && editTour.date !== undefined) { date = editTour.datetime.split('T')[0]; }//eslint-disable-line
    if (time === '' && editTour.time !== undefined) { time = editTour.time; }
    if (tickets === '' && editTour.tickets !== undefined) { tickets = editTour.tickets; }
    if (more === '' && editTour.more !== undefined) { more = editTour.more; }
    if (venue === '' && editTour.venue !== undefined) { venue = editTour.venue; }
    if (location === '' && editTour.location !== undefined) { location = editTour.location; }
    this.setState({
      date, time, tickets, more, venue, location,
    });
  }

  resetEditForm(evt: {preventDefault: (...args: any) => any}) {
    evt.preventDefault();
    const { dispatch } = this.props;
    dispatch({ type: 'EDIT_TOUR', data: {} });
    this.setState({
      date: '', time: '', tickets: '', more: '', venue: '', location: '',
    });
  }

  handleEditorChange(venue: any) { this.checkEdit(); this.setState({ venue }); }

  validateForm() {
    const {
      date, time, location, venue,
    } = this.state;
    if (date && time && location && venue && date !== '') return false;
    return true;
  }

  createTourApi(tour1: any) {
    const { scc, auth } = this.props;
    const tour = tour1;
    tour.datetime = tour.date;
    const m = moment(tour.date, 'YYYY-MM-DD');
    tour.date = m.format('ll');
    scc.transmit('newTour', { tour, token: auth.token });
    this.setState({ redirect: true });
    return true;
  }

  createTour() {
    const {
      date, time, location, venue, tickets, more,
    } = this.state;
    const tour = {
      date, time, location, venue, tickets, more,
    };
    return this.createTourApi(tour);
  }

  editor(venue: string) {
    return (
      <Editor
        value={venue}
        apiKey={process.env.TINY_KEY}
        init={{
          height: 400,
          menubar: 'insert',
          selector: 'textarea',
          menu: { format: { title: 'Format', items: 'forecolor backcolor' } },
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount',
          ],
          toolbar:
            'undo redo | formatselect | bold italic backcolor forecolor |'
            + 'alignleft aligncenter alignright alignjustify |'
            + 'bullist numlist outdent indent | removeformat | help',
        }}
        onEditorChange={this.handleEditorChange}
      />
    );
  }

  editTourAPI() {
    const {
      date, time, location, venue, tickets, more,
    } = this.state;
    const { editTour, scc, auth } = this.props;
    const tour = {
      date, time, location, venue, tickets, more,
    };
    // @ts-ignore
    tour.datetime = date;
    const m = moment(tour.date, 'YYYY-MM-DD');
    tour.date = m.format('ll');
    scc.transmit('editTour', { tour, token: auth.token, tourId: editTour._id });
    this.resetEditForm({ preventDefault: () => {} });
    this.setState({ redirect: true });
    return true;
  }

  tourButtons() {
    const { editTour } = this.props;
    return (
      <div style={{ textAlign: 'left', marginTop: '10px', maxWidth: '85%' }}>
        <span style={{
          fontSize: '16px', marginRight: '20px', fontFamily: 'Habibi', position: 'relative', display: 'inline-block',
        }}
        >
          <i>* Required</i>
        </span>
        {editTour._id ? (
          <button className="floatRight" type="button" id="cancel-edit-pic" onClick={this.resetEditForm}>
            Cancel
          </button>
        ) : null}
        <button
          className="floatRight"
          disabled={this.validateForm()}
          type="button"
          onClick={editTour._id ? this.editTourAPI : this.createTour}
        >
          {editTour._id ? 'Edit' : 'Create'}
          {' '}
          Tour
        </button>
      </div>
    );
  }

  newTourForm() {
    let {
      location, tickets, more, date, time, venue,
    } = this.state;
    const { editTour } = this.props;
    if (date === '' && editTour.date !== undefined) { date = editTour.datetime.split('T')[0]; }//eslint-disable-line
    if (time === '' && editTour.time !== undefined) { time = editTour.time; }
    if (tickets === '' && editTour.tickets !== undefined) { tickets = editTour.tickets; }
    if (more === '' && editTour.more !== undefined) { more = editTour.more; }
    if (venue === '' && editTour.venue !== undefined) { venue = editTour.venue; }
    if (location === '' && editTour.location !== undefined) { location = editTour.location; }
    return (
      <form id="new-tour" style={{ marginLeft: '4px', marginTop: '4px' }}>
        {this.forms.makeInput('date', 'Date', true, this.onChange, date)}
        <AddTime setFormTime={this.setFormTime} initTime={time} />
        <div className="horiz-scroll">
          <div style={{ width: '850px', margin: 'auto' }}>
            <p style={{ marginBottom: 0 }}>* Venue</p>
            {this.editor(venue)}
          </div>
        </div>

        {this.forms.makeInput('text', 'Location', true, this.onChange, location)}
        {this.forms.makeInput('text', 'Tickets', false, this.onChange, tickets)}
        {this.forms.makeInput('text', 'More', false, this.onChange, more)}
        {this.tourButtons()}
      </form>
    );
  }

  render() {
    const { redirect } = this.state;
    const { editTour } = this.props;
    return (
      <div className="page-content">
        {redirect ? <Redirect to="/music" /> : null}
        <h3 style={{ textAlign: 'center', margin: '14px', fontWeight: 'bold' }}>Music Dashboard</h3>
        <div className="material-content elevation3" style={{ maxWidth: '9.1in', margin: 'auto' }}>
          <h5 style={{ textAlign: 'center', marginBottom: 0 }}>
            {editTour._id ? 'Edit' : 'Create a New'}
            {' '}
            Tour Event
          </h5>
          {this.newTourForm()}
        </div>
        <p>&nbsp;</p>
        {!editTour._id ? (
          <div className="material-content elevation3" style={{ maxWidth: '10in', margin: 'auto' }}>
            <h5 style={{ textAlign: 'center', marginBottom: 0 }}>Modify Event</h5>
            <Ttable deleteButton />
          </div>
        ) : null}
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      </div>
    );
  }
}
export default withRouter(connect(mapStoreToProps)(MusicDashboard));
