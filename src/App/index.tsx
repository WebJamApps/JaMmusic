import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import DefaultMusic from '../containers/Music';
import DefaultMusicDashboard from '../containers/MusicDashboard';
import BuyMusic from '../containers/BuyMusic';
import ShopMain from '../containers/Shop/ShopMain';
import AppFourOhFour from './404';
import AppMain from './app-main';
import DefaultOriginals from '../containers/Originals';
import HomePage from '../containers/Homepage';
import connectToSC from './connectToSC';
import mapStoreToProps from '../redux/mapStoreToProps';
import getSongs from './songsActions';

export interface AppProps {
  dispatch: (...args: any[]) => any;
  songs: {}[];
  images: {}[];
  auth: {
    user: {
      userType?: string;
    };
    isAuthenticated?: boolean;
  };
}
export class App extends Component<AppProps> {
  connectToSC: any;

  static defaultProps = {
    dispatch: () => {},
    songs: [],
    images: [],
    auth: { isAuthenticated: false, user: { userType: '' } },
  };

  constructor(props: any) {
    super(props);
    this.connectToSC = connectToSC;
  }

  async componentDidMount() {
    const { dispatch, songs } = this.props;
    if (songs.length === 0) dispatch(getSongs());
    await this.connectToSC.connectToSCC(dispatch);
  }

  render() {
    const { auth } = this.props;
    return (
      <div id="App" className="App">
        <Router>
          <AppMain>
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/music" component={DefaultMusic} />
              <Route path="/music/buymusic" component={BuyMusic} />
              <Route path="/music/originals" component={DefaultOriginals} />
              {auth.isAuthenticated && auth.user.userType === 'Developer' ? (
                <Route
                  path="/music/dashboard"
                  component={DefaultMusicDashboard}
                />
              ) : null}
              <Route path="/shop" component={ShopMain} />
              <Route component={AppFourOhFour} />
            </Switch>
          </AppMain>
        </Router>
      </div>
    );
  }
}

export default connect(mapStoreToProps, null)(App);
