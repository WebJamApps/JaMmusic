import React, { Component, Dispatch } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import DefaultSort from '../containers/SortContainer';
import DefaultMusic from '../containers/Music';
import DefaultMusicDashboard from '../containers/MusicDashboard';
import BuyMusic from '../containers/BuyMusic';
import AppFourOhFour from './404';
import GoogleMap from '../containers/GoogleMap';
import { Gigs }  from '../containers/Gigs';
import ATemplate from './AppTemplate';
import DefaultSongs from '../containers/Songs';
import HomePage from '../containers/Homepage';
import connectToSC from './connectToSC';
import mapStoreToProps, { Iimage, Auth } from '../redux/mapStoreToProps';
import { PrivateRoute } from './PrivateRoute';

export interface AppProps {
  dispatch: Dispatch<unknown>;
  images: Iimage[];
  auth: Auth;
  showMap: boolean;
}

export class App extends Component<AppProps> {
  connectToSC: typeof connectToSC;

  appName = process.env.APP_NAME || 'web-jam.com';

  static defaultProps = {
    dispatch: (): void => { },
    songs: [],
    images: [],
    auth: {
      isAuthenticated: false, token: '', error: '', email: '', user: { userType: '' },
    },
    showMap: false,
  };

  constructor(props: AppProps) {
    super(props);
    this.connectToSC = connectToSC;
  }

  async componentDidMount(): Promise<void> {
    const { dispatch } = this.props;
    this.connectToSC.connectToSCC(dispatch);
  }
  
  loadMap(): any {
    const loadMap = false;
    if (process.env.BackendUrl === 'http://localhost:7000'){
      return <PrivateRoute Container={GoogleMap} path="/map" />;
    } else {
      return null;
    }
  }

  render(): JSX.Element {
    
    return (
      <React.StrictMode>
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
                {this.loadMap()}
                <PrivateRoute path="/sort" Container={DefaultSort} />
                <Route exact path="/music" component={DefaultMusic} />
                <Route exact path="/gigs" component={Gigs} />
                <Route exact path="/music/buymusic" component={BuyMusic} />
                <Route exact path="/music/originals" component={DefaultSongs} />
                <Route exact path="/music/songs" component={DefaultSongs} />
                <PrivateRoute path="/music/dashboard" Container={DefaultMusicDashboard} />
                <Route component={AppFourOhFour} />
              </Switch>
            </ATemplate>
          </Router>
        </div>
      </React.StrictMode>
    );
  }
}

export default connect(mapStoreToProps, null)(App);
