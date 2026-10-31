import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import type { Igig } from 'src/providers/Data.provider';
import type { Iauth } from 'src/providers/Auth.provider';
import { generateStartingCaption } from './caption-generator';
import utils from './gigs.utils';

export interface AnnounceGigDialogProps {
  gig: Igig | null;
  open: boolean;
  onClose: () => void;
  auth: Iauth;
  onSuccess?: (announcedAt: string) => void;
}

export function AnnounceGigDialog({
  gig,
  open,
  onClose,
  auth,
  onSuccess,
}: AnnounceGigDialogProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [mariaTag, setMariaTag] = useState('chemmariasherman');
  const [venueTag, setVenueTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSeverity, setStatusSeverity] = useState<'success' | 'error' | null>(null);

  const captionEditedRef = useRef(false);
  const venueTagEditedRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!open || !gig) return;

    captionEditedRef.current = false;
    venueTagEditedRef.current = false;
    hasSubmittedRef.current = false;

    setImageUrl(gig.promoImageUrl || '');
    setMariaTag('chemmariasherman');
    setVenueTag('');
    setSubmitting(false);
    setStatusMessage('');
    setStatusSeverity(null);

    const initialCaption = generateStartingCaption(gig);
    setCaption(initialCaption);

    const resolvedVenueId = typeof gig.venueId === 'object' && gig.venueId !== null
      ? gig.venueId._id
      : (typeof gig.venueId === 'string' ? gig.venueId : null);

    if (resolvedVenueId && auth.token) {
      let isMounted = true;
      utils.fetchVenue(auth.token, resolvedVenueId).then((venue) => {
        if (!isMounted || !venue || hasSubmittedRef.current) return;
        if (!venueTagEditedRef.current) {
          if (venue.instagramUsername) {
            setVenueTag(venue.instagramUsername);
          } else {
            setVenueTag('');
          }
        }
        if (!captionEditedRef.current && venue.website) {
          setCaption(generateStartingCaption(gig, { venueWebsite: venue.website }));
        }
      }).catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [open, gig, auth.token]);

  const handleConfirm = async () => {
    if (!gig?._id) return;
    setSubmitting(true);
    setStatusMessage('');
    setStatusSeverity(null);

    const payload = {
      caption,
      imageUrl: imageUrl.trim() || undefined,
      userTags: [mariaTag.trim(), venueTag.trim()],
    };

    const res = await utils.announceGig(auth.token, gig._id, payload);
    setSubmitting(false);

    if (res.ok || res.instagram?.ok) {
      hasSubmittedRef.current = true;
      const nowIso = new Date().toISOString();
      setStatusSeverity('success');
      setStatusMessage('Gig announced successfully to Instagram!');
      onSuccess?.(nowIso);
    } else {
      setStatusSeverity('error');
      const errText = res.instagram?.error || res.message || 'Instagram announce failed';
      setStatusMessage(`Instagram error: ${errText}`);
    }
  };

  if (!open || !gig) return null;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="announce-dialog-title"
    >
      <DialogTitle id="announce-dialog-title">
        Announce Gig to Instagram
      </DialogTitle>
      <DialogContent dividers>
        {statusMessage && (
          <Box
            role="status"
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: '4px',
              backgroundColor: statusSeverity === 'success' ? '#e8f5e9' : '#ffebee',
              color: statusSeverity === 'success' ? '#2e7d32' : '#c62828',
              fontWeight: 500,
            }}
          >
            {statusMessage}
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          {imageUrl.trim() ? (
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <img
                src={imageUrl.trim()}
                alt="Promo preview"
                style={{
                  maxHeight: '140px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: '4px',
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                p: 2,
                mb: 1,
                textAlign: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderRadius: '4px',
                fontSize: '13px',
                fontStyle: 'italic',
                color: 'text.secondary',
              }}
            >
              Default Josh &amp; Maria photo will be used
            </Box>
          )}

          <TextField
            fullWidth
            size="small"
            label="Image URL"
            id="announce-image-url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            helperText="Public image URL (optional — leave blank for default photo)"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>Caption</p>
          <Editor
            id="announce-caption"
            value={caption}
            apiKey={process.env.TINY_KEY}
            init={{
              menubar: false,
              plugins: [
                'advlist autolink lists link charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime paste code help wordcount',
              ],
              toolbar:
                'undo redo | formatselect | bold italic backcolor forecolor |'
                + 'alignleft aligncenter alignright alignjustify |'
                + 'bullist numlist outdent indent | removeformat | help',
            }}
            onEditorChange={(newCaption: string) => {
              captionEditedRef.current = true;
              setCaption(newCaption);
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Maria Sherman Instagram Tag"
            id="announce-tag-maria"
            value={mariaTag}
            onChange={(e) => setMariaTag(e.target.value.replace(/^@/, ''))}
            helperText="Position: 25% across, 85% down"
          />
          <TextField
            fullWidth
            size="small"
            label="Venue Instagram Tag"
            id="announce-tag-venue"
            value={venueTag}
            onChange={(e) => {
              venueTagEditedRef.current = true;
              setVenueTag(e.target.value.replace(/^@/, ''));
            }}
            helperText="Position: 75% across, 85% down"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          id="announce-confirm-button"
          disabled={submitting || !caption.trim()}
          onClick={handleConfirm}
        >
          {submitting ? 'Confirming...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AnnounceGigDialog;
