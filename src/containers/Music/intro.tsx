import { Button } from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

export function ClickToListen({ appName = '', isAdmin }: { appName?: string, isAdmin:boolean }) {
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
              onClick={() => console.log('createPic')}
            >
              Add Pic
            </Button>
            <Button
              startIcon={<Edit />}
              sx={{ marginLeft: '10px' }}
              variant="outlined"
              className="editPicButton"
              onClick={() => console.log('editPic')}
            >
              Edit Pic
            </Button>
          </>
        ) : null}
    </div>
  );
}

export function Intro({ isAdmin }:{ isAdmin:boolean }): JSX.Element {
  return (
    <div
      className="intro"
      style={{
        margin: 'auto', maxWidth: '900px', padding: '6px', paddingBottom: 0,
      }}
    >
      <ClickToListen appName={process.env.APP_NAME} isAdmin={isAdmin} />
      <p style={{ marginTop: '10px', marginBottom: '6px' }}>
        Josh and Maria have been performing their music together for over 10 years now!
        Whether it is at church, charity events, public venues, or outdoor festivals, this couple will blow your socks off.
      </p>
    </div>
  );
}
