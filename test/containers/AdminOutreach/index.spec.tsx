/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthContext, defaultAuth, type Iauth } from 'src/providers/Auth.provider';
import { AdminOutreach } from 'src/containers/AdminOutreach';
import adminVenuesUtils from 'src/containers/AdminVenues/admin-venues.utils';
import outreachUtils, { type Icandidate, type IbatchResult, type IpitchPreview } from 'src/containers/AdminOutreach/outreach.utils';

const candidates: Icandidate[] = [
  { _id: 'c1', name: 'Venue A', city: 'Salem', venueType: 'Originals' },
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
    outreachUtils.getAllowedAdminRoles = vi.fn(() => ['JaM-admin']) as any;
    outreachUtils.getConfig = vi.fn(() => Promise.resolve({ autoApprove: false })) as any;
    outreachUtils.getCandidates = vi.fn(() => Promise.resolve(candidates)) as any;
    outreachUtils.sendBatch = vi.fn(() => Promise.resolve(okResult)) as any;
    outreachUtils.setConfig = vi.fn((_t: string, v: boolean) => Promise.resolve({ autoApprove: v })) as any;
    outreachUtils.getPreview = vi.fn(() => Promise.resolve(previews)) as any;
    outreachUtils.getPendingReplies = vi.fn(() => Promise.resolve([])) as any;
    outreachUtils.applySuggestion = vi.fn(() => Promise.resolve({})) as any;
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
      venueIds: ['c1', 'c2'], targetDates: 'Aug 15-17', bookingPeriod: 'summer 2026',
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
  });
});

