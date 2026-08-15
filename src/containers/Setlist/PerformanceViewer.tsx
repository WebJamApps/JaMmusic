import React from 'react';
import {
  Box, Typography, Button, FormControl, InputLabel, Select, MenuItem,
  Chip, SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  MusicNote as MusicNoteIcon,
  QueueMusic as QueueMusicIcon,
  OpenInNew as OpenInNewIcon,
  PlayArrow as PlayArrowIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import {
  ISetlist, ISetlistItem, calculateTotalDuration, formatDuration, formatSongDuration,
} from './setlist.utils';

export interface IPerformanceViewerProps {
  setlist: ISetlist | null;
  setlists: ISetlist[];
  onSelectSetlist: (id: string) => void;
  isAdmin: boolean;
  onNewSetlist: () => void;
  onEditSetlist: (setlist: ISetlist) => void;
  onDeleteSetlist: (setlist: ISetlist) => void;
}

export function PerformanceViewer(props: IPerformanceViewerProps): React.JSX.Element {
  const {
    setlist,
    setlists,
    onSelectSetlist,
    isAdmin,
    onNewSetlist,
    onEditSetlist,
    onDeleteSetlist,
  } = props;

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    onSelectSetlist(e.target.value);
  };

  const currentItems: ISetlistItem[] = setlist?.items || [];
  const totalDuration = calculateTotalDuration(currentItems);
  const formattedTotal = formatDuration(totalDuration);

  const getResolvedTitle = (item: ISetlistItem): string => {
    if (item.title) return item.title;
    if (item.songId && typeof item.songId === 'object' && item.songId.title) {
      return item.songId.title;
    }
    return 'Untitled Song';
  };

  const getResolvedArtist = (item: ISetlistItem): string => {
    if (item.artist) return item.artist;
    if (item.songId && typeof item.songId === 'object' && item.songId.artist) {
      return item.songId.artist;
    }
    return '';
  };

  const getResolvedPlayLink = (item: ISetlistItem): string => {
    if (item.playLink) return item.playLink;
    if (item.songId && typeof item.songId === 'object' && item.songId.url) {
      return item.songId.url;
    }
    return '';
  };

  return (
    <Box className="performance-viewer" data-testid="performance-viewer">
      {/* Header card with selector, setlist details and stats */}
      <Box className="setlist-header-card" data-testid="setlist-header-card">
        <Box className="setlist-header-title-row">
          <Box sx={{ minWidth: 240, maxWidth: 400, flex: '1 1 auto' }}>
            {setlists.length > 0 ? (
              <FormControl fullWidth size="small">
                <InputLabel id="setlist-select-label">Select Setlist</InputLabel>
                <Select
                  labelId="setlist-select-label"
                  id="setlist-select"
                  value={setlist?._id || ''}
                  label="Select Setlist"
                  onChange={handleSelectChange}
                  data-testid="setlist-select"
                >
                  {setlists.map((s) => (
                    <MenuItem key={s._id || s.name || s.title} value={s._id || ''}>
                      {s.title || s.name || 'Untitled Setlist'}
                      {s.gigDate ? ` (${s.gigDate})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No setlists available
              </Typography>
            )}
          </Box>

          {/* Admin action buttons */}
          {isAdmin && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }} data-testid="admin-actions-bar">
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={onNewSetlist}
                data-testid="create-setlist-btn"
              >
                New Setlist
              </Button>
              {setlist && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => onEditSetlist(setlist)}
                    data-testid="edit-setlist-btn"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDeleteSetlist(setlist)}
                    data-testid="delete-setlist-btn"
                  >
                    Delete
                  </Button>
                </>
              )}
            </Box>
          )}
        </Box>

        {setlist ? (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h4" component="h1" className="setlist-title" sx={{ fontWeight: 700, mb: 0.5 }}>
              {setlist.title || setlist.name || 'Untitled Setlist'}
            </Typography>

            {setlist.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                {setlist.description}
              </Typography>
            )}

            <Box className="setlist-meta-stats" data-testid="setlist-meta-stats">
              {setlist.gigDate && (
                <span className="stat-item" data-testid="stat-gig-date">
                  <strong>Date:</strong> {setlist.gigDate}
                </span>
              )}
              <span className="stat-item" data-testid="stat-song-count">
                <MusicNoteIcon fontSize="small" />
                <span>{currentItems.length} {currentItems.length === 1 ? 'song' : 'songs'}</span>
              </span>
              <span className="stat-item" data-testid="stat-total-duration">
                <TimeIcon fontSize="small" />
                <span>Total Duration: <strong>{formattedTotal}</strong></span>
              </span>
            </Box>
          </Box>
        ) : (
          <Box sx={{ padding: '24px 0', textAlign: 'center' }}>
            <QueueMusicIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              {setlists.length === 0 ? 'No setlists created yet.' : 'Please select a setlist to view.'}
            </Typography>
            {isAdmin && setlists.length === 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={onNewSetlist}
                sx={{ mt: 2 }}
              >
                Create First Setlist
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Setlist Song Items */}
      {setlist && (
        <Box className="setlist-items-list" data-testid="setlist-items-list">
          {currentItems.length === 0 ? (
            <Box className="performance-card" sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                This setlist has no songs yet.
              </Typography>
              {isAdmin && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onEditSetlist(setlist)}
                  sx={{ mt: 1.5 }}
                >
                  Add Songs
                </Button>
              )}
            </Box>
          ) : (
            currentItems.map((item, index) => {
              const title = getResolvedTitle(item);
              const artist = getResolvedArtist(item);
              const playLink = getResolvedPlayLink(item);
              const songDuration = formatSongDuration(item.durationSeconds);

              return (
                <Box
                  key={item._id || `item-${index}-${item.order}`}
                  className="performance-card"
                  data-testid={`performance-song-item-${index + 1}`}
                >
                  <Box className="performance-card-main">
                    <Box className="song-order-badge" data-testid={`song-order-${index + 1}`}>
                      #{item.order || index + 1}
                    </Box>

                    <Box className="song-info-block">
                      <Typography variant="h5" component="h2" className="song-title-text">
                        {title}
                      </Typography>

                      {artist && (
                        <Typography variant="body2" className="song-artist-text">
                          {artist}
                        </Typography>
                      )}

                      {/* Badges for Key, Capo, Tempo, Duration */}
                      <Box className="song-badges-row">
                        {item.key && (
                          <span className="stage-badge stage-badge-key" data-testid="badge-key">
                            Key: {item.key}
                          </span>
                        )}
                        {item.capo !== undefined && item.capo !== '' && (
                          <span className="stage-badge stage-badge-capo" data-testid="badge-capo">
                            Capo {item.capo}
                          </span>
                        )}
                        {item.tempo !== undefined && item.tempo !== '' && (
                          <span className="stage-badge stage-badge-tempo" data-testid="badge-tempo">
                            {item.tempo} BPM
                          </span>
                        )}
                        {songDuration && (
                          <span className="stage-badge stage-badge-duration" data-testid="badge-duration">
                            <TimeIcon sx={{ fontSize: 13 }} />
                            {songDuration}
                          </span>
                        )}
                      </Box>

                      {/* Stage Notes */}
                      {item.notes && (
                        <Box className="song-notes-box" data-testid="song-notes">
                          {item.notes}
                        </Box>
                      )}

                      {/* Links Row: Play / Lead sheet */}
                      {(playLink || item.leadSheetUrl) && (
                        <Box className="song-links-row">
                          {playLink && (
                            <Chip
                              size="small"
                              icon={<PlayArrowIcon fontSize="small" />}
                              label="Listen / Audio"
                              component="a"
                              href={playLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              clickable
                              color="primary"
                              variant="outlined"
                              data-testid="song-play-link"
                            />
                          )}
                          {item.leadSheetUrl && (
                            <Chip
                              size="small"
                              icon={<DescriptionIcon fontSize="small" />}
                              label="Lead Sheet / Chords"
                              component="a"
                              href={item.leadSheetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              clickable
                              color="secondary"
                              variant="outlined"
                              data-testid="song-leadsheet-link"
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      )}
    </Box>
  );
}

export default PerformanceViewer;
