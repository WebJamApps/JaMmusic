import React from 'react';
import DefaultMusicPlayer from '../../components/MusicPlayer';
import { SongsContext, ISong } from '../../providers/Songs.provider';

type Props = {
  songArr?:ISong[]
};
export const Player = ({ songArr }:Props):JSX.Element => {
  const { songs } = React.useContext(SongsContext);
  const sArr = songArr || songs;
  return (
    <div className="playerDiv" style={{ maxWidth: '5in', margin: 'auto', textAlign: 'center' }}>
      <div id="playerAndButtons">
        {sArr[0]._id !== '' ? <DefaultMusicPlayer filterBy="original" songs={sArr} /> : null}
      </div>
    </div>
  );
};
export default Player;
