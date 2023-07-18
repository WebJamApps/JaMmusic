import { ReactNotifications } from 'react-notifications-component';
import {
  BrowserRouter, Navigate, Route, Routes,
} from 'react-router-dom';
import { NewHomepage } from 'src/containers/NewHomepage';
import { SortContainer } from '../containers/SortContainer';
import BuyMusic from '../containers/BuyMusic';
import GoogleMap from '../containers/GoogleMap';
import { Music } from '../containers/Music';
import { AppTemplate } from './AppTemplate';
import { Songs } from '../containers/Songs';
// import { Homepage } from '../containers/Homepage';
import { BookUs } from '../containers/BookUs';
import { Tipjar } from '../containers/Tipjar';

export function checkAppName() {
  return process.env.APP_NAME === 'web-jam.com'
    // ? <Homepage /> : <Music />;
    ? <NewHomepage /> : <Music />;
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
            <Route path="/sort" element={<SortContainer />} />
            {checkBackendUrl()}
            <Route path="/new-homepage" element={<NewHomepage />} />
            <Route path="/music" element={<Music />} />
            <Route path="/music/buymusic" element={<BuyMusic />} />
            <Route path="/music/songs" element={<Songs />} />
            <Route path="/music/bookus" element={<BookUs />} />
            <Route path="/music/tipjar" element={<Tipjar />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppTemplate>
      </BrowserRouter>
    </div>
  );
}
