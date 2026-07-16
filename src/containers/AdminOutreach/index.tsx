import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import {
  Box, Typography, TextField, Button, Checkbox, FormControlLabel,
  Switch, Divider, Card, CardContent, Chip, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Grid, Paper,
  InputAdornment, Accordion, AccordionSummary, AccordionDetails,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import {
  Check, Undo, Warning, Info, ThumbUp, ThumbDown, Search,
  Event, Close, CheckCircle, Block, DateRange, ArrowForward,
  Star, History, Mail, Phone, LocationOn, LocalActivity,
  PlaylistAdd, AssignmentTurnedIn, ExitToApp,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthContext } from 'src/providers/Auth.provider';
import adminVenuesUtils, { type Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';
import outreachUtils, {
  type Icandidate, type IbatchResult, type IpitchPreview, type IpendingReply,
} from './outreach.utils';
import { OutreachDialog } from './OutreachDialog';

// Touch timeline interface
export interface Itouch {
  date: string;
  type: 'visit' | 'form' | 'card' | 'call' | 'email' | 'gig' | 'other' | 'outcome';
  note?: string;
  templateType?: string;
  targetWeekend?: { start: string; end: string };
  outcome?: 'interested' | 'not-interested' | 'booked' | 'target-filled' | 'not-a-fit';
  bookedDate?: string;
  outreachId?: string;
  actor?: string;
}

function deriveSeason(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const month = date.getMonth();
  const year = date.getFullYear();
  let season = '';
  if (month === 11 || month === 0 || month === 1) season = 'winter';
  else if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else season = 'fall';
  return `${season} ${year}`;
}

function deriveDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  
  const endDate = new Date(date);
  endDate.setDate(date.getDate() + 2);
  
  const startMonth = date.toLocaleDateString('en-US', { month: 'short' });
  const startDay = date.getDate();
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const endDay = endDate.getDate();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  }
  return `${startMonth} ${startDay} to ${endMonth} ${endDay}`;
}

function candidateLabel(c: Icandidate): string {
  const city = c.city ? ` (${c.city})` : '';
  const type = c.venueType ? ` — ${c.venueType}` : '';
  return `${c.name}${city}${type}`;
}

