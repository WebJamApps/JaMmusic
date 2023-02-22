import { ReactNotifications } from 'react-notifications-component';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DefaultSort from '../containers/SortContainer';
import BuyMusic from '../containers/BuyMusic';
import GoogleMap from '../containers/GoogleMap';
import { Music } from '../containers/Music';
import { AppTemplate } from './AppTemplate';
import { Songs } from '../containers/Songs';
import { Homepage } from '../containers/Homepage';

export function checkAppName() {
  return process.env.APP_NAME === 'web-jam.com'
    ? <Homepage /> : <Music />;
}

export function checkBackendUrl() {
  return process.env.BackendUrl === 'http://localhost:7000'
    ? <Route path="/map" element={<GoogleMap />} /> : null;
}

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
