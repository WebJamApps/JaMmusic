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
import { generateStartingCaption, htmlCaptionToText, formatPlainDate } from './caption-generator';
import utils, { type AnnouncePayload } from './gigs.utils';

export interface PostedPictureInfo {
  postedDate: Date;
  dateLabel: string;
}

export const getDefaultPromoUrl = (): string => `${process.env.BackendUrl || ''}/gig/promo-default.jpg`;

export function formatPostedDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || Number.isNaN(d.getTime())) return '';
  return `posted ${formatPlainDate(d)}`;
}

export function getGigPostedPictures(gig: Igig | null): Map<string, PostedPictureInfo> {
  const map = new Map<string, PostedPictureInfo>();
  if (!gig) return map;

  const recordPost = (url?: string, at?: string | Date) => {
    if (!url || !url.trim()) return;
    const trimmedUrl = url.trim();
    const effectiveAt = at || gig.announcedAt || new Date();
    const dateObj = typeof effectiveAt === 'string' ? new Date(effectiveAt) : effectiveAt;
    if (!dateObj || Number.isNaN(dateObj.getTime())) return;

    const existing = map.get(trimmedUrl);
    if (!existing || dateObj.getTime() > existing.postedDate.getTime()) {
      map.set(trimmedUrl, {
        postedDate: dateObj,
        dateLabel: formatPostedDate(dateObj),
      });
    }
  };

  if (Array.isArray(gig.announcements)) {
    gig.announcements.forEach((a) => {
      recordPost(a.imageUrl, a.at);
    });
  }

  if (gig.announceImageUrl) {
    recordPost(gig.announceImageUrl, gig.announcedAt);
  }

  return map;
}

export function isPicturePosted(
  url: string,
  postedMap: Map<string, PostedPictureInfo>,
): boolean {
  if (postedMap.has(url)) return true;
  if (url.endsWith('/gig/promo-default.jpg')) {
    for (const key of postedMap.keys()) {
      if (key.endsWith('/gig/promo-default.jpg')) return true;
    }
  }
  return false;
}

export function getPicturePostedInfo(
  url: string,
  postedMap: Map<string, PostedPictureInfo>,
): PostedPictureInfo | undefined {
  if (postedMap.has(url)) return postedMap.get(url);
  if (url.endsWith('/gig/promo-default.jpg')) {
    for (const [key, value] of postedMap) {
      if (key.endsWith('/gig/promo-default.jpg')) return value;
    }
  }
  return undefined;
}

export function buildPictureStripUrls(
  gigs: Igig[] = [],
  defaultUrl: string = getDefaultPromoUrl(),
): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  for (const g of gigs) {
    if (!g || typeof g.promoImageUrl !== 'string' || !g.promoImageUrl.trim()) continue;
    const url = g.promoImageUrl.trim();
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  if (defaultUrl && !seen.has(defaultUrl)) {
    urls.push(defaultUrl);
  }

  return urls;
}

export function determineStartingImageUrl(
  gig: Igig | null,
  stripUrls: string[],
  postedMap: Map<string, PostedPictureInfo>,
  defaultUrl: string = getDefaultPromoUrl(),
): string {
  if (!gig) return '';

  const gigPromo = gig.promoImageUrl?.trim();

  // 1. Gig's own picture when unposted
  if (gigPromo && !isPicturePosted(gigPromo, postedMap)) {
    return gigPromo;
  }

  // 2. First unposted picture in the strip
  const firstUnposted = stripUrls.find((url) => !isPicturePosted(url, postedMap));
  if (firstUnposted) {
    if (stripUrls.length === 1 && stripUrls[0] === defaultUrl && !gigPromo) {
      return '';
    }
    return firstUnposted;
  }

  // 3. When every picture has been posted, the one posted longest ago
  let longestAgoUrl = '';
  let oldestTime = Infinity;

  for (const url of stripUrls) {
    const info = getPicturePostedInfo(url, postedMap);
    if (info) {
      const t = info.postedDate.getTime();
      if (t < oldestTime) {
        oldestTime = t;
        longestAgoUrl = url;
      }
    }
  }

  if (longestAgoUrl) {
    return longestAgoUrl;
  }

  return gigPromo || '';
}

