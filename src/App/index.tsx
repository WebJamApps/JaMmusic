import {
  Component, Dispatch, ReactElement, StrictMode,
} from 'react';
import { ReactNotifications } from 'react-notifications-component';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import mapStoreToProps from 'src/redux/mapStoreToProps';
import DefaultSort from '../containers/SortContainer';
import BuyMusic from '../containers/BuyMusic';
import AppFourOhFour from './404';
import GoogleMap from '../containers/GoogleMap';
import { Music } from '../containers/Music';
import ATemplate from './AppTemplate';
import DefaultSongs from '../containers/Songs';
import HomePage from '../containers/Homepage';
import connectToSC from './connectToSC';
import { PrivateRoute } from './PrivateRoute';

export interface AppProps {
  dispatch?: Dispatch<unknown>;
  showMap: boolean;
  heartBeat?:string;
  children?: ReactElement<any, any>;
  userCount?:number;
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
            <ATemplate {...this.props}>
              <Switch>
                {process.env.APP_NAME === 'web-jam.com'
                  ? <Route exact path="/" component={HomePage} />
                  : <Route exact path="/music" component={Music} />}
                {process.env.BackendUrl === 'http://localhost:7000'
                  ? <PrivateRoute Container={GoogleMap} path="/map" /> : null}
                <PrivateRoute path="/sort" Container={DefaultSort} />
                <Route exact path="/music" component={Music} />
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
