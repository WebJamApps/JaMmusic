import React, { Component } from 'react';
import moment from 'moment';
import { withRouter, Redirect, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import type { AGClientSocket } from 'socketcluster-client';
import type { Dispatch, AnyAction } from 'redux';
import type { ISong } from '../../providers/Songs.provider';
import mapStoreToProps, { Tour, Iimage } from '../../redux/mapStoreToProps';
import Forms from '../../lib/forms';
import commonUtils from '../../lib/commonUtils';
import Controller, { MusicDashboardController } from './MusicDashboardController';
import { TourEditor } from '../../components/TourEditor';
import { DashNavigationButtons } from '../../components/DashNavigationButtons';

interface MusicDashboardProps extends RouteComponentProps<Record<string, string | undefined>> {
  dispatch: Dispatch<AnyAction>;
  scc: AGClientSocket;
  auth: { token: string };
  editPic?: Iimage,
  editSong: ISong | { _id: string, category: string, year: number, title: string, url: string },
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
  navState:{ navSong:boolean, navPhoto:boolean, navTour: boolean };
};

const InitialState = {
  songState: {
    image: '', composer: '', year: new Date().getFullYear(), album: '', title: '', url: '', artist: '', category: 'original', _id: '',
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
  navState: { navSong: true, navPhoto: false, navTour: false },
};
export class MusicDashboard extends Component<MusicDashboardProps, MusicDashboardState> {
  commonUtils: { setTitleAndScroll: (pageTitle: string, width: number) => void };

  controller: MusicDashboardController;

  public forms = Forms;

  constructor(props: MusicDashboardProps) {
    super(props);
    this.state = InitialState;
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

  handleNavClick(e: React.MouseEvent<HTMLButtonElement>): void {
    if (e.currentTarget.id === 'Songs-Button') {
      this.setState({ navState: { navSong: true, navPhoto: false, navTour: false } });
    }
    if (e.currentTarget.id === 'Tours-Button') {
      this.setState({ navState: { navSong: false, navPhoto: false, navTour: true } });
    }
    if (e.currentTarget.id === 'Photos-Button') {
      this.setState({ navState: { navSong: false, navPhoto: true, navTour: false } });
    }
  }

  handleCategoryChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    const { songState } = this.state;
    this.setState({ songState: { ...songState, category: event.target.value } });
  }

  handleEditorChange(venue: string): void { this.checkEdit(); this.setState({ venue }); }

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

  render(): JSX.Element {
    const { redirect } = this.state;
    const { editTour } = this.props;
    const { navState } = this.state;
    return (
      <div className="page-content">
        {redirect ? <Redirect to="/music" /> : null}
        <DashNavigationButtons comp={this} />
        {navState.navSong ? (this.controller.songBlock()) : null}
        {navState.navPhoto ? (this.controller.pictureBlock()) : null}
        {navState.navTour ? <TourEditor comp={this} editTour={editTour} /> : null}
      </div>
    );
  }
}

export default withRouter(connect(mapStoreToProps, null)(MusicDashboard));
