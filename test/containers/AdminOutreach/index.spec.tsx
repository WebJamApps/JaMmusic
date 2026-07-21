/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthContext, defaultAuth, type Iauth } from 'src/providers/Auth.provider';
import { AdminOutreach } from 'src/containers/AdminOutreach';
import adminVenuesUtils from 'src/containers/AdminVenues/admin-venues.utils';
import outreachUtils, { type Icandidate, type IbatchResult, type IpitchPreview } from 'src/containers/AdminOutreach/outreach.utils';

const candidates: Icandidate[] = [
  {
    _id: 'c1',
    name: 'Venue A',
    city: 'Salem',
    venueType: 'Originals',
    reason: {
      lastGigDate: '2025-01-10T12:00:00.000Z',
      gigIntervalMonths: 2,
      nearestGigMonthsAway: 4.5,
      spacingNote: 'clear — nearest gig ~4.5 mo away',
      resumeBookingExpired: true,
    },
  },
  { _id: 'c2', name: 'Venue B' },
];
const okResult: IbatchResult = { requested: 2, sent: 2, skipped: [], records: [] };
const previews: IpitchPreview[] = [
  { venueId: 'c1', venueName: 'Venue A', subject: 'Subject A', body: 'Body A' },
  { venueId: 'c2', venueName: 'Venue B', subject: 'Subject B', body: 'Body B' },
];

const adminAuth: Iauth = {
  isAuthenticated: true,
  error: '',
  token: 'tk',
  user: { userType: 'JaM-admin', email: 'a@b.com' },
};

const wrap = (auth: Iauth) => (
  <AuthContext.Provider value={{ auth, setAuth: () => { /* noop */ } }}>
    <AdminOutreach />
  </AuthContext.Provider>
);

const renderPage = async () => { await act(async () => { render(wrap(adminAuth)); }); };
const typeDates = () => fireEvent.change(screen.getByLabelText('Weekend (eligibility)'), { target: { value: '2026-08-15' } });

