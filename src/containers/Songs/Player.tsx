
import { useContext } from 'react';
import { DataContext, Isong } from 'src/providers/Data.provider';
import DefaultMusicPlayer from '../../components/MusicPlayer';

type Props = {
  songArr?:Isong[]
};
export function Player({ songArr }:Props):JSX.Element {
  const { songs } = useContext(DataContext);
  const sArr = songArr || songs;
  return (
    <div className="playerDiv" style={{ maxWidth: '5in', margin: 'auto', textAlign: 'center' }}>
      <div id="playerAndButtons">
        {sArr[0]._id !== '' ? <DefaultMusicPlayer filterBy="original" songs={sArr} /> : null}
      </div>
    </div>
  );
}
export default Player;
