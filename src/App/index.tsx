import {
  Component, Dispatch, ReactElement, StrictMode,
} from 'react';
import { ReactNotifications } from 'react-notifications-component';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import mapStoreToProps from 'src/redux/mapStoreToProps';
import DefaultSort from '../containers/SortContainer';
import BuyMusic from '../containers/BuyMusic';
import GoogleMap from '../containers/GoogleMap';
import { Music } from '../containers/Music';
import { AppTemplate } from './AppTemplate';
import DefaultSongs from '../containers/Songs';
import HomePage from '../containers/Homepage';
import connectToSC from './connectToSC';
import { PrivateRoute } from './PrivateRoute';

export interface AppProps {
  dispatch?: Dispatch<unknown>;
  showMap: boolean;
  heartBeat?: string;
  children?: ReactElement<any, any>;
  userCount?: number;
}
export class App extends Component<AppProps> {
  connectToSC: typeof connectToSC;

  constructor(props: AppProps) {
    super(props);
    this.connectToSC = connectToSC;
  }

  async componentDidMount(): Promise<void> {
    const { dispatch } = this.props;
    if (dispatch) this.connectToSC.connectToSCC(dispatch);
  }

  render(): JSX.Element {
    return (
      <StrictMode>
        <div id="App" className="App">
          <ReactNotifications />
          <Router>
            <AppTemplate {...this.props}>
              {process.env.APP_NAME === 'web-jam.com'
                ? <Route path="/"><HomePage /></Route>
                : <Route path="/"><Music /></Route>}
              <Route path="/sort"><DefaultSort /></Route>
              {process.env.BackendUrl === 'http://localhost:7000'
                ? <PrivateRoute Container={GoogleMap} path="/map" /> : null}
              <Route path="/music"><Music /></Route>
              <Route path="/music/buymusic"><BuyMusic /></Route>
              <Route path="/music/songs"><DefaultSongs /></Route>
            </AppTemplate>
          </Router>
        </div>
      </StrictMode>
    );
  }
}

export default connect(mapStoreToProps, null)(App);