describe('AdminOutreach', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    outreachUtils.getAllowedAdminRoles = vi.fn(() => ['JaM-admin']) as any;
    outreachUtils.getConfig = vi.fn(() => Promise.resolve({ autoApprove: false })) as any;
    outreachUtils.getCandidates = vi.fn(() => Promise.resolve(candidates)) as any;
    outreachUtils.sendBatch = vi.fn(() => Promise.resolve(okResult)) as any;
    outreachUtils.setConfig = vi.fn((_t: string, v: boolean) => Promise.resolve({ autoApprove: v })) as any;
    outreachUtils.getPreview = vi.fn(() => Promise.resolve(previews)) as any;
    outreachUtils.getPendingReplies = vi.fn(() => Promise.resolve([])) as any;
    outreachUtils.applySuggestion = vi.fn(() => Promise.resolve({})) as any;
    outreachUtils.listOutreach = vi.fn(() => Promise.resolve([])) as any;
    outreachUtils.recordOutcome = vi.fn(() => Promise.resolve({})) as any;
    adminVenuesUtils.listVenues = vi.fn(() => Promise.resolve([])) as any;
  });

  it('renders not-authorized when not authenticated', () => {
    render(wrap(defaultAuth));
    expect(screen.getByTestId('admin-outreach-unauthorized')).toBeDefined();
  });

  it('renders the page and loads the auto-approve config on mount', async () => {
    await renderPage();
    expect(screen.getByTestId('admin-outreach-page')).toBeDefined();
    expect(outreachUtils.getConfig).toHaveBeenCalledWith('tk');
  });

  it('does not crash when the config read fails', async () => {
    outreachUtils.getConfig = vi.fn(() => Promise.reject(new Error('cfg'))) as any;
    await renderPage();
    expect(screen.getByTestId('admin-outreach-page')).toBeDefined();
  });

  it('errors if you load candidates without target dates', async () => {
    await renderPage();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    expect(screen.getByTestId('outreach-error')).toBeDefined();
    expect(outreachUtils.getCandidates).not.toHaveBeenCalled();
  });

  it('loads + preselects the proposed venues', async () => {
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    expect(outreachUtils.getCandidates).toHaveBeenCalledWith('tk', 'Aug 15-17', '2026-08-15');
    expect(screen.getByTestId('outreach-candidates').textContent).toContain('2 of 2');
  });

  it('toggling a candidate reduces the selection count', async () => {
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByRole('checkbox', { name: /Venue A/i })); });
    expect(screen.getByTestId('outreach-candidates').textContent).toContain('1 of 2');
  });

  it('renders qualification reasons next to checkbox when provided', async () => {
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });

    // Verify c1 (with reason) renders reasons
    const reasonContainer = screen.getByTestId('outreach-reason-c1');
    expect(reasonContainer).toBeInTheDocument();

    const chips = reasonContainer.children;
    const labels = Array.from(chips).map(chip => chip.getAttribute('label') || chip.textContent || '');

    expect(labels.some(l => l.includes('clear — nearest gig ~4.5 mo away'))).toBe(true);
    expect(labels.some(l => l.includes('Last Gig:'))).toBe(true);
    expect(labels.some(l => l.includes('Cooldown Expired'))).toBe(true);

    // Verify c2 (without reason) does not render reasons
    expect(screen.queryByTestId('outreach-reason-c2')).toBeNull();
  });

  it('opens dialog and shows previews', async () => {
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });
    expect(outreachUtils.getPreview).toHaveBeenCalledWith('tk', ['c1', 'c2'], 'Aug 15-17');
    expect(screen.getByTestId('outreach-dialog')).toBeDefined();
    expect(screen.getByTestId('preview-c1')).toBeDefined();
  });

  it('sends the batch and shows the result', async () => {
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-dialog-send')); });
    expect(outreachUtils.sendBatch).toHaveBeenCalledWith('tk', expect.objectContaining({
      venueIds: ['c1', 'c2'],
      targetDates: 'Aug 15-17',
      bookingPeriod: 'summer 2026',
      targetWeekend: { start: '2026-08-15', end: '2026-08-17' },
    }));
    expect(screen.getByTestId('outreach-result').textContent).toContain('Sent 2 of 2');
  });

  it('renders skip reasons in the result', async () => {
    outreachUtils.sendBatch = vi.fn(() => Promise.resolve({
      requested: 2, sent: 1, skipped: [{ venueId: 'c2', reason: 'not outreach-eligible' }], records: [],
    })) as any;
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-dialog-send')); });
    expect(screen.getByTestId('outreach-result').textContent).toContain('not outreach-eligible');
  });

  it('shows an error when loading candidates fails', async () => {
    outreachUtils.getCandidates = vi.fn(() => Promise.reject(new Error('load fail'))) as any;
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    expect(screen.getByTestId('outreach-error').textContent).toBe('load fail');
  });

  it('shows an error when get preview fails', async () => {
    outreachUtils.getPreview = vi.fn(() => Promise.reject(new Error('preview fail'))) as any;
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });
    expect(screen.getByTestId('preview-error').textContent).toBe('preview fail');
  });

  it('shows an error when the batch send fails', async () => {
    outreachUtils.sendBatch = vi.fn(() => Promise.reject(new Error('send fail'))) as any;
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-dialog-send')); });
    expect(screen.getByTestId('outreach-error').textContent).toBe('send fail');
  });

  it('toggles auto-approve via setConfig', async () => {
    await renderPage();
    await act(async () => { fireEvent.click(screen.getByRole('checkbox', { name: /auto-approve/i })); });
    expect(outreachUtils.setConfig).toHaveBeenCalledWith('tk', true);
  });

  it('shows an error when setConfig fails', async () => {
    outreachUtils.setConfig = vi.fn(() => Promise.reject(new Error('cfg fail'))) as any;
    await renderPage();
    await act(async () => { fireEvent.click(screen.getByRole('checkbox', { name: /auto-approve/i })); });
    expect(screen.getByTestId('outreach-error').textContent).toBe('cfg fail');
  });

  describe('Replies to Review', () => {
    const mockPendingReplies = [
      {
        _id: 'r1',
        venueId: 'v1',
        status: 'replied',
        targetDates: 'Sept 25-27',
        bookingPeriod: 'fall 2026',
        repliedAt: '2026-07-02T10:00:00Z',
        replySnippet: 'We would love to book you!',
        suggestion: {
          sentiment: 'positive',
          proposedBookingStatus: 'booking',
          proposedInterested: true,
          rationale: 'Positive booking interest.',
          model: 'gemini-3.5-flash',
        },
      },
      {
        _id: 'r2',
        venueId: 'v2',
        status: 'replied',
        replyKind: 'bounce',
      },
      {
        _id: 'r3',
        venueId: 'v3',
        status: 'replied',
        suggestion: {
          sentiment: 'negative',
          proposedBookingStatus: 'not-booking',
          proposedInterested: false,
          rationale: 'Negative sentiment.',
        },
      },
      {
        _id: 'r4',
        venueId: 'v4',
        status: 'replied',
        suggestion: {
          sentiment: 'needs-info',
          proposedBookingStatus: 'booking',
          proposedInterested: false,
          rationale: 'Needs more info.',
        },
      },
      {
        _id: 'r5',
        venueId: 'v_unknown',
        status: 'replied',
      },
      {
        _id: 'r6',
        venueId: '',
        status: 'replied',
      }
    ];

    const mockVenuesList = [
      { _id: 'v1', name: 'Boston Hall', city: 'Boston', usState: 'MA', email: 'v1@boston.com' },
      { _id: 'v2', name: 'Cambridge Club', city: 'Cambridge', usState: 'MA', email: 'v2@cambridge.com' },
      { _id: 'v3', name: 'Worcester Space', city: 'Worcester', usState: 'MA', email: 'v3@worcester.com' },
      { _id: 'v4', name: 'Lowell Theatre', city: 'Lowell', usState: 'MA', email: 'v4@lowell.com' },
      { _id: 'v5', name: 'Never Pitched Pub', city: 'Amherst', usState: 'MA', email: 'v5@never.com', outreachEligible: true },
      { _id: 'v6', name: 'Booked resolved', city: 'Quincy', usState: 'MA', email: 'v6@booked.com', bookingStatus: 'booked' },
    ];

    it('renders empty replies section when there are no pending replies', async () => {
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue([]);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesList);
      await renderPage();
      expect(screen.getByTestId('replies-empty')).toBeInTheDocument();
      expect(screen.queryByTestId('replies-badge')).toBeNull();
    });

    it('renders error message when getPendingReplies fails', async () => {
      outreachUtils.getPendingReplies = vi.fn().mockRejectedValue(new Error('Replies failed'));
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesList);
      await renderPage();
      expect(screen.getByTestId('replies-error')).toBeInTheDocument();
      expect(screen.getByTestId('replies-error').textContent).toContain('Replies failed');
    });

    it('renders the list of pending replies with positive/negative/needs-info sentiment and fallback venue names', async () => {
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesList);
      await renderPage();

      // Badge displays correct number of total pending replies
      expect(screen.getByTestId('replies-badge').textContent).toBe('6');

      // v1 - positive
      expect(screen.getByTestId('reply-venue-r1').textContent).toBe('Boston Hall');
      expect(screen.getByTestId('reply-sentiment-r1')).toHaveAttribute('label', 'Positive Reply');
      expect(screen.getByTestId('reply-snippet-r1').textContent).toContain('We would love to book you!');
      expect(screen.getByTestId('reply-rationale-r1').textContent).toContain('Positive booking interest.');

      // v2 - bounce
      expect(screen.getByTestId('reply-venue-r2').textContent).toBe('Cambridge Club');
      expect(screen.getByTestId('bounce-badge-r2')).toBeInTheDocument();
      expect(screen.getByTestId('bounce-badge-r2').textContent).toContain('Bounced — needs new email');
      expect(screen.getByTestId('bounce-email-r2').textContent).toContain('Dead Email: v2@cambridge.com');
      // No action buttons on bounce card
      expect(screen.queryByTestId('reply-apply-btn-r2')).toBeNull();
      expect(screen.queryByTestId('reply-reopen-btn-r2')).toBeNull();
      expect(screen.queryByTestId('reply-dismiss-btn-r2')).toBeNull();

      // v3 - negative
      expect(screen.getByTestId('reply-venue-r3').textContent).toBe('Worcester Space');
      expect(screen.getByTestId('reply-sentiment-r3')).toHaveAttribute('label', 'Negative Reply');

      // v4 - needs-info
      expect(screen.getByTestId('reply-venue-r4').textContent).toBe('Lowell Theatre');
      expect(screen.getByTestId('reply-sentiment-r4')).toHaveAttribute('label', 'Needs Info');

      // v_unknown - venue mapping fallback to venueId
      expect(screen.getByTestId('reply-venue-r5').textContent).toBe('v_unknown');

      // empty venueId - fallback to 'Unknown Venue'
      expect(screen.getByTestId('reply-venue-r6').textContent).toBe('Unknown Venue');
    });

    it('supports changing status and checkbox value and applying suggestion', async () => {
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesList);
      await renderPage();

      // Find select and checkbox for r1
      const selectElement = screen.getByTestId('reply-status-select-r1');
      expect(selectElement).toBeDefined();

      // Simulate status select change
      fireEvent.change(selectElement, { target: { value: 'not-booking' } });

      // Toggle interest checkbox
      const checkboxInput = screen.getByTestId('reply-interested-checkbox-r1');
      expect(checkboxInput).toBeDefined();
      fireEvent.click(checkboxInput);

      // Apply suggestion
      await act(async () => {
        fireEvent.click(screen.getByTestId('reply-apply-btn-r1'));
      });

      expect(outreachUtils.applySuggestion).toHaveBeenCalledWith('tk', 'r1', {
        bookingStatus: 'not-booking',
        interested: false,
      });
      // Should reload the pending replies
      expect(outreachUtils.getPendingReplies).toHaveBeenCalledTimes(2);
    });

    it('supports reopening outreach', async () => {
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesList);
      await renderPage();

      await act(async () => {
        fireEvent.click(screen.getByTestId('reply-reopen-btn-r1'));
      });

      expect(outreachUtils.applySuggestion).toHaveBeenCalledWith('tk', 'r1', {
        reopen: true,
      });
      // Should reload the pending replies
      expect(outreachUtils.getPendingReplies).toHaveBeenCalledTimes(2);
    });

    it('supports dismissing suggestion', async () => {
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesList);
      await renderPage();

      await act(async () => {
        fireEvent.click(screen.getByTestId('reply-dismiss-btn-r1'));
      });

      expect(outreachUtils.applySuggestion).toHaveBeenCalledWith('tk', 'r1', {
        dismiss: true,
      });
      // Should reload the pending replies
      expect(outreachUtils.getPendingReplies).toHaveBeenCalledTimes(2);
    });

    it('handles error when applySuggestion fails on apply', async () => {
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesList);
      outreachUtils.applySuggestion = vi.fn().mockRejectedValue(new Error('Apply failed'));
      await renderPage();

      await act(async () => {
        fireEvent.click(screen.getByTestId('reply-apply-btn-r1'));
      });

      expect(screen.getByTestId('replies-error')).toBeInTheDocument();
      expect(screen.getByTestId('replies-error').textContent).toContain('Apply failed');
    });

    it('handles error when applySuggestion fails on reopen', async () => {
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesList);
      outreachUtils.applySuggestion = vi.fn().mockRejectedValue(new Error('Reopen failed'));
      await renderPage();

      await act(async () => {
        fireEvent.click(screen.getByTestId('reply-reopen-btn-r1'));
      });

      expect(screen.getByTestId('replies-error')).toBeInTheDocument();
      expect(screen.getByTestId('replies-error').textContent).toContain('Reopen failed');
    });

    it('handles error when applySuggestion fails on dismiss', async () => {
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesList);
      outreachUtils.applySuggestion = vi.fn().mockRejectedValue(new Error('Dismiss failed'));
      await renderPage();

      await act(async () => {
        fireEvent.click(screen.getByTestId('reply-dismiss-btn-r1'));
      });

      expect(screen.getByTestId('replies-error')).toBeInTheDocument();
      expect(screen.getByTestId('replies-error').textContent).toContain('Dismiss failed');
    });

    it('supports searching, expanding detail panel, and recording outcomes', async () => {
      const mockVenuesListWithTouches = [
        {
          _id: 'v1',
          name: 'Boston Hall',
          city: 'Boston',
          usState: 'MA',
          email: 'v1@boston.com',
          touches: [
            { type: 'email', date: '2026-07-01', template: 'rebuild-first', actor: 'Josh' }
          ]
        },
        { _id: 'v2', name: 'Cambridge Club', city: 'Cambridge', usState: 'MA', email: 'v2@cambridge.com' },
        { _id: 'v3', name: 'Worcester Space', city: 'Worcester', usState: 'MA', email: 'v3@worcester.com' },
        { _id: 'v4', name: 'Lowell Theatre', city: 'Lowell', usState: 'MA', email: 'v4@lowell.com' },
      ];
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesListWithTouches);
      await renderPage();

      // Test searching
      const searchInput = screen.getByPlaceholderText('Search venues by name or city...');
      expect(searchInput).toBeInTheDocument();
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'Boston' } });
      });

      // Expand "Record Outcome" panel
      const recordOutcomeBtn = screen.getByTestId('reply-card-r1').querySelector('button');
      expect(recordOutcomeBtn).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(recordOutcomeBtn!);
      });

      // Click "Replied - Interested" one-tap outcome button
      const interestedBtn = screen.getByText('Replied - Interested');
      expect(interestedBtn).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(interestedBtn);
      });
      expect(outreachUtils.recordOutcome).toHaveBeenCalledWith('tk', 'r1', { status: 'interested' });

      // Re-expand panel to test Not Interested (DNC) outcome flow
      await act(async () => {
        fireEvent.click(recordOutcomeBtn!);
      });

      const notInterestedBtn = screen.getByText('Replied - Not Interested (DNC)');
      expect(notInterestedBtn).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(notInterestedBtn);
      });

      // Dialog should be open
      expect(screen.getByText(/Are you sure you want to mark this reply as/)).toBeInTheDocument();
      const confirmDncBtn = screen.getByText('Confirm Permanent DNC');
      await act(async () => {
        fireEvent.click(confirmDncBtn);
      });
      expect(outreachUtils.recordOutcome).toHaveBeenCalledWith('tk', 'r1', { status: 'not-interested' });

      // Re-expand panel to test Not a fit outcome flow
      await act(async () => {
        fireEvent.click(recordOutcomeBtn!);
      });

      const notAFitBtn = screen.getByText('Not a fit for format, door open');
      expect(notAFitBtn).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(notAFitBtn);
      });
      expect(outreachUtils.recordOutcome).toHaveBeenCalledWith('tk', 'r1', { status: 'not-a-fit' });

      // Re-expand panel to test Booked outcome flow
      await act(async () => {
        fireEvent.click(recordOutcomeBtn!);
      });

      const bookedBtn = screen.getByText('Booked (Confirm Gig)');
      expect(bookedBtn).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(bookedBtn);
      });

      // Type booked date
      const dateInput = screen.getByLabelText('Gig Date');
      expect(dateInput).toBeInTheDocument();
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2026-10-10' } });
      });

      const confirmBookingBtn = screen.getByText('Confirm & Lock Booking');
      await act(async () => {
        fireEvent.click(confirmBookingBtn);
      });
      expect(outreachUtils.recordOutcome).toHaveBeenCalledWith('tk', 'r1', { status: 'booked', bookedDate: '2026-10-10' });
    });

    it('handles error when recordOutcome fails', async () => {
      const mockVenuesListWithTouches = [
        {
          _id: 'v1',
          name: 'Boston Hall',
          city: 'Boston',
          usState: 'MA',
          email: 'v1@boston.com',
          touches: [
            { type: 'email', date: '2026-07-01', template: 'rebuild-first', actor: 'Josh' }
          ]
        },
      ];
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesListWithTouches);
      outreachUtils.recordOutcome = vi.fn().mockRejectedValue(new Error('Record failed'));
      await renderPage();

      const recordOutcomeBtn = screen.getByTestId('reply-card-r1').querySelector('button');
      await act(async () => {
        fireEvent.click(recordOutcomeBtn!);
      });

      const interestedBtn = screen.getByText('Replied - Interested');
      await act(async () => {
        fireEvent.click(interestedBtn);
      });

      // Check that error state is displayed
      expect(screen.getByTestId('outreach-error')).toBeInTheDocument();
      expect(screen.getByTestId('outreach-error').textContent).toContain('Record failed');
    });

    it('supports closing the DNC and booking confirmation dialogs via Cancel', async () => {
      const mockVenuesListWithTouches = [
        {
          _id: 'v1',
          name: 'Boston Hall',
          city: 'Boston',
          usState: 'MA',
          email: 'v1@boston.com',
          touches: [
            { type: 'email', date: '2026-07-01', template: 'rebuild-first', actor: 'Josh' }
          ]
        },
      ];
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesListWithTouches);
      await renderPage();

      // Expand "Record Outcome" panel
      const recordOutcomeBtn = screen.getByTestId('reply-card-r1').querySelector('button');
      await act(async () => {
        fireEvent.click(recordOutcomeBtn!);
      });

      // 1. DNC Dialog cancel
      const notInterestedBtn = screen.getByText('Replied - Not Interested (DNC)');
      await act(async () => {
        fireEvent.click(notInterestedBtn);
      });
      // Click Cancel in DNC dialog
      const cancelDncBtn = screen.getAllByRole('button', { name: 'Cancel' })[0];
      await act(async () => {
        fireEvent.click(cancelDncBtn);
      });

      // 2. Booked Dialog cancel
      const bookedBtn = screen.getByText('Booked (Confirm Gig)');
      await act(async () => {
        fireEvent.click(bookedBtn);
      });
      // Click Cancel in Booked dialog
      const cancelBookedBtn = screen.getAllByRole('button', { name: 'Cancel' })[0];
      expect(cancelBookedBtn).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(cancelBookedBtn);
      });
    });

    it('opens and closes OutreachDialog via Cancel button', async () => {
      await renderPage();
      typeDates();
      await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
      await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });
      const cancelBtn = screen.getByTestId('outreach-dialog-cancel');
      expect(cancelBtn).toBeInTheDocument();
      await act(async () => { fireEvent.click(cancelBtn); });
    });

    it('supports expanding the Never Pitched and Resolved accordions', async () => {
      const mockVenuesListWithAll = [
        { _id: 'v1', name: 'Boston Hall', city: 'Boston', usState: 'MA', email: 'v1@boston.com' },
        { _id: 'v2', name: 'Cambridge Club', city: 'Cambridge', usState: 'MA', email: 'v2@cambridge.com' },
        { _id: 'v3', name: 'Worcester Space', city: 'Worcester', usState: 'MA', email: 'v3@worcester.com' },
        { _id: 'v4', name: 'Lowell Theatre', city: 'Lowell', usState: 'MA', email: 'v4@lowell.com' },
        { _id: 'v5', name: 'Never Pitched Pub', city: 'Amherst', usState: 'MA', email: 'v5@never.com', outreachEligible: true },
        { _id: 'v6', name: 'Booked resolved', city: 'Quincy', usState: 'MA', email: 'v6@booked.com', bookingStatus: 'booked' },
        { _id: 'v7', name: 'DNC Venue', city: 'Quincy', usState: 'MA', email: 'v7@dnc.com', doNotContact: true },
        { _id: 'v8', name: 'Not a fit venue', city: 'Amherst', usState: 'MA', email: 'v8@notafit.com', outreachEligible: false },
        { _id: 'v9', name: 'Warm Lead Venue', city: 'Boston', usState: 'MA', email: 'v9@warm.com', interested: true },
      ];
      const mockPendingRepliesWithV9 = [
        ...mockPendingReplies,
        {
          _id: 'r_v9',
          venueId: 'v9',
          status: 'dismissed'
        }
      ];
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingRepliesWithV9);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesListWithAll);
      await renderPage();

      // Click "Never Pitched" accordion
      const neverPitchedAccordion = screen.getByText(/Never Pitched \(1\)/);
      expect(neverPitchedAccordion).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(neverPitchedAccordion);
      });
      expect(screen.getByText('Never Pitched Pub')).toBeInTheDocument();

      // Click "Booked / Interested / Do not contact" accordion
      const resolvedAccordion = screen.getByText(/Booked \/ Interested \/ Do not contact \(4\)/);
      expect(resolvedAccordion).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(resolvedAccordion);
      });
      expect(screen.getByText('Booked resolved')).toBeInTheDocument();
      expect(screen.getByText('DNC Venue')).toBeInTheDocument();
      expect(screen.getByText('Not a fit venue')).toBeInTheDocument();
      expect(screen.getByText('Warm Lead Venue')).toBeInTheDocument();
    });

    it('supports triggering onClose and empty DatePicker onChange', async () => {
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesList);
      await renderPage();
      typeDates();
      await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
      await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });

      // Click mock-close-button for OutreachDialog (dialog index 0)
      const closeButtons = screen.getAllByTestId('dialog-mock-close-button');
      await act(async () => {
        fireEvent.click(closeButtons[0]);
      });

      // Clear the Weekend DatePicker input to trigger null onChange branch
      const weekendInput = screen.getByLabelText('Weekend (eligibility)');
      await act(async () => {
        fireEvent.change(weekendInput, { target: { value: '' } });
      });

      // Expand "Record Outcome" panel
      const recordOutcomeBtn = screen.getByTestId('reply-card-r1').querySelector('button');
      await act(async () => {
        fireEvent.click(recordOutcomeBtn!);
      });

      // Click Cancel on DNC Dialog to trigger Cancel button onClick (line 1185)
      const notInterestedBtn = screen.getByText('Replied - Not Interested (DNC)');
      await act(async () => {
        fireEvent.click(notInterestedBtn);
      });
      const cancelButtons = screen.getAllByText('Cancel');
      for (const btn of cancelButtons) {
        await act(async () => {
          fireEvent.click(btn);
        });
      }

      // Re-trigger DNC Dialog onClose via hidden close button
      await act(async () => {
        fireEvent.click(notInterestedBtn);
      });
      const updatedCloseButtons = screen.getAllByTestId('dialog-mock-close-button');
      await act(async () => {
        fireEvent.click(updatedCloseButtons[1]); // DNC Dialog is index 1
      });

      // Click Cancel on Booked Dialog to trigger Cancel button onClick (line 1215)
      const bookedBtn = screen.getByText('Booked (Confirm Gig)');
      await act(async () => {
        fireEvent.click(bookedBtn);
      });
      const cancelButtons2 = screen.getAllByText('Cancel');
      for (const btn of cancelButtons2) {
        await act(async () => {
          fireEvent.click(btn);
        });
      }

      // Re-trigger Booked Dialog onClose via hidden close button
      await act(async () => {
        fireEvent.click(bookedBtn);
      });
      const finalCloseButtons = screen.getAllByTestId('dialog-mock-close-button');
      await act(async () => {
        fireEvent.click(finalCloseButtons[2]); // Booked Dialog is index 2
      });

      // Re-open Booked dialog to trigger empty DatePicker onChange
      await act(async () => {
        fireEvent.click(bookedBtn);
      });
      const dateInput = screen.getByLabelText('Gig Date');
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '' } });
      });
      expect(dateInput).toBeInTheDocument();
    });

    it('supports typing into target dates and booking period fields', async () => {
      await renderPage();
      const targetDatesInput = screen.getByTestId('outreach-target-dates');
      const bookingPeriodInput = screen.getByTestId('outreach-booking-period');
      
      await act(async () => {
        fireEvent.change(targetDatesInput, { target: { value: 'Aug 14-16' } });
        fireEvent.change(bookingPeriodInput, { target: { value: 'August' } });
      });
      
      expect(targetDatesInput).toHaveValue('Aug 14-16');
      expect(bookingPeriodInput).toHaveValue('August');
    });

    it('covers all types of touches in the venue contact timeline', async () => {
      const mockVenuesWithAllTouches = [
        {
          _id: 'v1',
          name: 'Boston Hall',
          city: 'Boston',
          usState: 'MA',
          email: 'v1@boston.com',
          touches: [
            { type: 'email', date: '2026-07-01', template: 'pitch', actor: 'Josh' },
            { type: 'call', date: '2026-07-02', actor: 'Josh' },
            { type: 'outcome', date: '2026-07-03', outcome: 'booked', bookedDate: '2026-10-10', actor: 'Josh' },
            { type: 'outcome', date: '2026-07-04', outcome: 'interested', actor: 'Josh' },
            { type: 'outcome', date: '2026-07-05', outcome: 'not-interested', actor: 'Josh' },
            { type: 'other', date: '2026-07-06', actor: 'Josh' },
          ]
        }
      ];
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesWithAllTouches);
      await renderPage();

      // Expand "Record Outcome" panel
      const recordOutcomeBtn = screen.getByTestId('reply-card-r1').querySelector('button');
      await act(async () => {
        fireEvent.click(recordOutcomeBtn!);
      });

      // It should display the timeline and render all touches
      expect(screen.getByText('Contact Touch Timeline')).toBeInTheDocument();
    });

    it('supports clicking Add to Pitch Batch on a Never Pitched venue', async () => {
      const mockVenuesListWithNeverPitched = [
        { _id: 'v5', name: 'Never Pitched Pub', city: 'Amherst', usState: 'MA', email: 'v5@never.com', outreachEligible: true },
      ];
      outreachUtils.getPendingReplies = vi.fn().mockResolvedValue(mockPendingReplies);
      adminVenuesUtils.listVenues = vi.fn().mockResolvedValue(mockVenuesListWithNeverPitched);
      await renderPage();

      // Click "Never Pitched" accordion
      const neverPitchedAccordion = screen.getByText(/Never Pitched \(1\)/);
      await act(async () => {
        fireEvent.click(neverPitchedAccordion);
      });

      // Find and click "Add to Pitch Batch"
      const addPitchBtn = screen.getByRole('button', { name: /Add to Pitch Batch/i });
      await act(async () => {
        fireEvent.click(addPitchBtn);
      });

      expect(window.scrollTo).toHaveBeenCalled();
    });
  });
});

