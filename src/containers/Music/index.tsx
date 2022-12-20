import { useEffect, useState, useContext } from 'react';
import { AuthContext, Iauth } from 'src/providers/Auth.provider';
import { PicSlider } from 'src/containers/Music/Pictures/PicSlider';
import commonUtils from 'src/lib/commonUtils';
import { Gigs } from './Gigs';
import { Intro } from './intro';
import JoshBio from './joshBio';
import MariaBio from './mariaBio';

export function Musicians(): JSX.Element {
  return (
    <div className="elevation3" style={{ maxWidth: '1000px', margin: 'auto' }}>
      <section>
        <JoshBio />
        <hr />
        <MariaBio />
      </section>
      <p>{' '}</p>
      <p>{' '}</p>
    </div>
  );
}

export function checkIsAdmin(auth: Iauth, setIsAdmin: (arg0: boolean) => void) {
  let isAdmin = false;
  if (auth && auth.isAuthenticated && process.env.userRoles) {
    const { user: { userType } } = auth;
    const rolesJSON = JSON.parse(process.env.userRoles);
    const { roles } = rolesJSON;
    if (userType && roles.includes(userType)) isAdmin = true;
  }
  setIsAdmin(isAdmin);
}

export function Music(): JSX.Element {
  const { auth } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => commonUtils.setTitleAndScroll('Music', window.screen.width), []);
  useEffect(() => {
    checkIsAdmin(auth, setIsAdmin);
  }, [auth]);
  console.log('music page');
  return (
    <div className="page-content music">
      <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
        <div id="musicSlide1">
          <PicSlider />
        </div>
        <Intro isAdmin={isAdmin} />
      </div>
      <div
        className="search-table-outer"
        style={{
          position: 'relative', overflowX: 'auto', maxWidth: '96%', margin: 'auto', zIndex: 0,
        }}
      >
        <Gigs isAdmin={isAdmin} />
      </div>
      <div style={{ height: '10px' }}>
        <p>{' '}</p>
      </div>
      <Musicians />
    </div>
  );
}
