import React, { Component, Dispatch } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import DefaultSort from '../containers/SortContainer';
import DefaultMusic from '../containers/Music';
import DefaultMusicDashboard from '../containers/MusicDashboard';
import BuyMusic from '../containers/BuyMusic';
import AppFourOhFour from './404';
import GoogleMap from '../containers/GoogleMap';
import ATemplate from './AppTemplate';
import DefaultSongs from '../containers/Songs';
import HomePage from '../containers/Homepage';
import connectToSC from './connectToSC';
import mapStoreToProps, { Iimage, Auth } from '../redux/mapStoreToProps';
import PrivateRoute from './PrivateRoute';

export interface AppProps {
  dispatch: Dispatch<unknown>;
  images: Iimage[];
  auth: Auth;
}

export class App extends Component<AppProps> {
  connectToSC: typeof connectToSC;

  appName = process.env.APP_NAME || '';

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
    this.connectToSC = connectToSC;
  }

  async componentDidMount(): Promise<void> {
    const { dispatch } = this.props;
    this.connectToSC.connectToSCC(dispatch);
  }

  render(): JSX.Element {
    console.log(`app name: ${this.appName}`);
    return (
      <div id="App" className="App">
        <Router>
          <ATemplate>
            <Switch>
              <Route
                exact
                path="/"
                component={
              this.appName === 'web-jam.com' ? HomePage : DefaultMusic
              }
              />
              <PrivateRoute Container={GoogleMap} path="/map" />
              <PrivateRoute path="/sort" Container={DefaultSort} />
              <Route exact path="/music" component={DefaultMusic} />
              <Route exact path="/music/buymusic" component={BuyMusic} />
              <Route exact path="/music/originals" component={DefaultSongs} />
              <Route exact path="/music/songs" component={DefaultSongs} />
              <PrivateRoute path="/music/dashboard" Container={DefaultMusicDashboard} />
              <Route component={AppFourOhFour} />
            </Switch>
          </ATemplate>
        </Router>
      </div>
    );
  }
}

export default connect(mapStoreToProps, null)(App);
