import { Button } from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

interface IclickToListenProps {
  appName?: string, isAdmin:boolean, setShowCreatePic:(arg0:boolean)=>void, setShowEditPic:(arg0:boolean)=>void
}
export function ClickToListen(props:IclickToListenProps) {
  const {
    appName, isAdmin, setShowCreatePic, setShowEditPic,
  } = props;
  const history = useHistory();
  const handleClick = () => {
    if (appName === 'joshandmariamusic.com') return window.open('https://web-jam.com/music/songs');
    return history.push('/music/songs');
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
              Edit Pic
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
      <p style={{ marginTop: '10px', marginBottom: '6px' }}>
        Josh and Maria have been performing their music together for over 10 years now!
        Whether it is at church, charity events, public venues, or outdoor festivals, this couple will blow your socks off.
      </p>
    </div>
  );
}
