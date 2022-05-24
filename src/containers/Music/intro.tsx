import { Button } from '@mui/material';
import { useHistory } from 'react-router-dom';

export const ClickToListen = () => {
  const history = useHistory();
  const handleClick = () => {
    if (process.env.APP_NAME === 'joshandmariamusic.com') return window.open('https://web-jam.com/music/songs');
    return history.push('/music/songs');
  };
  return (
    <div style={{ margin: 'auto', textAlign: 'center' }} >
      <Button variant="contained" className="clickToListen" onClick={handleClick}>Click To Listen</Button>
    </div>
  );
};

export const Intro = (): JSX.Element => (
  <div
    className="intro"
    style={{
      margin: 'auto', maxWidth: '900px', padding: '6px', paddingBottom: 0,
    }}
  >
    <ClickToListen />
    <p style={{ marginTop: '10px', marginBottom: '6px' }}>
      Josh and Maria have been performing their music together for over 10 years now!
      Whether it is at church, charity events, public venues, or outdoor festivals, this couple will blow your socks off.
    </p>
  </div>
);
