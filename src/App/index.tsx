import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { Component, Dispatch } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import DefaultSort from '../containers/SortContainer';
import DefaultMusic from '../containers/Music';
import DefaultMusicDashboard from '../containers/MusicDashboard';
import BuyMusic from '../containers/BuyMusic';
import AppFourOhFour from './404';
import GoogleMap from '../containers/GoogleMap';
import AppMain from './AppTemplate';
import DefaultSongs from '../containers/Songs';
import HomePage from '../containers/Homepage';
import connectToSC from './connectToSC';
import mapStoreToProps, { Song, Iimage, Auth } from '../redux/mapStoreToProps';
import getSongs from './songsActions';
import commonUtils from '../lib/commonUtils';

export interface AppProps {
  dispatch: Dispatch<unknown>;
  songs: Song[];
  images: Iimage[];
  auth: Auth;
}

interface Astate {
  userRoles:string[];
}

export class App extends Component<AppProps, Astate> {
  connectToSC: typeof connectToSC;

  utils: typeof commonUtils;

  static defaultProps = {
    dispatch: (): void => { },
    songs: [],
    images: [],
    auth: {
      isAuthenticated: false, token: '', error: '', email: '', user: { userType: '' },
    },
  };

  constructor(props: AppProps) {
    super(props);
    this.state = {
      userRoles: [],
    };
    this.utils = commonUtils;
    this.connectToSC = connectToSC;
  }

  async componentDidMount(): Promise<void> {
    const { dispatch, songs } = this.props;
    if (songs.length === 0) dispatch(getSongs());
    this.connectToSC.connectToSCC(dispatch);
    const userRoles: string[] = this.utils.getUserRoles();
    this.setState({ userRoles });
  }

  render(): JSX.Element {
    const { auth } = this.props;
    const { userRoles } = this.state;
    return (
      <div id="App" className="App">
        <Router>
          <AppMain>
            <Switch>
              <Route exact path="/" component={HomePage} />
              {auth.isAuthenticated && auth.user.userType && userRoles.indexOf(auth.user.userType) !== -1
                ? <Route exact path="/map" component={GoogleMap} /> : null}
              {auth.isAuthenticated && auth.user.userType && userRoles.indexOf(auth.user.userType) !== -1
                ? <Route exact path="/sort" component={DefaultSort} /> : null}
              <Route exact path="/music" component={DefaultMusic} />
              <Route path="/music/buymusic" component={BuyMusic} />
              <Route path="/music/originals" component={DefaultSongs} />
              <Route path="/music/songs" component={DefaultSongs} />
              {auth.isAuthenticated && auth.user.userType && userRoles.indexOf(auth.user.userType) !== -1
                ? <Route path="/music/dashboard" component={DefaultMusicDashboard} /> : null}
              <Route component={AppFourOhFour} />
            </Switch>
          </AppMain>
        </Router>
      </div>
    );
  }
}

export default connect(mapStoreToProps, null)(App);
