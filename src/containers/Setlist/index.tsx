import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  Box, CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Typography,
} from '@mui/material';
import { AuthContext } from 'src/providers/Auth.provider';
import type { Isong } from 'src/providers/Data.provider';
import commonUtils from 'src/lib/utils';
import setlistUtils, { ISetlist } from './setlist.utils';
import { PerformanceViewer } from './PerformanceViewer';
import { SetlistBuilderDialog } from './SetlistBuilderDialog';
import './setlist.scss';

export function Setlist(): React.JSX.Element {
  const { auth } = useContext(AuthContext);
  const isAdmin = setlistUtils.isUserAdmin(auth);

  const [setlists, setSetlists] = useState<ISetlist[]>([]);
  const [selectedSetlistId, setSelectedSetlistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [songCatalog, setSongCatalog] = useState<Isong[]>([]);

  // Builder dialog state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderSetlist, setBuilderSetlist] = useState<ISetlist | null>(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [setlistToDelete, setSetlistToDelete] = useState<ISetlist | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    commonUtils.setTitleAndScroll('Setlists', window.screen.width);
  }, []);

  const loadSetlists = useCallback(async (preferredId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await setlistUtils.getSetlists();
      setSetlists(data);
      if (data.length > 0) {
        if (preferredId && data.some((s) => s._id === preferredId)) {
          setSelectedSetlistId(preferredId);
        } else {
          setSelectedSetlistId((prev) => (prev && data.some((s) => s._id === prev) ? prev : data[0]._id || null));
        }
      } else {
        setSelectedSetlistId(null);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load setlists');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    try {
      const songs = await setlistUtils.getSongCatalog();
      setSongCatalog(songs);
    } catch {
      // Ignore background catalog loading failure
    }
  }, []);

  useEffect(() => {
    void loadSetlists();
    void loadCatalog();
  }, [loadSetlists, loadCatalog]);

  const selectedSetlist = setlists.find((s) => s._id === selectedSetlistId) || null;

  const handleSelectSetlist = (id: string) => {
    setSelectedSetlistId(id);
  };

  const handleNewSetlist = () => {
    setBuilderSetlist(null);
    setIsBuilderOpen(true);
  };

  const handleEditSetlist = (setlist: ISetlist) => {
    setBuilderSetlist(setlist);
    setIsBuilderOpen(true);
  };

  const handleDeleteSetlistPrompt = (setlist: ISetlist) => {
    setSetlistToDelete(setlist);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!setlistToDelete?._id) return;
    setDeleteLoading(true);
    try {
      await setlistUtils.deleteSetlist(auth.token, setlistToDelete._id);
      commonUtils.notify('Success', 'Setlist deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSetlistToDelete(null);
      await loadSetlists();
    } catch (err) {
      commonUtils.notify('Error', (err as Error).message || 'Failed to delete setlist', 'danger');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveSetlist = async (payload: Partial<ISetlist>) => {
    if (builderSetlist?._id) {
      const updated = await setlistUtils.updateSetlist(auth.token, builderSetlist._id, payload);
      commonUtils.notify('Success', 'Setlist updated successfully', 'success');
      await loadSetlists(updated._id);
    } else {
      const created = await setlistUtils.createSetlist(auth.token, payload);
      commonUtils.notify('Success', 'Setlist created successfully', 'success');
      await loadSetlists(created._id);
    }
  };

  return (
    <div id="pageContent" className="page-content">
      <Box className="setlist-container" data-testid="setlist-page-container">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} data-testid="setlist-page-error">
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }} data-testid="setlist-loading-spinner">
            <CircularProgress />
          </Box>
        ) : (
          <PerformanceViewer
            setlist={selectedSetlist}
            setlists={setlists}
            onSelectSetlist={handleSelectSetlist}
            isAdmin={isAdmin}
            onNewSetlist={handleNewSetlist}
            onEditSetlist={handleEditSetlist}
            onDeleteSetlist={handleDeleteSetlistPrompt}
          />
        )}

        {/* Builder Dialog */}
        <SetlistBuilderDialog
          open={isBuilderOpen}
          onClose={() => setIsBuilderOpen(false)}
          onSave={handleSaveSetlist}
          initialSetlist={builderSetlist}
          songCatalog={songCatalog}
        />

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <Dialog
            open={true}
            onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
            data-testid="delete-setlist-dialog"
          >
            <DialogTitle>Delete Setlist</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                Are you sure you want to delete &ldquo;
                {setlistToDelete?.title || setlistToDelete?.name || 'Untitled Setlist'}
                &rdquo;? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteLoading}
                data-testid="cancel-delete-setlist-btn"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                data-testid="confirm-delete-setlist-btn"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </div>
  );
}

export default Setlist;