export function AdminOutreach() {
  const { auth } = useContext(AuthContext);
  const allowed = outreachUtils.getAllowedAdminRoles();
  const isAuthorized = auth.isAuthenticated && allowed.indexOf(auth.user.userType) !== -1;

  // Search and global state
  const [search, setSearch] = useState('');
  const [allVenues, setAllVenues] = useState<Ivenue[]>([]);
  const [outreachRecords, setOutreachRecords] = useState<IpendingReply[]>([]);
  const [venuesMap, setVenuesMap] = useState<Record<string, Ivenue>>({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [error, setError] = useState('');
  const [repliesError, setRepliesError] = useState('');

  // UI expand and detail states
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null);
  const [recordNote, setRecordNote] = useState<Record<string, string>>({});
  const [confirmDncId, setConfirmDncId] = useState<{ recordId: string; venueId: string } | null>(null);
  const [bookingDateId, setBookingDateId] = useState<{ recordId: string; venueId: string } | null>(null);
  const [gigDateStr, setGigDateStr] = useState<string>('');

  // Batch composition state
  const [structuredDate, setStructuredDate] = useState('');
  const [targetDates, setTargetDates] = useState('');
  const [bookingPeriod, setBookingPeriod] = useState('');
  const [candidates, setCandidates] = useState<Icandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<IbatchResult | null>(null);
  const [autoApprove, setAutoApprove] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previews, setPreviews] = useState<IpitchPreview[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [existingGigs, setExistingGigs] = useState<any[]>([]);

  // Sentiment colors configuration
  const sentimentColors: Record<string, { label: string; color: 'success' | 'error' | 'primary' | 'default' }> = {
    positive: { label: 'Positive Reply', color: 'success' },
    negative: { label: 'Negative Reply', color: 'error' },
    'needs-info': { label: 'Needs Info', color: 'primary' },
  };

  // Local suggestion edits (mirrors legacy support)
  const [localEdits, setLocalEdits] = useState<Record<string, { bookingStatus?: string; interested?: boolean }>>({});

  const loadConfig = useCallback(async () => {
    try {
      const cfg = await outreachUtils.getConfig(auth.token);
      setAutoApprove(cfg.autoApprove);
    } catch { /* non-blocking */ }
  }, [auth.token]);

  const loadAllData = useCallback(async () => {
    setGlobalLoading(true);
    setError('');
    setRepliesError('');
    try {
      const [repliesData, venuesList] = await Promise.all([
        outreachUtils.getPendingReplies(auth.token),
        adminVenuesUtils.listVenues(auth.token),
      ]);
      setOutreachRecords(repliesData);
      setAllVenues(venuesList);
      
      const map: Record<string, Ivenue> = {};
      venuesList.forEach((v) => { map[v._id] = v; });
      setVenuesMap(map);
    } catch (e) {
      const msg = (e as { message?: string }).message || 'Failed to load outreach workspace data';
      setError(msg);
      setRepliesError(msg);
    } finally {
      setGlobalLoading(false);
    }
  }, [auth.token]);

  const loadGigs = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.BackendUrl}/gig?artist=josh`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExistingGigs(data);
      }
    } catch (err) {
      console.error('Failed to load gigs:', err);
    }
  }, [auth.token]);

  useEffect(() => {
    if (isAuthorized) {
      void loadConfig();
      void loadAllData();
      void loadGigs();
    }
  }, [isAuthorized, loadConfig, loadAllData, loadGigs]);

  // Check if venue has conflicting booked gig on the target weekend or +/- 2 months
  const checkWeekendGigs = (venueName: string, dateStr: string) => {
    if (!dateStr || !venueName || existingGigs.length === 0) return [];
    const targetDate = new Date(`${dateStr}T00:00:00`);
    const startWindow = new Date(targetDate);
    startWindow.setMonth(startWindow.getMonth() - 2);
    const endWindow = new Date(targetDate);
    endWindow.setMonth(endWindow.getMonth() + 2);

    const lowercaseName = venueName.toLowerCase().trim();
    return existingGigs.filter((g) => {
      if (!g.datetime || !g.venue) return false;
      const gigDate = new Date(g.datetime);
      if (gigDate < startWindow || gigDate > endWindow) return false;
      const gigVenueLower = g.venue.toLowerCase();
      return gigVenueLower.includes(lowercaseName) || lowercaseName.includes(gigVenueLower);
    });
  };

  const handleStatusChange = (replyId: string, val: string) => {
    setLocalEdits((prev) => ({
      ...prev,
      [replyId]: { ...prev[replyId], bookingStatus: val },
    }));
  };

  const handleInterestedChange = (replyId: string, val: boolean) => {
    setLocalEdits((prev) => ({
      ...prev,
      [replyId]: { ...prev[replyId], interested: val },
    }));
  };

  const handleApplySuggestion = async (replyId: string) => {
    setError('');
    setRepliesError('');
    try {
      const edits = localEdits[replyId] || {};
      await outreachUtils.applySuggestion(auth.token, replyId, {
        bookingStatus: edits.bookingStatus,
        interested: edits.interested,
      });
      await loadAllData();
    } catch (e) {
      const msg = (e as { message?: string }).message || 'Failed to apply suggestion';
      setError(msg);
      setRepliesError(msg);
    }
  };

  const handleReopen = async (replyId: string) => {
    setError('');
    setRepliesError('');
    try {
      await outreachUtils.applySuggestion(auth.token, replyId, { reopen: true });
      await loadAllData();
    } catch (e) {
      const msg = (e as { message?: string }).message || 'Failed to reopen outreach';
      setError(msg);
      setRepliesError(msg);
    }
  };

  const handleDismiss = async (replyId: string) => {
    setError('');
    setRepliesError('');
    try {
      await outreachUtils.applySuggestion(auth.token, replyId, { dismiss: true });
      await loadAllData();
    } catch (e) {
      const msg = (e as { message?: string }).message || 'Failed to dismiss suggestion';
      setError(msg);
      setRepliesError(msg);
    }
  };

  // One-tap outcome triggers
  const recordOutcome = async (
    recordId: string,
    status: 'interested' | 'not-interested' | 'booked' | 'target-filled' | 'not-a-fit',
    bookedDate?: string,
  ) => {
    setError('');
    try {
      await outreachUtils.recordOutcome(auth.token, recordId, {
        status,
        bookedDate: bookedDate || undefined,
      });
      setRecordNote((prev) => ({ ...prev, [recordId]: '' }));
      await loadAllData();
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to record outreach outcome');
    }
  };

  const handleRecordInterested = (recordId: string) => {
    void recordOutcome(recordId, 'interested');
  };

  const handleRecordNotInterested = (recordId: string, venueId: string) => {
    setConfirmDncId({ recordId, venueId });
  };

  const handleRecordNotAFit = (recordId: string) => {
    void recordOutcome(recordId, 'not-a-fit');
  };

  const handleRecordBooked = (recordId: string, venueId: string) => {
    setGigDateStr('');
    setBookingDateId({ recordId, venueId });
  };

  const confirmDnc = () => {
    if (confirmDncId) {
      void recordOutcome(confirmDncId.recordId, 'not-interested');
      setConfirmDncId(null);
    }
  };

  const confirmBooking = () => {
    if (bookingDateId && gigDateStr) {
      void recordOutcome(bookingDateId.recordId, 'booked', gigDateStr);
      setBookingDateId(null);
    }
  };

  // Batch Outreach candidates
  const loadCandidates = async () => {
    if (!structuredDate.trim()) { setError('Select a weekend date first'); return; }
    if (!targetDates.trim()) { setError('Enter target dates first'); return; }
    setBatchLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await outreachUtils.getCandidates(auth.token, targetDates.trim(), structuredDate);
      
      // Filter candidates using our gig overlap rules before offering them to Josh
      const availableCandidates = data.filter((cand) => {
        const conflicts = checkWeekendGigs(cand.name, structuredDate);
        const exactMatch = conflicts.some((g) => {
          const start = new Date(`${structuredDate}T00:00:00`);
          const end = new Date(start);
          end.setDate(start.getDate() + 2);
          const gDate = new Date(g.datetime);
          return gDate >= start && gDate <= end;
        });
        return !exactMatch;
      });

      setCandidates(availableCandidates);
      setSelected(new Set(availableCandidates.map((c) => c._id)));
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to load candidates');
    } finally {
      setBatchLoading(false);
    }
  };

  const toggleCandidate = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const openDialog = async () => {
    if (selected.size === 0) { setError('Select at least one venue'); return; }
    setDialogOpen(true);
    setPreviewLoading(true);
    setPreviewError('');
    setPreviews([]);
    try {
      const data = await outreachUtils.getPreview(auth.token, [...selected], targetDates.trim());
      setPreviews(data);
    } catch (e) {
      setPreviewError((e as { message?: string }).message || 'Could not load previews');
    } finally {
      setPreviewLoading(false);
    }
  };

  const send = async () => {
    setSending(true);
    setError('');
    try {
      const res = await outreachUtils.sendBatch(auth.token, {
        venueIds: [...selected], targetDates: targetDates.trim(), bookingPeriod: bookingPeriod.trim() || undefined,
      });
      setResult(res);
      setCandidates([]);
      setSelected(new Set());
      setDialogOpen(false);
      await loadAllData();
    } catch (e) {
      setError((e as { message?: string }).message || 'Batch send failed');
      setDialogOpen(false);
    } finally {
      setSending(false);
    }
  };

  const toggleAutoApprove = async (value: boolean) => {
    setError('');
    try {
      const cfg = await outreachUtils.setConfig(auth.token, value);
      setAutoApprove(cfg.autoApprove);
    } catch (e) {
      setError((e as { message?: string }).message || 'Failed to update auto-approve');
    }
  };

  if (!isAuthorized) {
    return (
      <Box sx={{ padding: 3 }} data-testid="admin-outreach-unauthorized">
        <Typography variant="h6">Not authorized</Typography>
        <Typography variant="body2">You must be signed in as an admin to view this page.</Typography>
      </Box>
    );
  }

  // Pre-process and categorize venues based on their real state and outreach history
  const awaitingReplyCampaigns = outreachRecords.filter((r) => r.status === 'sent' || r.status === 'replied');
  
  const awaitingReplyVenueIds = new Set(awaitingReplyCampaigns.map((r) => r.venueId));

  const neverPitchedVenues = allVenues.filter((v) => {
    if (v.outreachEligible === false) return false;
    if ((v as any).doNotContact === true) return false;
    if (v.bookingStatus === 'booked') return false;
    
    // Checked if they have ANY outreach campaigns listed
    const hasCampaign = outreachRecords.some((r) => r.venueId === v._id);
    return !hasCampaign;
  });

  const resolvedVenues = allVenues.filter((v) => {
    const isAwaitingReply = awaitingReplyVenueIds.has(v._id);
    const isNeverPitched = neverPitchedVenues.some((nv) => nv._id === v._id);
    return !isAwaitingReply && !isNeverPitched;
  });

  // Apply search filtering
  const q = search.trim().toLowerCase();
  
  const filteredAwaitingReply = awaitingReplyCampaigns.filter((r) => {
    const v = venuesMap[r.venueId];
    if (!q) return true;
    return (v?.name || '').toLowerCase().includes(q) || (v?.city || '').toLowerCase().includes(q);
  });

  const filteredNeverPitched = neverPitchedVenues.filter((v) => {
    if (!q) return true;
    return v.name.toLowerCase().includes(q) || (v.city || '').toLowerCase().includes(q);
  });

  const filteredResolved = resolvedVenues.filter((v) => {
    if (!q) return true;
    return v.name.toLowerCase().includes(q) || (v.city || '').toLowerCase().includes(q);
  });

  // Calculate days since send for sorting Awaiting Reply records
  const getDaysSinceSend = (r: IpendingReply) => {
    const sentDateStr = r.sentAt || r.repliedAt || '';
    if (!sentDateStr) return 0;
    const sentDate = new Date(sentDateStr);
    return Math.floor((new Date().getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Sort Awaiting Reply: longest days-since-send (oldest) at the top!
  const sortedAwaitingReply = [...filteredAwaitingReply].sort((a, b) => getDaysSinceSend(b) - getDaysSinceSend(a));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{
        padding: { xs: 2, sm: 4 }, maxWidth: 1200, margin: 'auto', width: '100%', minWidth: 0,
        backgroundColor: 'background.default', minHeight: '100vh',
      }} data-testid="admin-outreach-page">

        {/* Pinned Search and Dashboard Header */}
        <Paper elevation={3} sx={{
          p: 3, mb: 4, borderRadius: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white', position: 'sticky', top: 0, zIndex: 1100,
        }}>
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, letterSpacing: '-0.5px' }}>
                Outreach Workspace
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Human-driven venue cadence. Pitch, review replies, and log outcomes in seconds.
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 7 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search venues by name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'white', opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                    endAdornment: search && (
                      <InputAdornment position="end">
                        <Close sx={{ color: 'white', opacity: 0.7, cursor: 'pointer' }} onClick={() => setSearch('')} />
                      </InputAdornment>
                    ),
                    sx: {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.light',
                      },
                      borderRadius: 2,
                    }
                  }
                }}
              />
            </Grid>
          </Grid>

          {/* Quick Statistics Bar */}
          <Box sx={{ display: 'flex', gap: 4, mt: 3, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>AWAITING REPLY</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.light' }}>
                {awaitingReplyCampaigns.length} Active
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>NEVER PITCHED</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.light' }}>
                {neverPitchedVenues.length} Venues
              </Typography>
            </Box>
            {outreachRecords.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>REPLY REVIEW QUEUE</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.light' }} data-testid="replies-badge">
                  {outreachRecords.length}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Global Loading and Error display */}
        {globalLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }} data-testid="replies-loading">
            <CircularProgress size={40} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} data-testid="outreach-error" id="outreach-error">
            {error}
          </Alert>
        )}

        {repliesError && (
          <Alert severity="error" sx={{ mb: 3 }} data-testid="replies-error" id="replies-error">
            {repliesError}
          </Alert>
        )}

        {/* Accordions Sections */}
        {!globalLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* ACCORDION 1: Awaiting Reply (Pitched Venues) */}
            <Accordion defaultExpanded sx={{ borderRadius: 2, '&:before': { display: 'none' }, boxShadow: 2 }}>
              <AccordionSummary expandIcon={<DateRange />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <History color="warning" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Awaiting Reply ({sortedAwaitingReply.length})
                  </Typography>
                  <Chip size="small" label="Pitched" color="warning" variant="outlined" />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2, bgcolor: 'action.hover' }}>
                {sortedAwaitingReply.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }} data-testid="replies-empty">
                    <Typography color="text.secondary">No campaigns awaiting reply match your criteria.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {sortedAwaitingReply.map((reply) => {
                      const venue = venuesMap[reply.venueId];
                      const venueName = venue?.name || reply.venueId || 'Unknown Venue';
                      const isBounce = reply.replyKind === 'bounce';
                      const isExpanded = expandedVenueId === reply.venueId;
                      const daysAgo = getDaysSinceSend(reply);

                      return (
                        <Card key={reply._id} sx={{
                          borderRadius: 2, borderLeft: '6px solid',
                          borderColor: isBounce ? 'error.main' : reply.status === 'replied' ? 'info.main' : 'warning.main',
                          transition: 'all 0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                        }} data-testid={`reply-card-${reply._id}`}>
                          <CardContent>
                            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                              <Grid size={{ xs: 12, sm: 8 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold' }} data-testid={`reply-venue-${reply._id}`}>
                                    {venueName}
                                  </Typography>
                                  {venue?.city && (
                                    <Chip label={`${venue.city}, ${venue.usState || ''}`} size="small" variant="outlined" />
                                  )}
                                  {reply.suggestion?.sentiment && sentimentColors[reply.suggestion.sentiment] && (
                                    <Chip
                                      label={sentimentColors[reply.suggestion.sentiment].label}
                                      color={sentimentColors[reply.suggestion.sentiment].color}
                                      size="small"
                                      data-testid={`reply-sentiment-${reply._id}`}
                                    />
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {reply.targetDates ? `Target weekend: ${reply.targetDates}` : ''}
                                  {reply.bookingPeriod ? ` (${reply.bookingPeriod})` : ''}
                                  {` · Sent ${daysAgo} days ago`}
                                </Typography>

                                {isBounce && (
                                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Warning color="error" fontSize="small" />
                                    <Typography
                                      variant="body2"
                                      color="error.main"
                                      sx={{ fontWeight: 'medium' }}
                                      data-testid={`bounce-badge-${reply._id}`}
                                    >
                                      Bounced — needs new email
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 1 }} data-testid={`bounce-email-${reply._id}`}>
                                      Dead Email: {venue?.email || 'N/A'}
                                    </Typography>
                                  </Box>
                                )}

                                {!isBounce && reply.replySnippet && (
                                  <Box sx={{
                                    mt: 1.5, p: 1.5, bgcolor: 'rgba(0,0,0,0.03)',
                                    borderLeft: '4px solid #94a3b8', borderRadius: '0 4px 4px 0',
                                  }}>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }} data-testid={`reply-snippet-${reply._id}`}>
                                      "{reply.replySnippet}"
                                    </Typography>
                                  </Box>
                                )}

                                {reply.suggestion?.rationale && (
                                  <Typography variant="caption" color="text.secondary" sx={{
                                    display: 'flex', alignItems: 'center', gap: 0.5, mt: 1,
                                  }} data-testid={`reply-rationale-${reply._id}`}>
                                    <Info fontSize="inherit" /> AI Suggestion: {reply.suggestion.rationale}
                                  </Typography>
                                )}
                              </Grid>

                              <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                {!isBounce && (
                                  <Button
                                    variant={isExpanded ? 'contained' : 'outlined'}
                                    color="primary"
                                    size="small"
                                    onClick={() => setExpandedVenueId(isExpanded ? null : reply.venueId)}
                                  >
                                    {isExpanded ? 'Close Panel' : 'Record Outcome'}
                                  </Button>
                                )}
                              </Grid>
                            </Grid>

                            {/* Legacy suggestion action forms for backward compatibility */}
                            {!isBounce && reply.suggestion && (
                              <Box sx={{
                                mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider',
                                display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center',
                              }}>
                                <FormControl size="small" sx={{ minWidth: 180 }}>
                                  <InputLabel id={`status-label-${reply._id}`}>Proposed Venue Status</InputLabel>
                                  <Select
                                    labelId={`status-label-${reply._id}`}
                                    id={`status-select-${reply._id}`}
                                    value={
                                      localEdits[reply._id]?.bookingStatus !== undefined
                                        ? localEdits[reply._id].bookingStatus
                                        : (reply.suggestion.proposedBookingStatus || '')
                                    }
                                    label="Proposed Venue Status"
                                    onChange={(e) => handleStatusChange(reply._id, e.target.value as string)}
                                    data-testid={`reply-status-select-${reply._id}`}
                                  >
                                    <MenuItem value="booking">booking (prospect)</MenuItem>
                                    <MenuItem value="not-booking">not-booking (ruled out)</MenuItem>
                                    <MenuItem value="booked">booked (confirmed)</MenuItem>
                                  </Select>
                                </FormControl>

                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={
                                        localEdits[reply._id]?.interested !== undefined
                                          ? localEdits[reply._id].interested
                                          : (reply.suggestion.proposedInterested || false)
                                      }
                                      onChange={(e) => handleInterestedChange(reply._id, e.target.checked)}
                                      data-testid={`reply-interested-checkbox-${reply._id}`}
                                    />
                                  }
                                  label="Warm Lead"
                                />

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    startIcon={<Check />}
                                    onClick={() => handleApplySuggestion(reply._id)}
                                    data-testid={`reply-apply-btn-${reply._id}`}
                                  >
                                    Apply Suggestion
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="warning"
                                    size="small"
                                    startIcon={<Undo />}
                                    onClick={() => handleReopen(reply._id)}
                                    data-testid={`reply-reopen-btn-${reply._id}`}
                                  >
                                    Reopen
                                  </Button>
                                  <Button
                                    variant="text"
                                    color="inherit"
                                    size="small"
                                    onClick={() => handleDismiss(reply._id)}
                                    data-testid={`reply-dismiss-btn-${reply._id}`}
                                  >
                                    Dismiss
                                  </Button>
                                </Box>
                              </Box>
                            )}

                            {/* Slide Down Expanded Touch Timeline Panel */}
                            {isExpanded && venue && (
                              <Box sx={{ mt: 3, pt: 3, borderTop: '1px dashed', borderColor: 'divider' }}>
                                <Grid container spacing={3}>
                                  
                                  {/* Left: Contact Touch Timeline (Newest First) */}
                                  <Grid size={{ xs: 12, md: 7 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <History /> Contact Touch Timeline
                                    </Typography>

                                    <Box sx={{ borderLeft: '2px solid #cbd5e1', pl: 2, ml: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                      {((venue as any).touches || []).slice().reverse().map((touch: Itouch, idx: number) => {
                                        let touchColor = '#475569';
                                        let touchIcon = <Info fontSize="small" style={{ color: 'white' }} />;

                                        if (touch.type === 'email') {
                                          touchColor = '#0284c7';
                                          touchIcon = <Mail fontSize="small" style={{ color: 'white' }} />;
                                        } else if (touch.type === 'call') {
                                          touchColor = '#ea580c';
                                          touchIcon = <Phone fontSize="small" style={{ color: 'white' }} />;
                                        } else if (touch.type === 'outcome') {
                                          touchColor = touch.outcome === 'booked'
                                            ? '#8b5cf6'
                                            : touch.outcome === 'interested'
                                              ? '#10b981'
                                              : '#ef4444';
                                          touchIcon = <CheckCircle fontSize="small" style={{ color: 'white' }} />;
                                        }

                                        return (
                                          <Box key={idx} sx={{ position: 'relative' }}>
                                            {/* Vertical line dot */}
                                            <Box sx={{
                                              position: 'absolute', left: '-25px', top: '2px',
                                              width: '18px', height: '18px', borderRadius: '50%',
                                              backgroundColor: touchColor, display: 'flex',
                                              alignItems: 'center', justifyContent: 'center',
                                              boxShadow: 1,
                                            }}>
                                              {touchIcon}
                                            </Box>

                                            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle2" sx={{
                                                  fontWeight: 'bold', color: touchColor, textTransform: 'capitalize',
                                                }}>
                                                  {touch.type === 'outcome' ? `Outcome: ${touch.outcome}` : touch.type}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                  {new Date(touch.date).toLocaleDateString()}
                                                </Typography>
                                              </Box>
                                              {touch.templateType && (
                                                <Typography variant="body2" color="text.secondary">
                                                  Template: <strong>{touch.templateType}</strong>
                                                </Typography>
                                              )}
                                              {touch.note && (
                                                <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                                                  {touch.note}
                                                </Typography>
                                              )}
                                              {touch.actor && (
                                                <Typography variant="caption" color="text.secondary" sx={{
                                                  display: 'block', mt: 1, textAlign: 'right',
                                                }}>
                                                  By: {touch.actor}
                                                </Typography>
                                              )}
                                            </Box>
                                          </Box>
                                        );
                                      })}
                                      {((venue as any).touches || []).length === 0 && (
                                        <Typography variant="body2" color="text.secondary">No touch history recorded.</Typography>
                                      )}
                                    </Box>
                                  </Grid>

                                  {/* Right: One-tap Outcome Panel */}
                                  <Grid size={{ xs: 12, md: 5 }}>
                                    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: 'background.paper' }}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        Record Outcome
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Button
                                          fullWidth
                                          variant="contained"
                                          color="success"
                                          startIcon={<ThumbUp />}
                                          onClick={() => handleRecordInterested(reply._id)}
                                          sx={{ py: 1, textTransform: 'none', fontWeight: 'bold' }}
                                        >
                                          Replied - Interested
                                        </Button>

                                        <Button
                                          fullWidth
                                          variant="contained"
                                          color="error"
                                          startIcon={<Block />}
                                          onClick={() => handleRecordNotInterested(reply._id, reply.venueId)}
                                          sx={{ py: 1, textTransform: 'none', fontWeight: 'bold' }}
                                        >
                                          Replied - Not Interested (DNC)
                                        </Button>

                                        <Button
                                          fullWidth
                                          variant="contained"
                                          color="secondary"
                                          startIcon={<CheckCircle />}
                                          onClick={() => handleRecordBooked(reply._id, reply.venueId)}
                                          sx={{
                                            py: 1, textTransform: 'none', fontWeight: 'bold',
                                            bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' },
                                          }}
                                        >
                                          Booked (Confirm Gig)
                                        </Button>

                                        <Button
                                          fullWidth
                                          variant="outlined"
                                          color="warning"
                                          startIcon={<ExitToApp />}
                                          onClick={() => handleRecordNotAFit(reply._id)}
                                          sx={{ py: 1, textTransform: 'none', fontWeight: 'bold' }}
                                        >
                                          Not a fit for format, door open
                                        </Button>
                                      </Box>
                                    </Paper>
                                  </Grid>

                                </Grid>
                              </Box>
                            )}

                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

            {/* ACCORDION 2: Never Pitched Venues */}
            <Accordion sx={{ borderRadius: 2, '&:before': { display: 'none' }, boxShadow: 2 }}>
              <AccordionSummary expandIcon={<DateRange />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PlaylistAdd color="success" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Never Pitched ({filteredNeverPitched.length})
                  </Typography>
                  <Chip size="small" label="Fresh" color="success" variant="outlined" />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2, bgcolor: 'action.hover' }}>
                {filteredNeverPitched.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No unpitched venues match your criteria.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredNeverPitched.map((venue) => (
                      <Card key={venue._id} sx={{
                        borderRadius: 2, borderLeft: '6px solid', borderColor: 'success.main',
                        transition: 'all 0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                      }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {venue.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {venue.city ? `${venue.city}, ${venue.usState || ''}` : 'Location unknown'}
                              {venue.venueType ? ` · Type: ${venue.venueType}` : ''}
                            </Typography>
                          </Box>
                          
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => {
                              // Automatically load candidates and pre-populate batch form
                              setStructuredDate(new Date().toISOString().split('T')[0]);
                              setSearch('');
                              // Scroll down to batch outreach
                              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                            }}
                          >
                            Add to Pitch Batch
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

            {/* ACCORDION 3: Booked / Interested / Do Not Contact (Collapsed by Default) */}
            <Accordion sx={{ borderRadius: 2, '&:before': { display: 'none' }, boxShadow: 2 }}>
              <AccordionSummary expandIcon={<DateRange />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AssignmentTurnedIn color="disabled" />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Booked / Interested / Do not contact ({filteredResolved.length})
                  </Typography>
                  <Chip size="small" label="Resolved" variant="outlined" />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2, bgcolor: 'action.hover' }}>
                {filteredResolved.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No resolved venues match your criteria.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {filteredResolved.map((venue) => {
                      let statusText = 'Eligible / Pool';
                      let statusColor: 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' = 'default';

                      if ((venue as any).doNotContact) {
                        statusText = 'Do Not Contact';
                        statusColor = 'error';
                      } else if (venue.bookingStatus === 'booked') {
                        statusText = 'Booked';
                        statusColor = 'success';
                      } else if (venue.interested) {
                        statusText = 'Warm Lead';
                        statusColor = 'primary';
                      } else if (venue.outreachEligible === false) {
                        statusText = 'Not Eligible / Not a Fit';
                        statusColor = 'warning';
                      }

                      return (
                        <Card key={venue._id} sx={{ borderRadius: 2, borderLeft: '4px solid #94a3b8' }}>
                          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {venue.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {venue.city ? `${venue.city}, ${venue.usState || ''}` : ''}
                              </Typography>
                            </Box>
                            <Chip size="small" label={statusText} color={statusColor} />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

          </Box>
        )}

        <Divider sx={{ marginY: 6 }} />

        {/* Batch Outreach Rebuild Section */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'background.paper' }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
            Batch Outreach Cadence
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Prepare, customize, and preview outreach campaigns for target weekends.
          </Typography>

          <FormControlLabel
            control={(
              <Switch checked={autoApprove} onChange={(e) => toggleAutoApprove(e.target.checked)}
                aria-label="auto-approve" data-testid="auto-approve-toggle" />
            )}
            label="Auto-approve (let the AI agent send batches without review)"
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-end', mb: 4 }}>
            <DatePicker
              label="Weekend (eligibility)"
              value={structuredDate ? new Date(`${structuredDate}T00:00:00`) : null}
              onChange={(newDate: Date | null) => {
                if (!newDate) {
                  setStructuredDate('');
                  setBookingPeriod('');
                  setTargetDates('');
                  return;
                }
                const year = newDate.getFullYear();
                const month = String(newDate.getMonth() + 1).padStart(2, '0');
                const day = String(newDate.getDate()).padStart(2, '0');
                const val = `${year}-${month}-${day}`;
                setStructuredDate(val);
                setBookingPeriod(deriveSeason(val));
                setTargetDates(deriveDisplayDate(val));
              }}
              data-testid="outreach-structured-date"
              slotProps={{ textField: { size: 'small', sx: { minWidth: 220 } } }}
            />
            <TextField
              size="small"
              label="Target dates (display)"
              value={targetDates}
              onChange={(e) => setTargetDates(e.target.value)}
              placeholder="e.g. Sept 25-27"
              data-testid="outreach-target-dates"
              sx={{ minWidth: 200 }}
            />
            <TextField
              size="small"
              label="Booking period"
              value={bookingPeriod}
              onChange={(e) => setBookingPeriod(e.target.value)}
              placeholder="e.g. fall 2026"
              data-testid="outreach-booking-period"
              sx={{ minWidth: 180 }}
            />
            <Button
              variant="contained"
              onClick={loadCandidates}
              disabled={batchLoading}
              data-testid="outreach-load"
              sx={{ py: 1, px: 3, fontWeight: 'bold' }}
            >
              {batchLoading ? 'Scanning...' : 'Find Eligible Venues'}
            </Button>
          </Box>

          {candidates.length > 0 && (
            <Box sx={{ mt: 3 }} data-testid="outreach-candidates">
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                {selected.size} of {candidates.length} venues selected for pitch
              </Typography>
              
              <Grid container spacing={2} sx={{ maxHeight: 300, overflowY: 'auto', mb: 3, p: 1, border: '1px solid #f1f5f9', borderRadius: 2 }}>
                {candidates.map((c) => {
                  const hasGigs = checkWeekendGigs(c.name, structuredDate);
                  const isConflict = hasGigs.length > 0;

                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={c._id}>
                      <Paper variant="outlined" sx={{
                        p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderColor: isConflict ? 'warning.light' : 'divider',
                        bgcolor: isConflict ? 'rgba(245, 158, 11, 0.05)' : 'background.paper',
                      }}>
                        <FormControlLabel
                          sx={{ flexGrow: 1 }}
                          control={(
                            <Checkbox checked={selected.has(c._id)} onChange={() => toggleCandidate(c._id)}
                              aria-label={c.name} data-testid={`outreach-cb-${c._id}`} />
                          )}
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {candidateLabel(c)}
                              </Typography>
                              {isConflict && (
                                <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Warning fontSize="inherit" /> Overlapping gig exists in the window
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary" onClick={openDialog}
                  disabled={selected.size === 0} data-testid="outreach-open-dialog" sx={{ fontWeight: 'bold' }}>
                  Compose & Batch Outreach
                </Button>
              </Box>
            </Box>
          )}

          {result && (
            <Box sx={{
              mt: 4, p: 3, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid', borderColor: 'success.light',
            }} data-testid="outreach-result">
              <Typography variant="subtitle1" sx={{
                fontWeight: 'bold', color: 'success.main', display: 'flex',
                alignItems: 'center', gap: 1, mb: 1,
              }}>
                <CheckCircle /> Batch Sent Successfully
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Sent <strong>{result.sent}</strong> of <strong>{result.requested}</strong> requested pitches. Skipped {result.skipped.length}.
              </Typography>
              {result.skipped.map((s) => (
                <Typography key={s.venueId} variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                  {s.venueId}: {s.reason}
                </Typography>
              ))}
            </Box>
          )}
        </Paper>

        {/* Outreach batch dialog */}
        <OutreachDialog
          open={dialogOpen}
          candidates={candidates}
          selected={selected}
          targetDates={targetDates}
          bookingPeriod={bookingPeriod}
          previews={previews}
          previewLoading={previewLoading}
          previewError={previewError}
          sending={sending}
          onSend={send}
          onClose={() => setDialogOpen(false)}
        />

        {/* DIALOG 1: Confirm DNC Dialog */}
        <Dialog open={confirmDncId !== null} onClose={() => setConfirmDncId(null)}>
          <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Block color="error" /> Confirm Permanent Do-Not-Contact
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Are you sure you want to mark this reply as <strong>Not Interested</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action is permanent: it will flag this venue as <strong>Do Not Contact (DNC)</strong>,
              meaning they will be excluded from all future outreach campaigns and lists forever.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setConfirmDncId(null)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={confirmDnc}>
              Confirm Permanent DNC
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG 2: Gig Date Picker Dialog for Booked Outcome */}
        <Dialog open={bookingDateId !== null} onClose={() => setBookingDateId(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Event color="primary" /> Confirm Gig Booking
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Choose the confirmed date of this booked gig:
            </Typography>
            <DatePicker
              label="Gig Date"
              value={gigDateStr ? new Date(`${gigDateStr}T00:00:00`) : null}
              onChange={(newDate: Date | null) => {
                if (!newDate) { setGigDateStr(''); return; }
                const year = newDate.getFullYear();
                const month = String(newDate.getMonth() + 1).padStart(2, '0');
                const day = String(newDate.getDate()).padStart(2, '0');
                setGigDateStr(`${year}-${month}-${day}`);
              }}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setBookingDateId(null)}>Cancel</Button>
            <Button
              variant="contained" color="secondary" onClick={confirmBooking} disabled={!gigDateStr}
              sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
            >
              Confirm & Lock Booking
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </LocalizationProvider>
  );
}

