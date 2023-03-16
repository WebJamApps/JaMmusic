import { Add } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { useEffect, useContext, useState } from 'react';
import commonUtils from 'src/lib/utils';
import { AuthContext } from 'src/providers/Auth.provider';
import { DataContext, Isong } from 'src/providers/Data.provider';
import { checkIsAdmin } from '../Music';
import { MusicPlayer } from './MusicPlayer';
import { CreateSongDialog } from './CreateSongDialog';

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
  const { auth } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateSong, setShowCreateSong] = useState(false);
  // const [showEditSong, setShowEditSong] = useState(false);
  useEffect(() => {
    commonUtils.setTitleAndScroll('Songs', window.screen.width);
  }, []);
  useEffect(() => {
    checkIsAdmin(auth, setIsAdmin);
  }, [auth]);
  return (
    <div id="pageContent" className="page-content">
      <Player songs={songs} />
      {isAdmin
        ? (
          <div style={{ margin: 'auto', textAlign: 'center', paddingTop: '10px' }}>
            <Button
              startIcon={<Add />}
              sx={{ marginLeft: '10px' }}
              variant="outlined"
              className="createSongButton"
              onClick={() => setShowCreateSong(true)}
            >
              Add Song
            </Button>
            {/* <Button
              startIcon={<Edit />}
              sx={{ marginLeft: '10px' }}
              variant="outlined"
              className="editPicButton"
              onClick={() => setShowEditSong(true)}
            >
              Edit Song
            </Button> */}
          </div>
        ) : null}
      <CreateSongDialog showDialog={showCreateSong} setShowDialog={setShowCreateSong} />
    </div>
  );
}
