import { ToastContainer } from 'react-toastify';
import {
  BrowserRouter, Navigate, Route, Routes,
} from 'react-router-dom';
import { Homepage } from 'src/containers/Homepage';
import { AdminUsers } from '../containers/AdminUsers';
import { AdminVenues } from '../containers/AdminVenues';
import { AdminOutreach } from '../containers/AdminOutreach';
import { AdminTemplates } from '../containers/AdminTemplates';
import BuyMusic from '../containers/BuyMusic';
import { Music } from '../containers/Music';
import { AppTemplate } from './AppTemplate';
import { Songs } from '../containers/Songs';
import { BookUs } from '../containers/BookUs';
import { Tipjar } from '../containers/Tipjar';

export function checkAppName() {
  return process.env.APP_NAME === 'web-jam.com'
    ? <Homepage /> : <Music />;
}

export function App() {
  return (
    <div id="App" className="App">
      <ToastContainer position="top-right" autoClose={5000} />
      <BrowserRouter>        <AppTemplate>
        <Routes>
          <Route
            path="/"
            element={checkAppName()}
          />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/venues" element={<AdminVenues />} />
          <Route path="/admin/outreach" element={<AdminOutreach />} />
          <Route path="/admin/templates" element={<AdminTemplates />} />
          <Route path="/new-homepage" element={<Homepage />} />
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
