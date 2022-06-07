import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import type { AGClientSocket } from 'socketcluster-client';
import type { Dispatch, AnyAction } from 'redux';
import mapStoreToProps, { Iimage, Auth } from '../../redux/mapStoreToProps';
import Forms from '../../lib/forms';
import commonUtils from '../../lib/commonUtils';
// import Controller, { MusicDashboardController } from './MusicDashboardController';
import { TourEditor } from '../../components/TourEditor';
import { DashNavigationButtons } from '../../components/DashNavigationButtons';

interface MusicDashboardProps extends RouteComponentProps<Record<string, string | undefined>> {
  dispatch: Dispatch<AnyAction>;
  scc: AGClientSocket;
  auth: Auth;
  editPic: Iimage;
  images: Iimage[];
}

type MusicDashboardState = {
  title: string,
  url: string,
  showCaption: string,
  location: string;
  venue: string;
  redirect: boolean;
  date: string;
  datetime: string;
  time: Date | null;
  tickets: string;
  more: string;
  [x: number]: number;
  navState:{ navSong:boolean, navPhoto:boolean, navTour: boolean };
};

const InitialState = {
  songState: {
    image: '', composer: '', year: new Date().getFullYear(), album: '', title: '', url: '', artist: '', category: 'original', _id: '',
  },
  datetime: '',
  title: '',
  url: '',
  showCaption: '',
  redirect: false,
  date: '',
  time: new Date(),
  tickets: '',
  more: '',
  venue: '',
  location: '',
  navState: { navSong: true, navPhoto: false, navTour: false },
};
export class MusicDashboard extends Component<MusicDashboardProps, MusicDashboardState> {
  commonUtils: { setTitleAndScroll: (pageTitle: string, width: number) => void };

  // controller: MusicDashboardController;

  public forms = Forms;

  constructor(props: MusicDashboardProps) {
    super(props);
    this.state = InitialState;
    // this.controller = new Controller(this);
    this.commonUtils = commonUtils;
    this.handleNavClick = this.handleNavClick.bind(this);
  }

  componentDidMount(): void { this.commonUtils.setTitleAndScroll('Music Dashboard', window.screen.width); }

  // eslint-disable-next-line react/sort-comp
  handleNavClick(e: React.MouseEvent<HTMLButtonElement>): void {
    if (e.currentTarget.id === 'Songs-Button') {
      this.setState({ navState: { navSong: true, navPhoto: false, navTour: false } });
    }
    if (e.currentTarget.id === 'Gigs-Button') {
      this.setState({ navState: { navSong: false, navPhoto: false, navTour: true } });
    }
    if (e.currentTarget.id === 'Photos-Button') {
      this.setState({ navState: { navSong: false, navPhoto: true, navTour: false } });
    }
  }

  render(): JSX.Element {
    const { navState } = this.state;
    return (
      <div className="page-content">
        <DashNavigationButtons comp={this} />
        {/* {navState.navSong ? (this.controller.songBlock()) : null}
        {navState.navPhoto ? (this.controller.pictureBlock()) : null} */}
        {/* {navState.navTour ? <TourEditor /> : null} */}
      </div>
    );
  }
}

export default withRouter(connect(mapStoreToProps, null)(MusicDashboard));
