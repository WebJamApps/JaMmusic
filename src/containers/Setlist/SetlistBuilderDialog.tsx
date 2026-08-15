import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, IconButton, Autocomplete,
  Tabs, Tab, Alert, Card, CardContent, Divider, Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  QueueMusic as QueueMusicIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import type { Isong } from 'src/providers/Data.provider';
import {
  ISetlist, ISetlistItem, reorderItems, normalizeItemOrders,
  parseDuration, formatDuration, formatSongDuration, calculateTotalDuration,
} from './setlist.utils';

export interface ISetlistBuilderDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: Partial<ISetlist>) => Promise<void>;
  initialSetlist?: ISetlist | null;
  songCatalog: Isong[];
}

export function SetlistBuilderDialog(props: ISetlistBuilderDialogProps): React.JSX.Element {
  const {
    open,
    onClose,
    onSave,
    initialSetlist,
    songCatalog,
  } = props;

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gigDate, setGigDate] = useState('');
  const [items, setItems] = useState<ISetlistItem[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Add song mode
  const [addModeTab, setAddModeTab] = useState<0 | 1>(0); // 0 = Catalog, 1 = Custom
  const [selectedCatalogSong, setSelectedCatalogSong] = useState<Isong | null>(null);

  // Custom song inputs
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [customCapo, setCustomCapo] = useState('');
  const [customTempo, setCustomTempo] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [customLeadSheetUrl, setCustomLeadSheetUrl] = useState('');
  const [customPlayLink, setCustomPlayLink] = useState('');

  // Edit item sub-dialog
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editItemTitle, setEditItemTitle] = useState('');
  const [editItemArtist, setEditItemArtist] = useState('');
  const [editItemKey, setEditItemKey] = useState('');
  const [editItemCapo, setEditItemCapo] = useState('');
  const [editItemTempo, setEditItemTempo] = useState('');
  const [editItemDuration, setEditItemDuration] = useState('');
  const [editItemNotes, setEditItemNotes] = useState('');
  const [editItemLeadSheetUrl, setEditItemLeadSheetUrl] = useState('');
  const [editItemPlayLink, setEditItemPlayLink] = useState('');

  // Initialize or reset form when dialog opens or initialSetlist changes
  useEffect(() => {
    if (open) {
      if (initialSetlist) {
        setTitle(initialSetlist.title || initialSetlist.name || '');
        setDescription(initialSetlist.description || '');
        setGigDate(initialSetlist.gigDate || '');
        setItems(normalizeItemOrders(initialSetlist.items || []));
      } else {
        setTitle('');
        setDescription('');
        setGigDate('');
        setItems([]);
      }
      setErrorMessage('');
      setSaveLoading(false);
      setSelectedCatalogSong(null);
      resetCustomSongForm();
      setEditingItemIndex(null);
    }
  }, [open, initialSetlist]);

  const resetCustomSongForm = () => {
    setCustomTitle('');
    setCustomArtist('');
    setCustomKey('');
    setCustomCapo('');
    setCustomTempo('');
    setCustomDuration('');
    setCustomNotes('');
    setCustomLeadSheetUrl('');
    setCustomPlayLink('');
  };

  const handleAddCatalogSong = () => {
    if (!selectedCatalogSong) return;

    const newItem: ISetlistItem = {
      order: items.length + 1,
      songId: selectedCatalogSong._id,
      title: selectedCatalogSong.title,
      artist: selectedCatalogSong.artist || 'Josh & Maria Sherman',
      playLink: selectedCatalogSong.url || '',
      durationSeconds: 0,
      key: '',
      capo: '',
      tempo: '',
      notes: '',
      leadSheetUrl: '',
    };

    setItems((prev) => normalizeItemOrders([...prev, newItem]));
    setSelectedCatalogSong(null);
  };

  const handleAddCustomSong = () => {
    if (!customTitle.trim()) {
      setErrorMessage('Song title is required for custom songs.');
      return;
    }
    setErrorMessage('');

    const parsedSecs = parseDuration(customDuration);
    const newItem: ISetlistItem = {
      order: items.length + 1,
      title: customTitle.trim(),
      artist: customArtist.trim() || undefined,
      key: customKey.trim() || undefined,
      capo: customCapo.trim() || undefined,
      tempo: customTempo.trim() || undefined,
      durationSeconds: parsedSecs > 0 ? parsedSecs : undefined,
      notes: customNotes.trim() || undefined,
      leadSheetUrl: customLeadSheetUrl.trim() || undefined,
      playLink: customPlayLink.trim() || undefined,
    };

    setItems((prev) => normalizeItemOrders([...prev, newItem]));
    resetCustomSongForm();
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setItems((prev) => reorderItems(prev, index, index - 1));
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    setItems((prev) => reorderItems(prev, index, index + 1));
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return normalizeItemOrders(copy);
    });
  };

  const handleStartEditItem = (index: number) => {
    const item = items[index];
    if (!item) return;
    setEditingItemIndex(index);
    setEditItemTitle(item.title || (typeof item.songId === 'object' ? item.songId?.title || '' : ''));
    setEditItemArtist(item.artist || (typeof item.songId === 'object' ? item.songId?.artist || '' : ''));
    setEditItemKey(item.key || '');
    setEditItemCapo(item.capo !== undefined && item.capo !== null ? String(item.capo) : '');
    setEditItemTempo(item.tempo !== undefined && item.tempo !== null ? String(item.tempo) : '');
    setEditItemDuration(item.durationSeconds ? formatSongDuration(item.durationSeconds) : '');
    setEditItemNotes(item.notes || '');
    setEditItemLeadSheetUrl(item.leadSheetUrl || '');
    setEditItemPlayLink(item.playLink || (typeof item.songId === 'object' ? item.songId?.url || '' : ''));
  };

  const handleSaveItemEdit = () => {
    if (editingItemIndex === null) return;
    const parsedSecs = parseDuration(editItemDuration);

    setItems((prev) => {
      const updated = [...prev];
      const current = updated[editingItemIndex];
      updated[editingItemIndex] = {
        ...current,
        title: editItemTitle.trim(),
        artist: editItemArtist.trim() || undefined,
        key: editItemKey.trim() || undefined,
        capo: editItemCapo.trim() || undefined,
        tempo: editItemTempo.trim() || undefined,
        durationSeconds: parsedSecs > 0 ? parsedSecs : undefined,
        notes: editItemNotes.trim() || undefined,
        leadSheetUrl: editItemLeadSheetUrl.trim() || undefined,
        playLink: editItemPlayLink.trim() || undefined,
      };
      return updated;
    });

    setEditingItemIndex(null);
  };

  const handleSaveSetlist = async () => {
    if (!title.trim()) {
      setErrorMessage('Setlist title is required.');
      return;
    }
    setErrorMessage('');
    setSaveLoading(true);

    try {
      const normalized = normalizeItemOrders(items);
      const payload: Partial<ISetlist> = {
        title: title.trim(),
        name: title.trim(),
        description: description.trim() || undefined,
        gigDate: gigDate.trim() || undefined,
        items: normalized,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to save setlist');
    } finally {
      setSaveLoading(false);
    }
  };

  const totalDuration = calculateTotalDuration(items);

  return (
    <>
      <Dialog
        open={open}
        onClose={() => !saveLoading && onClose()}
        maxWidth="md"
        fullWidth
        data-testid="setlist-builder-dialog"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QueueMusicIcon color="primary" />
            <Typography variant="h6">
              {initialSetlist ? 'Edit Setlist' : 'Create New Setlist'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={saveLoading} data-testid="close-builder-btn">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {errorMessage && (
            <Alert severity="error" data-testid="builder-error-alert">
              {errorMessage}
            </Alert>
          )}

          {/* Metadata Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={(
                <span className="required-star-wrap">
                  Setlist Title <span className="required-star">*</span>
                </span>
              )}
              fullWidth
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Roanoke Farmer's Market Gig"
              slotProps={{ htmlInput: { 'data-testid': 'setlist-title-input' } }}
              required
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Gig Date"
                size="small"
                value={gigDate}
                onChange={(e) => setGigDate(e.target.value)}
                placeholder="YYYY-MM-DD (e.g. 2026-09-20)"
                slotProps={{ htmlInput: { 'data-testid': 'setlist-gig-date-input' } }}
                sx={{ flex: '1 1 200px' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '1 1 auto', justifyContent: 'flex-end' }}>
                <Chip
                  icon={<TimeIcon fontSize="small" />}
                  label={`Total: ${formatDuration(totalDuration)} (${items.length} songs)`}
                  color="info"
                  variant="outlined"
                  data-testid="builder-total-duration-chip"
                />
              </Box>
            </Box>

            <TextField
              label="Description / Venue Notes"
              fullWidth
              multiline
              rows={2}
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes about this setlist, acoustic setup, venue details..."
              slotProps={{ htmlInput: { 'data-testid': 'setlist-description-input' } }}
            />
          </Box>

          <Divider />

          {/* Add Song Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Add Songs to Setlist
            </Typography>

            <Tabs
              value={addModeTab}
              onChange={(_, v: number) => setAddModeTab(v as 0 | 1)}
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="From Song Catalog" value={0} data-testid="tab-from-catalog" />
              <Tab label="Add Custom / Cover Song" value={1} data-testid="tab-custom-song" />
            </Tabs>

            {addModeTab === 0 && (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <Autocomplete
                  id="catalog-song-autocomplete"
                  data-testid="catalog-song-autocomplete"
                  options={songCatalog}
                  getOptionLabel={(option) => `${option.title}${option.artist ? ` - ${option.artist}` : ''}`}
                  value={selectedCatalogSong}
                  onChange={(_, value) => setSelectedCatalogSong(value)}
                  sx={{ flex: '1 1 300px' }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Catalog Songs"
                      size="small"
                      placeholder="Select song from catalog..."
                    />
                  )}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddCatalogSong}
                  disabled={!selectedCatalogSong}
                  data-testid="add-catalog-song-btn"
                >
                  Add Song
                </Button>
              </Box>
            )}

            {addModeTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <TextField
                    label={(
                      <span className="required-star-wrap">
                        Song Title <span className="required-star">*</span>
                      </span>
                    )}
                    size="small"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Wagon Wheel"
                    sx={{ flex: '1 1 220px' }}
                    slotProps={{ htmlInput: { 'data-testid': 'custom-song-title-input' } }}
                  />
                  <TextField
                    label="Artist"
                    size="small"
                    value={customArtist}
                    onChange={(e) => setCustomArtist(e.target.value)}
                    placeholder="e.g. Old Crow Medicine Show"
                    sx={{ flex: '1 1 200px' }}
                    slotProps={{ htmlInput: { 'data-testid': 'custom-song-artist-input' } }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <TextField
                    label="Key"
                    size="small"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="e.g. G, Am"
                    sx={{ flex: '1 1 80px' }}
                    slotProps={{ htmlInput: { 'data-testid': 'custom-song-key-input' } }}
                  />
                  <TextField
                    label="Capo"
                    size="small"
                    value={customCapo}
                    onChange={(e) => setCustomCapo(e.target.value)}
                    placeholder="e.g. 2"
                    sx={{ flex: '1 1 80px' }}
                    slotProps={{ htmlInput: { 'data-testid': 'custom-song-capo-input' } }}
                  />
                  <TextField
                    label="Tempo / BPM"
                    size="small"
                    value={customTempo}
                    onChange={(e) => setCustomTempo(e.target.value)}
                    placeholder="e.g. 110"
                    sx={{ flex: '1 1 100px' }}
                    slotProps={{ htmlInput: { 'data-testid': 'custom-song-tempo-input' } }}
                  />
                  <TextField
                    label="Duration"
                    size="small"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="e.g. 3:45 or 225s"
                    sx={{ flex: '1 1 110px' }}
                    slotProps={{ htmlInput: { 'data-testid': 'custom-song-duration-input' } }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <TextField
                    label="Lead Sheet / Chords Link"
                    size="small"
                    value={customLeadSheetUrl}
                    onChange={(e) => setCustomLeadSheetUrl(e.target.value)}
                    placeholder="https://..."
                    sx={{ flex: '1 1 200px' }}
                    slotProps={{ htmlInput: { 'data-testid': 'custom-song-leadsheet-input' } }}
                  />
                  <TextField
                    label="Audio / Play Link"
                    size="small"
                    value={customPlayLink}
                    onChange={(e) => setCustomPlayLink(e.target.value)}
                    placeholder="https://..."
                    sx={{ flex: '1 1 200px' }}
                    slotProps={{ htmlInput: { 'data-testid': 'custom-song-playlink-input' } }}
                  />
                </Box>

                <TextField
                  label="Performance Notes"
                  size="small"
                  multiline
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Josh starts acoustic riff, Maria joins v2"
                  slotProps={{ htmlInput: { 'data-testid': 'custom-song-notes-input' } }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddCustomSong}
                    disabled={!customTitle.trim()}
                    data-testid="add-custom-song-btn"
                  >
                    Add Song to Setlist
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Current Songs in Setlist */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              Setlist Songs ({items.length})
            </Typography>

            {items.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                No songs added yet. Add from catalog or enter custom songs above.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }} data-testid="builder-items-list">
                {items.map((item, index) => {
                  const resolvedTitle = item.title || (typeof item.songId === 'object' ? item.songId?.title : '') || 'Untitled';
                  const resolvedArtist = item.artist || (typeof item.songId === 'object' ? item.songId?.artist : '');
                  const durationStr = formatSongDuration(item.durationSeconds);

                  return (
                    <Card
                      key={item._id || `item-${index}-${item.order}`}
                      variant="outlined"
                      className="admin-builder-item"
                      data-testid={`builder-item-${index + 1}`}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: '1 1 auto', minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', minWidth: 32 }}>
                          #{index + 1}
                        </Typography>

                        <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                            {resolvedTitle}
                          </Typography>
                          {resolvedArtist && (
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                              {resolvedArtist}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {item.key && <Chip label={`Key: ${item.key}`} size="small" variant="outlined" />}
                            {item.capo !== undefined && item.capo !== '' && (
                              <Chip label={`Capo ${item.capo}`} size="small" variant="outlined" />
                            )}
                            {item.tempo !== undefined && item.tempo !== '' && (
                              <Chip label={`${item.tempo} BPM`} size="small" variant="outlined" />
                            )}
                            {durationStr && <Chip label={durationStr} size="small" variant="outlined" />}
                          </Box>
                        </Box>
                      </Box>

                      {/* Action buttons: Move Up, Move Down, Edit, Delete */}
                      <Box className="admin-item-actions">
                        <IconButton
                          size="small"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          aria-label="Move song up"
                          data-testid={`move-up-btn-${index + 1}`}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === items.length - 1}
                          aria-label="Move song down"
                          data-testid={`move-down-btn-${index + 1}`}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleStartEditItem(index)}
                          aria-label="Edit song details"
                          data-testid={`edit-item-btn-${index + 1}`}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveItem(index)}
                          aria-label="Remove song"
                          data-testid={`remove-item-btn-${index + 1}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={saveLoading} data-testid="cancel-builder-btn">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSetlist}
            disabled={saveLoading || !title.trim()}
            data-testid="save-setlist-btn"
          >
            {saveLoading ? 'Saving...' : initialSetlist ? 'Save Changes' : 'Create Setlist'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sub-Dialog for editing an existing item in the setlist */}
      {editingItemIndex !== null && (
        <Dialog
          open={true}
          onClose={() => setEditingItemIndex(null)}
          maxWidth="sm"
          fullWidth
          data-testid="edit-item-dialog"
        >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Setlist Song Details
          <IconButton onClick={() => setEditingItemIndex(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Title"
            size="small"
            value={editItemTitle}
            onChange={(e) => setEditItemTitle(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { 'data-testid': 'edit-item-title-input' } }}
          />
          <TextField
            label="Artist"
            size="small"
            value={editItemArtist}
            onChange={(e) => setEditItemArtist(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { 'data-testid': 'edit-item-artist-input' } }}
          />
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              label="Key"
              size="small"
              value={editItemKey}
              onChange={(e) => setEditItemKey(e.target.value)}
              sx={{ flex: '1 1 70px' }}
              slotProps={{ htmlInput: { 'data-testid': 'edit-item-key-input' } }}
            />
            <TextField
              label="Capo"
              size="small"
              value={editItemCapo}
              onChange={(e) => setEditItemCapo(e.target.value)}
              sx={{ flex: '1 1 70px' }}
              slotProps={{ htmlInput: { 'data-testid': 'edit-item-capo-input' } }}
            />
            <TextField
              label="Tempo / BPM"
              size="small"
              value={editItemTempo}
              onChange={(e) => setEditItemTempo(e.target.value)}
              sx={{ flex: '1 1 90px' }}
              slotProps={{ htmlInput: { 'data-testid': 'edit-item-tempo-input' } }}
            />
            <TextField
              label="Duration"
              size="small"
              value={editItemDuration}
              onChange={(e) => setEditItemDuration(e.target.value)}
              placeholder="e.g. 3:45 or 225s"
              sx={{ flex: '1 1 100px' }}
              slotProps={{ htmlInput: { 'data-testid': 'edit-item-duration-input' } }}
            />
          </Box>
          <TextField
            label="Lead Sheet / Chords Link"
            size="small"
            value={editItemLeadSheetUrl}
            onChange={(e) => setEditItemLeadSheetUrl(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { 'data-testid': 'edit-item-leadsheet-input' } }}
          />
          <TextField
            label="Audio / Play Link"
            size="small"
            value={editItemPlayLink}
            onChange={(e) => setEditItemPlayLink(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { 'data-testid': 'edit-item-playlink-input' } }}
          />
          <TextField
            label="Notes"
            size="small"
            multiline
            rows={2}
            value={editItemNotes}
            onChange={(e) => setEditItemNotes(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { 'data-testid': 'edit-item-notes-input' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditingItemIndex(null)} data-testid="cancel-edit-item-btn">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveItemEdit}
            data-testid="save-edit-item-btn"
          >
            Update Song
          </Button>
        </DialogActions>
      </Dialog>
      )}
    </>
  );
}

export default SetlistBuilderDialog;
