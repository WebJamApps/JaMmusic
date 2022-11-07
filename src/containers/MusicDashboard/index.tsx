import React, { Component } from 'react';
import { withRouter, Redirect, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import type { AGClientSocket } from 'socketcluster-client';
import type { Dispatch, AnyAction } from 'redux';
import type { ISong } from 'src/providers/Data.provider';
import commonUtils from 'src/lib/commonUtils';
import mapStoreToProps, { Iimage } from '../../redux/mapStoreToProps';
import Controller, { MusicDashboardController } from './MusicDashboardController';
import { DashNavigationButtons } from '../../components/DashNavigationButtons';

interface MusicDashboardProps extends RouteComponentProps<Record<string, string | undefined>> {
  dispatch: Dispatch<AnyAction>;
  scc: AGClientSocket;
  editPic: Iimage;
  editSong: ISong | { _id: string, category: string, year: number, title: string, url: string },
  showTable: boolean;
  images: Iimage[];
}

type MusicDashboardState = {
  title: string,
  url: string,
  showCaption: string,
  redirect: boolean;
  [x: number]: number;
  songState: ISong;
  navState:{ navSong:boolean, navPhoto:boolean, navTour: boolean };
};

const InitialState = {
  songState: {
    image: '', composer: '', year: new Date().getFullYear(), album: '', title: '', url: '', artist: '', category: 'original', _id: '',
  },
  title: '',
  url: '',
  showCaption: '',
  redirect: false,
  navState: { navSong: true, navPhoto: false, navTour: false },
};
export class MusicDashboard extends Component<MusicDashboardProps, MusicDashboardState> {
  commonUtils: { setTitleAndScroll: (pageTitle: string, width: number) => void };

  controller: MusicDashboardController;

  constructor(props: MusicDashboardProps) {
    super(props);
    this.state = InitialState;
    this.controller = new Controller(this);
    this.commonUtils = commonUtils;
    this.onChangeSong = this.onChangeSong.bind(this);
    this.setSongState = this.setSongState.bind(this);
    this.handleNavClick = this.handleNavClick.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
  }

  componentDidMount(): void {
    this.commonUtils.setTitleAndScroll('Music Dashboard', window.screen.width);
  }

  componentDidUpdate(prevProps:MusicDashboardProps): void {
    const { editSong } = this.props;
    if (editSong && editSong._id !== prevProps.editSong._id) { this.setSongState(editSong); }
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

  // eslint-disable-next-line react/sort-comp
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

  handleRadioChange(evt: { target: { value: string } }): void {
    this.setState({ showCaption: evt.target.value });
    const { dispatch } = this.props;
    dispatch({ type: 'EDIT_PIC', data: { ...this.props.editPic, comments: evt.target.value } });
  }

  // eslint-disable-next-line class-methods-use-this
  fixDate(
    date: string,
    editTour: {
      date?: string; time?: string; tickets?: string; more?: string;
      venue?: string; location?: string; _id?: string; datetime?: string;
    },
  ): string {
    let newDate = date;
    // eslint-disable-next-line prefer-destructuring
    if (date === '' && editTour.datetime !== undefined) newDate = editTour.datetime.split('T')[0];
    return newDate;
  }

  render(): JSX.Element {
    // TODO page-content should be a functional
    const auth:any = {};
    const { redirect } = this.state;
    const { navState } = this.state;
    return (
      <div className="page-content">
        {redirect ? <Redirect to="/music" /> : null}
        <DashNavigationButtons comp={this} />
        {navState.navSong ? (this.controller.songBlock(auth)) : null}
        {/* {navState.navPhoto ? (this.controller.pictureBlock(auth)) : null} */}
      </div>
    );
  }
}

export default withRouter(connect(mapStoreToProps, null)(MusicDashboard));
