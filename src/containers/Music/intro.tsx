import { Button } from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface IclickToListenProps {
  appName?: string, isAdmin:boolean, setShowCreatePic:(arg0:boolean)=>void, setShowEditPic:(arg0:boolean)=>void
}
export function ClickToListen(props:IclickToListenProps) {
  const {
    appName, isAdmin, setShowCreatePic, setShowEditPic,
  } = props;
  const navigate = useNavigate();
  const handleClick = () => {
    if (appName === 'joshandmariamusic.com') window.open('https://web-jam.com/music/songs');
    else navigate('/music/songs');
  };
  return (
    <div style={{ margin: 'auto', textAlign: 'center' }}>
      <Button variant="contained" className="clickToListen" onClick={handleClick}>Click To Listen</Button>
      {isAdmin
        ? (
          <>
            <Button
              startIcon={<Add />}
              sx={{ marginLeft: '10px' }}
              variant="outlined"
              className="createPicButton"
              onClick={() => setShowCreatePic(true)}
            >
              Add Pic
            </Button>
            <Button
              startIcon={<Edit />}
              sx={{ marginLeft: '10px' }}
              variant="outlined"
              className="editPicButton"
              onClick={() => setShowEditPic(true)}
            >
              Edit&nbsp;Pic
            </Button>
          </>
        ) : null}
    </div>
  );
}

interface IintroProps {
  isAdmin:boolean, setShowCreatePic:(arg0:boolean)=>void, setShowEditPic:(arg0:boolean)=>void
}
export function Intro(props:IintroProps): JSX.Element {
  const { isAdmin, setShowCreatePic, setShowEditPic } = props;
  return (
    <div
      className="intro"
      style={{
        margin: 'auto', maxWidth: '900px', padding: '6px', paddingBottom: 0,
      }}
    >
      <ClickToListen
        appName={process.env.APP_NAME}
        isAdmin={isAdmin}
        setShowCreatePic={setShowCreatePic}
        setShowEditPic={setShowEditPic}
      />
      <h5 style={{ marginTop: '10px', marginBottom: '6px', fontWeight: 'normal' }}>
        <strong>Josh and Maria</strong>
        {' '}
        &mdash; acoustic husband-and-wife duo from Salem, Virginia. Originals plus a wide-ranging cover set across folk,
        rock, country, Christian, and Americana. We play churches, taprooms, festivals, weddings, and private events across
        the East Coast &mdash; Virginia, North Carolina, and South Carolina.
      </h5>
    </div>
  );
}
