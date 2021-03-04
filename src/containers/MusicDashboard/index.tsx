import React, { Component } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import moment from 'moment';
import { withRouter, Redirect, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import type { AGClientSocket } from 'socketcluster-client';
import type { Dispatch, AnyAction } from 'redux';
import type { ISong } from '../../providers/Songs.provider';
import mapStoreToProps, { Tour, Iimage } from '../../redux/mapStoreToProps';
import forms from '../../lib/forms';
import commonUtils from '../../lib/commonUtils';
import Controller, { MusicDashboardController } from './MusicDashboardController';
import { ButtonProps } from 'react-materialize';

interface MusicDashboardProps extends RouteComponentProps<Record<string, string | undefined>> {
  dispatch: Dispatch<AnyAction>;
  scc: AGClientSocket;
  auth: { token: string };
  editPic?: Iimage,
  editSong: ISong | {_id:'', category:'', year:2020, title:'', url:''},
  editTour: { date?: string; time?: string; tickets?: string; more?: string; venue?: string; location?: string; _id?: string; datetime?: string };
}
type MusicDashboardState = {
  picTitle: string,
  picUrl: string,
  location: string;
  venue: string;
  redirect: boolean;
  date: string;
  time: string;
  tickets: string;
  more: string;
  [x: number]: number;
  songState: ISong;
  navSong:boolean, navPhoto:boolean , navTour: boolean;
};
export class MusicDashboard extends Component<MusicDashboardProps, MusicDashboardState> {
  forms: typeof forms;

  commonUtils: { setTitleAndScroll: (pageTitle: string, width: number) => void };

  controller: MusicDashboardController;

  constructor(props: MusicDashboardProps) {
    super(props);
    this.state = {
      songState: {
        image: '', composer: '', year: 2020, album: '', title: '', url: '', artist: '', category: 'original', _id: '',
      },
      picTitle: '',
      picUrl: '',
      redirect: false,
      date: '',
      time: '',
      tickets: '',
      more: '',
      venue: '',
      location: '',
      navSong: true,
      navPhoto:false, 
      navTour:false,
    };
    this.forms = forms;
    this.controller = new Controller(this);
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
    this.onChangeSong = this.onChangeSong.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.setSongState = this.setSongState.bind(this);
    this.handleNavClick = this.handleNavClick.bind(this);
  }

  componentDidMount(): void { this.commonUtils.setTitleAndScroll('Music Dashboard', window.screen.width); }

  componentDidUpdate(prevProps:MusicDashboardProps): void {
    const { editSong } = this.props;
    if (editSong._id !== prevProps.editSong._id) { this.setSongState(editSong); }
  }

  onChange(evt: React.ChangeEvent<HTMLInputElement>): void {
    evt.persist();
    const { editTour } = this.props;
    if (editTour.venue !== undefined) this.checkEdit();
    this.setState((prevState) => ({ ...prevState, [evt.target.id]: evt.target.value }));
  }

  onChangeSong(evt: React.ChangeEvent<HTMLInputElement>): void {
    evt.persist();
    let { songState } = this.state;
    songState = { ...songState, [evt.target.id]: evt.target.value };
    this.setState((prevState) => ({ ...prevState, songState }));
  }

  setSongState(editSong: ISong | { _id: ''; category: ''; year: 2020; title: ''; url: '';composer:'' }):void {
    // eslint-disable-next-line no-param-reassign
    if (!editSong.composer)editSong.composer = '';
    this.setState({ songState: editSong });
  }

  setFormTime(time: string): void { this.setState({ time }); }

  handleCategoryChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    const { songState } = this.state;
    this.setState({ songState: { ...songState, category: event.target.value } });
  }

  // eslint-disable-next-line class-methods-use-this
  fixDate(date: string,
    editTour: {
      date?: string; time?: string; tickets?: string; more?: string;
      venue?: string; location?: string; _id?: string; datetime?: string;
    }): string {
    let newDate = date;
    // eslint-disable-next-line prefer-destructuring
    if (date === '' && editTour.datetime !== undefined) newDate = editTour.datetime.split('T')[0];
    return newDate;
  }

  checkEdit(): void {
    let {
      date, time, tickets, more, venue, location,
    } = this.state;
    const { editTour, dispatch } = this.props;
    date = this.fixDate(date, editTour);
    if (time === '' && editTour.time !== undefined) { time = editTour.time; }
    if (tickets === '' && editTour.tickets !== undefined) { tickets = editTour.tickets; }
    if (more === '' && editTour.more !== undefined) { more = editTour.more; }
    if (venue === '' && editTour.venue !== undefined) { venue = editTour.venue; }
    if (location === '' && editTour.location !== undefined) { location = editTour.location; }
    this.setState({
      date, time, tickets, more, venue, location,
    });
    if (editTour.venue !== undefined) {
      dispatch({ type: 'EDIT_TOUR', data: { _id: editTour._id } });
    }
  }

  resetEditForm(evt: React.MouseEvent | null): void {
    if (evt) evt.preventDefault();
    const { dispatch } = this.props;
    dispatch({ type: 'EDIT_TOUR', data: {} });
    this.setState({
      date: '', time: '', tickets: '', more: '', venue: '', location: '',
    });
  }

  handleEditorChange(venue: string): void { this.checkEdit(); this.setState({ venue }); }

  validateForm(): boolean {
    const {
      date, time, location, venue,
    } = this.state;
    if (date && time && location && venue && date !== '') return false;
    return true;
  }

  createTourApi(tour1: Tour): boolean {
    const { scc, auth } = this.props;
    const tour = tour1;
    tour.datetime = tour.date;
    const m = moment(tour.date, 'YYYY-MM-DD');
    tour.date = m.format('ll');
    scc.transmit('newTour', { tour, token: auth.token });
    this.setState({ redirect: true });
    return true;
  }

  createTour(): boolean {
    const {
      date, time, location, venue, tickets, more,
    } = this.state;
    const tour = {
      date, time, location, venue, tickets, more,
    };
    return this.createTourApi(tour);
  }

  editor(venue: string): JSX.Element {
    return (
      <div className="horiz-scroll">
        <div style={{ width: '850px', margin: 'auto' }}>
          <p style={{ marginBottom: 0 }}>* Venue</p>
          <Editor
            value={venue}
            apiKey={process.env.TINY_KEY}
            init={{
              height: 500,
              menubar: 'insert tools',
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
        </div>
      </div>
    );
  }

  editTourAPI(): boolean {
    const {
      date, time, location, venue, tickets, more,
    } = this.state;
    const { editTour, scc, auth } = this.props;
    const tour = {
      date, time, location, venue, tickets, more, datetime: date,
    };
    const m = moment(tour.date, 'YYYY-MM-DD');
    tour.date = m.format('ll');
    scc.transmit('editTour', { tour, token: auth.token, tourId: editTour._id });
    this.resetEditForm(null);
    this.setState({ redirect: true });
    return true;
  }

  tourButtons(): JSX.Element {
    const { editTour } = this.props;
    return (
      <div style={{ textAlign: 'left', marginTop: '10px', maxWidth: '85%' }}>
        <span style={{
          fontSize: '16px', marginRight: '20px', position: 'relative', display: 'inline-block',
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

  newTourForm(): JSX.Element {
    let {
      location, tickets, more, date, time, venue,
    } = this.state;
    const { editTour } = this.props;
    date = this.fixDate(date, editTour);
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
          {this.forms.makeInput('date', 'Date', true, this.onChange, date)}
          <AddTime setFormTime={this.setFormTime} initTime={time} />
          {this.editor(venue)}
          <p>{' '}</p>
          {this.forms.makeInput('text', 'Location', true, this.onChange, location)}
          {this.forms.makeInput('text', 'Tickets', false, this.onChange, tickets)}
          {this.forms.makeInput('text', 'More', false, this.onChange, more)}
          {this.tourButtons()}
        </form>
      </div>
    );
  }
  
  pictureBlock(): JSX.Element {
    return ( 
         <div className="material-content elevation3" style={{ maxWidth: '9.1in', margin: 'auto' }}>
           <h5 style={{ textAlign: 'center', marginBottom: 0 }}>Modify Photo Slideshow</h5>
           {this.controller.changePicDiv()}
         </div>
    );
   }
 
 
   tourBlock(): JSX.Element {
     const { editTour } = this.props;
     return (
       <div className="Tour-Block">
       <p>&nbsp;</p>
       {this.newTourForm()}
       <p>&nbsp;</p>
       {!editTour._id ? (
         <div className="search-table-outer" style={{ maxWidth: '96%', margin: 'auto', zIndex: 0 }}>
           <h5 style={{ textAlign: 'center', marginBottom: '3px' }}>Modify</h5>
           <Ttable deleteButton />
         </div>
       ) : null}
       </div>
     );
   }

   songBlock(): JSX.Element {
     return (
      <div className="Song-Block">
      <p>&nbsp;</p>
      {this.controller.changeSongDiv()}
      <p>&nbsp;</p>
      {this.controller.modifySongsSection()}
      <p>&nbsp;</p>
      </div>
     );
   }

   dashNavigationButtons(): JSX.Element {
    return(
      <div className="Nav-Buttons" style={{padding:'10px', display:'inline', textAlign: 'right', marginTop: '10px', maxWidth: '50%' }}>
            {this.photoButton()}
            {this.tourButton()}
            {this.songButton()}
      </div>
    );
  }
  
  handleNavClick(e:AnyAction){
  if(e.target.id === "Songs-Button"){
    this.setState({navPhoto: false});
    this.setState({navSong: true});
    this.setState({navTour: false});
  }
  if(e.target.id === "Tours-Button"){
    this.setState({navPhoto: false});
    this.setState({navSong: false});
    this.setState({navTour: true});
  }
  if(e.target.id === "Photos-Button"){
    this.setState({navPhoto: true});
    this.setState({navSong: false});
    this.setState({navTour: false});
  }
  }

  photoButton(): JSX.Element {
    return (
      <button className="floatRight" type="button" id="Photos-Button" onClick={this.handleNavClick}>
            Photos
      </button>
    );
  }

  tourButton(): JSX.Element {
    return (      
    <button className="floatRight" type="button" id="Tours-Button"onClick={this.handleNavClick} >
      Tours
    </button>
    );
  }

  songButton(): JSX.Element {
    return (      
    <button className="floatRight" type="button" id="Songs-Button" onClick={this.handleNavClick}>
      Songs
    </button>
    );
  }


  render(): JSX.Element {
    const { redirect } = this.state;
    const { editTour } = this.props;
    const { navSong } = this.state;
    const { navTour } = this.state;
    const { navPhoto } = this.state;
    return (
      <div className="page-content">
        {redirect ? <Redirect to="/music" /> : null}
        <h3 style={{ textAlign: 'center', margin: '14px', fontWeight: 'bold' }}>Music Dashboard {this.dashNavigationButtons()}</h3>
        {navSong ? (this.songBlock()): null}
        {navPhoto ? (this.pictureBlock()): null}
        {navTour ? (this.tourBlock()): null}
      </div>
    );
  }
  
}

export default withRouter(connect(mapStoreToProps, null)(MusicDashboard));