export interface AnnounceGigDialogProps {
  gig: Igig | null;
  gigs?: Igig[];
  open: boolean;
  onClose: () => void;
  auth: Iauth;
  onSuccess?: (announcedAt: string) => void;
}

export function AnnounceGigDialog({
  gig,
  gigs,
  open,
  onClose,
  auth,
  onSuccess,
}: AnnounceGigDialogProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [mariaTag, setMariaTag] = useState('chemmariasherman');
  const [venueTag, setVenueTag] = useState('');
  const [collaborator, setCollaborator] = useState('chemmariasherman');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSeverity, setStatusSeverity] = useState<'success' | 'error' | null>(null);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  const captionEditedRef = useRef(false);
  const venueTagEditedRef = useRef(false);
  const locationEditedRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  const loadedGigs = gigs || [];

  useEffect(() => {
    if (!open || !gig) return;

    captionEditedRef.current = false;
    venueTagEditedRef.current = false;
    locationEditedRef.current = false;
    hasSubmittedRef.current = false;
    setFailedUrls([]);

    const defaultPhoto = getDefaultPromoUrl();
    const candidateUrls = buildPictureStripUrls(
      loadedGigs.length > 0 ? loadedGigs : (gig ? [gig] : []),
      defaultPhoto,
    );
    const postedPictures = getGigPostedPictures(gig);
    const initialImageUrl = determineStartingImageUrl(gig, candidateUrls, postedPictures, defaultPhoto);

    setImageUrl(initialImageUrl);
    setMariaTag('chemmariasherman');
    setVenueTag('');
    setCollaborator('chemmariasherman');
    setLocation('');
    setSubmitting(false);
    setSubmittedSuccessfully(false);
    setCopyMessage('');
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
        if (!locationEditedRef.current) {
          if (venue.facebookPageId) {
            setLocation(venue.facebookPageId);
          } else {
            setLocation('');
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
  }, [open, gig, gigs, auth.token]);

  const handleConfirm = async () => {
    if (!gig?._id) return;
    setSubmitting(true);
    setStatusMessage('');
    setStatusSeverity(null);

    const payload: AnnouncePayload = {
      caption,
      imageUrl: imageUrl.trim() || undefined,
      userTags: [mariaTag.trim(), venueTag.trim()],
      collaborators: collaborator.trim() ? [collaborator.trim()] : [],
      locationId: location.trim() || undefined,
    };

    const res = await utils.announceGig(auth.token, gig._id, payload);
    setSubmitting(false);

    if (res.ok || res.instagram?.ok) {
      hasSubmittedRef.current = true;
      setSubmittedSuccessfully(true);
      const nowIso = new Date().toISOString();
      setStatusSeverity('success');
      if (res.instagram?.locationDropped) {
        const dropReason = res.instagram.locationDropped ? `: ${res.instagram.locationDropped}` : '';
        setStatusMessage(`Posted without the location: Instagram refused it${dropReason}`);
      } else {
        setStatusMessage('Gig announced successfully to Instagram!');
      }
      onSuccess?.(nowIso);
    } else {
      setStatusSeverity('error');
      const errText = res.instagram?.error || res.message || 'Instagram announce failed';
      setStatusMessage(`Instagram error: ${errText}`);
    }
  };

  const handleCopyCaption = async () => {
    const plainText = htmlCaptionToText(caption);
    try {
      await navigator.clipboard.writeText(plainText);
      setCopyMessage('Caption copied to clipboard!');
    } catch (_e) {
      setCopyMessage('Failed to copy caption');
    }
  };

  const handleDownloadPicture = () => {
    if (!gig?._id) return;
    utils.downloadAnnounceImage(gig._id);
  };

  const handleOpenFacebook = () => {
    window.open('https://www.facebook.com/', '_blank', 'noopener,noreferrer');
  };

  if (!open || !gig) return null;

  const defaultPhoto = getDefaultPromoUrl();
  const candidateUrls = buildPictureStripUrls(
    loadedGigs.length > 0 ? loadedGigs : (gig ? [gig] : []),
    defaultPhoto,
  );
  const postedPictures = getGigPostedPictures(gig);
  const stripItems = candidateUrls.filter((url) => !failedUrls.includes(url));

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

        {submittedSuccessfully && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              border: '1px solid #e0e0e0',
            }}
          >
            <Box sx={{ fontWeight: 600, mb: 1, fontSize: '14px' }}>Facebook</Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                id="announce-copy-caption-button"
                onClick={handleCopyCaption}
              >
                Copy caption
              </Button>
              <Button
                variant="outlined"
                size="small"
                id="announce-download-picture-button"
                onClick={handleDownloadPicture}
              >
                Download picture
              </Button>
              <Button
                variant="outlined"
                size="small"
                id="announce-open-facebook-button"
                onClick={handleOpenFacebook}
              >
                Open Facebook
              </Button>
            </Box>
            {copyMessage && (
              <Box sx={{ mt: 1, fontSize: '13px', color: 'success.main' }}>
                {copyMessage}
              </Box>
            )}
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

          {stripItems.length > 0 && (
            <Box
              id="announce-picture-strip"
              data-testid="announce-picture-strip"
              aria-label="Picture strip"
              sx={{
                display: 'flex',
                gap: 1.5,
                overflowX: 'auto',
                pt: 1.5,
                pb: 1,
                alignItems: 'flex-start',
              }}
            >
              {stripItems.map((itemUrl, index) => {
                const isSelected = imageUrl.trim() === itemUrl;
                const postedInfo = getPicturePostedInfo(itemUrl, postedPictures);
                const isDefault = itemUrl.endsWith('/gig/promo-default.jpg');
                const label = isDefault ? 'Default photo' : `Picture ${index + 1}`;

                return (
                  <button
                    key={itemUrl}
                    type="button"
                    onClick={() => setImageUrl(itemUrl)}
                    aria-label={postedInfo ? `${label} (${postedInfo.dateLabel})` : label}
                    data-testid={`picture-strip-item-${index}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'none',
                      border: isSelected ? '2px solid #1976d2' : '1px solid #ccc',
                      borderRadius: '6px',
                      padding: '4px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      width: '74px',
                      outline: 'none',
                    }}
                  >
                    {/* eslint-disable-next-line jsx-a11y-x/no-noninteractive-element-interactions */}
                    <img
                      src={itemUrl}
                      alt={isDefault ? 'Default promo photo' : `Picture option ${index + 1}`}
                      onError={() => {
                        setFailedUrls((prev) => (prev.includes(itemUrl) ? prev : [...prev, itemUrl]));
                      }}
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                      }}
                    />
                    {postedInfo?.dateLabel && (
                      <Box
                        component="span"
                        sx={{
                          fontSize: '11px',
                          color: 'text.secondary',
                          textAlign: 'center',
                          mt: 0.5,
                          lineHeight: 1.2,
                          wordBreak: 'break-word',
                        }}
                      >
                        {postedInfo.dateLabel}
                      </Box>
                    )}
                  </button>
                );
              })}
            </Box>
          )}
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

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Collaborator"
            id="announce-collaborator"
            value={collaborator}
            onChange={(e) => setCollaborator(e.target.value.replace(/^@/, ''))}
            helperText="Instagram collaborator (default: chemmariasherman)"
          />
          <TextField
            fullWidth
            size="small"
            label="Location"
            id="announce-location"
            value={location}
            onChange={(e) => {
              locationEditedRef.current = true;
              setLocation(e.target.value);
            }}
            helperText="Facebook Page ID (from venue record)"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {submittedSuccessfully ? 'Close' : 'Cancel'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          id="announce-confirm-button"
          disabled={submitting || !caption.trim() || submittedSuccessfully}
          onClick={handleConfirm}
        >
          {submitting ? 'Confirming...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AnnounceGigDialog;
