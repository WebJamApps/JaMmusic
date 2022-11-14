import { Component, Dispatch, StrictMode } from 'react';
import { ReactNotifications } from 'react-notifications-component';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import DefaultSort from '../containers/SortContainer';
import BuyMusic from '../containers/BuyMusic';
import AppFourOhFour from './404';
import GoogleMap from '../containers/GoogleMap';
import { Music } from '../containers/Music';
import ATemplate from './AppTemplate';
import DefaultSongs from '../containers/Songs';
import HomePage from '../containers/Homepage';
import connectToSC from './connectToSC';
import mapStoreToProps, { Iimage } from '../redux/mapStoreToProps';
import { PrivateRoute } from './PrivateRoute';

const defaultProps = {
  dispatch: () => {},
  auth: {
    isAuthenticated: false, token: '', error: '', user: { userType: '', email: '' },
  },
  userCount: 0,
  heartBeat: 'white',
  children: <div />,
};

export interface AppProps {
  dispatch?: Dispatch<unknown>;
  images: Iimage[];
  showMap: boolean;
}

export class App extends Component<AppProps> {
  connectToSC: typeof connectToSC;

  appName = process.env.APP_NAME || 'web-jam.com';

  constructor(props: AppProps) {
    super(props);
    this.connectToSC = connectToSC;
  }

  async componentDidMount(): Promise<void> {
    const { dispatch = () => {} } = this.props;
    this.connectToSC.connectToSCC(dispatch);
  }

  loadMap(): JSX.Element | null {
    if (process.env.BackendUrl === 'http://localhost:7000') {
      return <PrivateRoute Container={GoogleMap} path="/map" />;
    }
    return null;
  }

  render(): JSX.Element {
    const { images } = this.props;
    return (
      <StrictMode>
        <div id="App" className="App">
          <ReactNotifications />
          <Router>
            <ATemplate {...defaultProps}>
              <Switch>
                <Route exact path="/">
                  {this.appName === 'web-jam.com' ? <HomePage />
                    : <Music images={images} />}
                </Route>
                {this.loadMap()}
                <PrivateRoute path="/sort" Container={DefaultSort} />
                <Route exact path="/music"><Music images={images} /></Route>
                <Route exact path="/music/buymusic" component={BuyMusic} />
                <Route exact path="/music/originals" component={DefaultSongs} />
                <Route exact path="/music/songs" component={DefaultSongs} />
                <Route component={AppFourOhFour} />
              </Switch>
            </ATemplate>
          </Router>
        </div>
      </StrictMode>
    );
  }
}

export default connect(mapStoreToProps, null)(App);
