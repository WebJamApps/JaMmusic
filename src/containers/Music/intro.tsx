import { Button, IconButton, Tooltip } from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface IclickToListenProps {
  appName?: string, isAdmin: boolean, setShowCreatePic: (arg0: boolean) => void, setShowEditPic: (arg0: boolean) => void
}
export function ClickToListen(props: IclickToListenProps) {
  const {
    appName, isAdmin, setShowCreatePic, setShowEditPic,
  } = props;
  const navigate = useNavigate();
  const handleClick = () => {
    if (appName === 'joshandmariamusic.com') window.open('https://web-jam.com/music/songs');
    else navigate('/music/songs');
  };
  const handleTipClick = () => {
    if (appName === 'joshandmariamusic.com') window.open('https://web-jam.com/music/tipjar');
    else navigate('/music/tipjar');
  };
  return (
    <div
      style={{
        margin: 'auto', textAlign: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px',
      }}
    >
      <Button variant="contained" className="clickToListen" onClick={handleClick}>Click To Listen</Button>
      <Tooltip title="Leave us a tip — Phil the Tip Jar" placement="top">
        <IconButton
          className="philTipJar"
          onClick={handleTipClick}
          aria-label="Leave a tip with Phil the Tip Jar"
          sx={{
            p: '4px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform .15s ease',
            '&:hover': { transform: 'scale(1.08)', backgroundColor: 'transparent' },
          }}
        >
          <img src="/imgs/phil-tip-jar.svg" alt="Phil the Tip Jar" style={{ height: '120px', width: 'auto', display: 'block' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>Leave a tip!</span>
        </IconButton>
      </Tooltip>
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
  isAdmin: boolean, setShowCreatePic: (arg0: boolean) => void, setShowEditPic: (arg0: boolean) => void
}
export function Intro(props: IintroProps) {
  const { isAdmin, setShowCreatePic, setShowEditPic } = props;
  return (
    <div
      className="intro"
      style={{
        margin: 'auto', maxWidth: '900px', padding: '6px 16px', paddingBottom: 0,
      }}
    >
      <ClickToListen
        appName={process.env.APP_NAME}
        isAdmin={isAdmin}
        setShowCreatePic={setShowCreatePic}
        setShowEditPic={setShowEditPic}
      />
      <p style={{ marginTop: '10px', marginBottom: '6px', fontWeight: 'normal', padding: '0 16px' }}>
        We&rsquo;re
        {' '}
        <strong>Josh and Maria Sherman</strong>
        {' '}
        &mdash; an acoustic husband-and-wife duo based in Salem, Virginia. Our music blends original songs with an
        eclectic mix of folk, rock, country, Christian, and Americana favorites. Whether we&rsquo;re playing a church
        service, taproom, festival, farmer&rsquo;s market, or private event, our goal is simple: to create a warm,
        memorable experience that feels personal and genuine.
        We perform throughout Virginia, North Carolina, and South Carolina, bringing a mix of strong harmonies,
        acoustic energy, and songs people love to sing along with.
      </p>
    </div>
  );
}
