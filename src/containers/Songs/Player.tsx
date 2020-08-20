import React, { useContext } from 'react';
import DefaultMusicPlayer from '../../components/MusicPlayer';
import { SongsContext } from '../../providers/Songs.provider';

export const Player = ():JSX.Element => {
  const { test, songs } = useContext(SongsContext);
  // eslint-disable-next-line no-console
  console.log(test);
  return (
    <div className="playerDiv" style={{ maxWidth: '5in', margin: 'auto', textAlign: 'center' }}>
      <div id="playerAndButtons">
        <DefaultMusicPlayer filterBy="original" songs={songs} />
      </div>
    </div>
  );
};
export default Player;
