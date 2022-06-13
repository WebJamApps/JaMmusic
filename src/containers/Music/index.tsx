import { useEffect, useState } from 'react';
import PicSlider from 'src/components/PicSlider';
import { Gigs } from '../../components/Gigs';
import type { Iimage, Auth } from '../../redux/mapStoreToProps';
import { Intro } from './intro';
import JoshBio from './joshBio';
import MariaBio from './mariaBio';
import WjBand from './wjBand';
import commonUtils from '../../lib/commonUtils';

export const Musicians = (): JSX.Element => {
  return (
    <div className="elevation3" style={{ maxWidth: '1000px', margin: 'auto' }}>
      <section>
        <JoshBio />
        <hr />
        <MariaBio />
        <hr />
        <WjBand />
      </section>
      <p>{' '}</p>
      <p>{' '}</p>
    </div>
  );
};

export function checkIsAdmin(auth: Auth | null, setIsAdmin: (arg0: boolean) => void) {
  let isAdmin = false;
  if (auth && auth.isAuthenticated && process.env.userRoles) {
    const { user: { userType } } = auth;
    const rolesJSON = JSON.parse(process.env.userRoles);
    const { roles } = rolesJSON;
    if (userType && roles.includes(userType)) isAdmin = true;
  }
  setIsAdmin(isAdmin);
}

interface ImusicNewProps {
  images?: Iimage[]
  auth: Auth | null;
}
export const Music = ({ images, auth }: ImusicNewProps): JSX.Element => {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => commonUtils.setTitleAndScroll('Music', window.screen.width), []);
  useEffect(() => {
    checkIsAdmin(auth, setIsAdmin);
  }, [auth]);
  const data = Array.isArray(images) ? images : [];
  return (
    <div className="page-content">
      <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
        <div id="musicSlide1">
          {data.length > 0 ? (<PicSlider data={data} />) : null}
        </div>
        <Intro />
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

};
