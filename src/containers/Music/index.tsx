import { useEffect, useState, useContext } from 'react';
import { AuthContext, Iauth } from 'src/providers/Auth.provider';
import { PicSlider } from 'src/containers/Music/Pictures/PicSlider';
import commonUtils from 'src/lib/utils';
import { Gigs } from './Gigs';
import { Intro } from './intro';
import JoshBio from './joshBio';
import MariaBio from './mariaBio';
import { CreatePicDialog } from './Pictures/CreatePicDialog';
import { EditPicTable } from './Pictures/EditPicTable';

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

interface IphotosSectionProps {
  showEditPicTable: boolean, setShowEditPicTable: (arg0: boolean) => void, isAdmin: boolean,
  setShowCreatePic: (arg0: boolean) => void, showCreatePic: boolean,
}
export function PhotosSection(props: IphotosSectionProps) {
  const {
    showEditPicTable, setShowEditPicTable, isAdmin, setShowCreatePic, showCreatePic,
  } = props;
  return (
    <div style={{ paddingTop: '1px', paddingBottom: 0, marginBottom: 0 }}>
      <div id="musicSlide1">
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

export function Music(): JSX.Element {
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
          position: 'relative', overflowX: 'auto', maxWidth: '96%', margin: 'auto', zIndex: 0,
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
