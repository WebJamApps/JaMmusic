import { CircularProgress } from '@mui/material';
import { useEffect, useContext } from 'react';
import commonUtils from 'src/lib/commonUtils';
import { DataContext, Isong } from 'src/providers/Data.provider';
import { MusicPlayer } from './MusicPlayer';

export function Player({ songs }: { songs: Isong[] | null }): JSX.Element {
  if (!Array.isArray(songs) || songs.length === 0) return <CircularProgress />;
  return (
    <div className="playerDiv" style={{ maxWidth: '5in', margin: 'auto', textAlign: 'center' }}>
      <div id="playerAndButtons">
        <MusicPlayer filterBy="original" songs={songs} />
      </div>
    </div>
  );
}

export function Songs() {
  const { songs } = useContext(DataContext);
  useEffect(() => {
    commonUtils.setTitleAndScroll('Songs', window.screen.width);
  }, []);
  return (
    <div id="pageContent" className="page-content">
      <Player songs={songs} />
    </div>
  );
}
