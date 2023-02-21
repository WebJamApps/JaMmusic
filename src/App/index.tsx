// import {
//   Component, Dispatch, ReactElement,
// } from 'react';
import { ReactNotifications } from 'react-notifications-component';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import { connect } from 'react-redux';
// import mapStoreToProps from 'src/redux/mapStoreToProps';
import DefaultSort from '../containers/SortContainer';
import BuyMusic from '../containers/BuyMusic';
import GoogleMap from '../containers/GoogleMap';
import { Music } from '../containers/Music';
import { AppTemplate } from './AppTemplate';
import { Songs } from '../containers/Songs';
import { Homepage } from '../containers/Homepage';
// import connectToSC from './connectToSC';

export function checkAppName() {
  return process.env.APP_NAME === 'web-jam.com'
    ? <Homepage /> : <Music />;
}

export function checkBackendUrl() {
  return process.env.BackendUrl === 'http://localhost:7000'
    ? <Route path="/map" element={<GoogleMap />} /> : null;
}

// export interface AppProps {
//   dispatch?: Dispatch<unknown>;
//   showMap: boolean;
//   heartBeat?: string;
//   children?: ReactElement<any, any>;
//   userCount?: number;
// }
// export class App extends Component<AppProps> {
//   connectToSC: typeof connectToSC;

//   constructor(props: AppProps) {
//     super(props);
//     this.connectToSC = connectToSC;
//   }

//   async componentDidMount(): Promise<void> {
//     const { dispatch } = this.props;
//     if (dispatch) this.connectToSC.connectToSCC(dispatch);
//   }

export function App(): JSX.Element {
  return (
    <div id="App" className="App">
      <ReactNotifications />
      <BrowserRouter>
        <AppTemplate>
          <Routes>
            <Route
              path="/"
              element={checkAppName()}
            />
            <Route path="/sort" element={<DefaultSort />} />
            {checkBackendUrl()}
            <Route path="/music" element={<Music />} />
            <Route path="/music/buymusic" element={<BuyMusic />} />
            <Route path="/music/songs" element={<Songs />} />
          </Routes>
        </AppTemplate>
      </BrowserRouter>
    </div>
  );
}
// }

// export default connect(mapStoreToProps, null)(App);
