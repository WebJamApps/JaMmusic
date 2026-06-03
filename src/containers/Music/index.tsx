import { useEffect, useState, useContext } from 'react';
import { useMediaQuery } from '@mui/material';
import { AuthContext, Iauth } from 'src/providers/Auth.provider';
import { PicSlider } from 'src/containers/Music/Pictures/PicSlider';
import commonUtils from 'src/lib/utils';
import { Gigs } from './Gigs';
import { Intro } from './intro';
import JoshBio from './joshBio';
import MariaBio from './mariaBio';
import { CreatePicDialog } from './Pictures/CreatePicDialog';
import { EditPicTable } from './Pictures/EditPicTable';

export function Musicians() {
  return (
    <div
      className="elevation3"
      style={{
        maxWidth: '1000px', margin: 'auto', padding: '0 16px', boxSizing: 'border-box',
      }}
    >
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

interface IphotosSectionProps {
  showEditPicTable: boolean, setShowEditPicTable: (arg0: boolean) => void, isAdmin: boolean,
  setShowCreatePic: (arg0: boolean) => void, showCreatePic: boolean,
}
export function PhotosSection(props: IphotosSectionProps) {
  const {
    showEditPicTable, setShowEditPicTable, isAdmin, setShowCreatePic, showCreatePic,
  } = props;
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
      {!showEditPicTable && (
        <style>
          {`
            #musicSlide1 img {
              max-height: 70% !important;
              max-width: 100% !important;
              width: auto !important;
              height: auto !important;
              display: inline-block !important;
              object-fit: contain !important;
            }
            #musicSlide1 .slick-slider, 
            #musicSlide1 .slick-list, 
            #musicSlide1 .slick-track, 
            #musicSlide1 .slick-slide, 
            #musicSlide1 .slick-slide > div {
              height: 100% !important;
            }
            #musicSlide1 .slick-slide > div > div {
              width: 100% !important;
              height: 100% !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              background: black !important;
              outline: none !important;
              overflow: hidden !important;
            }
            #musicSlide1 .legend {
              background: rgba(0, 0, 0, 0.7) !important;
              border-radius: 4px !important;
              opacity: 1 !important;
              visibility: visible !important;
              display: block !important;
              position: relative !important;
              color: white !important;
              text-align: center !important;
              font-size: ${isMobile ? '14px' : '17px'} !important;
              width: fit-content !important;
              max-width: 95% !important;
              padding: 8px 16px !important;
              margin: 10px auto 0 !important;
              z-index: 100 !important;
              pointer-events: none;
              white-space: normal !important;
            }
          `}
        </style>
      )}
      <div
        id="musicSlide1"
        style={!showEditPicTable ? {
          height: isMobile ? '300px' : '500px',
          backgroundColor: 'black',
          width: '100%', position: 'relative', overflow: 'hidden',
        } : {}}
      >
        {!showEditPicTable ? <PicSlider /> : <EditPicTable setShowTable={setShowEditPicTable} />}
      </div>
      {showEditPicTable ? null
        : <Intro isAdmin={isAdmin} setShowEditPic={setShowEditPicTable} setShowCreatePic={setShowCreatePic} />}
      <CreatePicDialog showDialog={showCreatePic} setShowDialog={setShowCreatePic} />
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

export function Music() {
  const { auth } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreatePic, setShowCreatePic] = useState(false);
  const [showEditPicTable, setShowEditPicTable] = useState(false);
  useEffect(() => commonUtils.setTitleAndScroll('Music', window.screen.width), []);
  useEffect(() => {
    checkIsAdmin(auth, setIsAdmin);
  }, [auth]);
  return (
    <div className="page-content music">
      <PhotosSection
        showEditPicTable={showEditPicTable}
        setShowEditPicTable={setShowEditPicTable}
        isAdmin={isAdmin}
        setShowCreatePic={setShowCreatePic}
        showCreatePic={showCreatePic}
      />
      <div
        className="search-table-outer"
        style={{
          position: 'relative', overflowX: 'auto', width: '100%', margin: 'auto', zIndex: 0, WebkitOverflowScrolling: 'touch',
        }}
      >
        {showEditPicTable ? null : <Gigs isAdmin={isAdmin} />}
      </div>
      <div style={{ height: '10px' }}>
        <p>{' '}</p>
      </div>
      {showEditPicTable ? null : <Musicians />}
    </div>
  );
}
