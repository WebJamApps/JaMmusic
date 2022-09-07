import { Button } from '@mui/material';
import { useHistory } from 'react-router-dom';

export function ClickToListen({ appName = '' }: { appName?: string }) {
  const history = useHistory();
  const handleClick = () => {
    if (appName === 'joshandmariamusic.com') return window.open('https://web-jam.com/music/songs');
    return history.push('/music/songs');
  };
  return (
    <div style={{ margin: 'auto', textAlign: 'center' }}>
      <Button variant="contained" className="clickToListen" onClick={handleClick}>Click To Listen</Button>
    </div>
  );
}

export function Intro(): JSX.Element {
  return (
    <div
      className="intro"
      style={{
        margin: 'auto', maxWidth: '900px', padding: '6px', paddingBottom: 0,
      }}
    >
      <ClickToListen appName={process.env.APP_NAME} />
      <p style={{ marginTop: '10px', marginBottom: '6px' }}>
        Josh and Maria have been performing their music together for over 10 years now!
        Whether it is at church, charity events, public venues, or outdoor festivals, this couple will blow your socks off.
      </p>
    </div>
  );
}
