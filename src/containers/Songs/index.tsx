import { Add, Edit } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { useEffect, useContext, useState } from 'react';
import commonUtils from 'src/lib/utils';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext, Isong } from 'src/providers/Data.provider';
import { checkIsAdmin } from '../Music';
import { MusicPlayer } from './MusicPlayer';
import { CreateSongDialog } from './CreateSongDialog';

interface IplayerProps {
  songs: Isong[] | null, editDialogState: { showEditDialog: boolean, setShowEditDialog: (arg0: boolean) => void }
}
export function Player(props: IplayerProps): JSX.Element {
  const { songs, editDialogState } = props;
  if (!Array.isArray(songs) || songs.length === 0) return <CircularProgress />;
  return (
    <div className="playerDiv" style={{ maxWidth: '5in', margin: 'auto', textAlign: 'center' }}>
      <div id="playerAndButtons">
        <MusicPlayer filterBy="original" songs={songs} editDialogState={editDialogState} />
      </div>
    </div>
  );
}

export function SongButtons({ isAdmin, setShowCreateSong, setShowEditDialog }:
{
  isAdmin: boolean, setShowCreateSong: React.Dispatch<React.SetStateAction<boolean>>,
  setShowEditDialog: React.Dispatch<React.SetStateAction<boolean>>
}) {
  if (isAdmin) {
    return (
      <div style={{
        margin: 'auto', textAlign: 'center', paddingTop: '10px', marginBottom: '10px',
      }}
      >
        <Button
          startIcon={<Add />}
          sx={{ marginLeft: '10px' }}
          variant="outlined"
          className="createSongButton"
          onClick={() => setShowCreateSong(true)}
        >
          Add Song
        </Button>
        <Button
          startIcon={<Edit />}
          sx={{ marginLeft: '10px' }}
          variant="outlined"
          className="editPicButton"
          onClick={() => setShowEditDialog(true)}
        >
          Edit Song
        </Button>
      </div>
    );
  } return null;
}

export function Songs() {
  const { songs } = useContext(DataContext);
  const { auth } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateSong, setShowCreateSong] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  useEffect(() => {
    commonUtils.setTitleAndScroll('Songs', window.screen.width);
  }, []);
  useEffect(() => {
    checkIsAdmin(auth, setIsAdmin);
  }, [auth]);
  return (
    <div id="pageContent" className="page-content">
      <Player songs={songs} editDialogState={{ showEditDialog, setShowEditDialog }} />
      <SongButtons isAdmin={isAdmin} setShowCreateSong={setShowCreateSong} setShowEditDialog={setShowEditDialog} />
      <CreateSongDialog showDialog={showCreateSong} setShowDialog={setShowCreateSong} />
    </div>
  );
}
