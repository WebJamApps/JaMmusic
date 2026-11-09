import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  AnnounceGigDialog,
  getDefaultPromoUrl,
  formatPostedDate,
  getGigPostedPictures,
  isPicturePosted,
  getPicturePostedInfo,
  buildPictureStripUrls,
  determineStartingImageUrl,
} from 'src/containers/Music/Gigs/AnnounceGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';
import type { Igig } from 'src/providers/Data.provider';
import type { Iauth } from 'src/providers/Auth.provider';
import type { Ivenue } from 'src/containers/AdminVenues/admin-venues.utils';

describe('AnnounceGigDialog', () => {
  const mockAuth: Iauth = {
    token: 'test-token',
    error: '',
    isAuthenticated: true,
    user: { userType: 'JaM-admin', email: 'admin@example.com' },
  };

  const sampleGig: Igig = {
    _id: 'gig-123',
    venue: 'Slow Play Brewing',
    city: 'Rock Hill',
    usState: 'SC',
    datetime: new Date('2026-09-26T22:00:00.000Z'),
    duration: 3,
    tickets: '',
    promoImageUrl: 'https://example.com/promo.jpg',
    venueId: {
      _id: 'venue-456',
      name: 'Slow Play Brewing',
      city: 'Rock Hill',
      usState: 'SC',
      website: 'www.slowplaybrewing.com',
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when open is false or gig is null', () => {
    const { container: c1 } = render(
      <AnnounceGigDialog
        gig={null}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );
    expect(c1).toBeEmptyDOMElement();

    const { container: c2 } = render(
      <AnnounceGigDialog
        gig={sampleGig}
        open={false}
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );
    expect(c2).toBeEmptyDOMElement();
  });

  it('fetches venue details to populate venue instagramUsername and website', async () => {
    vi.spyOn(utils, 'fetchVenue').mockResolvedValue({
      _id: 'venue-456',
      name: 'Slow Play Brewing',
      instagramUsername: 'slowplaybeer',
      website: 'https://slowplaybrewing.com',
    });

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    expect(screen.getByText('Announce Gig to Instagram')).toBeInTheDocument();

    const mariaInput = screen.getByLabelText(/Maria Sherman Instagram Tag/i) as HTMLInputElement;
    expect(mariaInput.value).toBe('chemmariasherman');

    await waitFor(() => {
      const venueInput = screen.getByLabelText(/Venue Instagram Tag/i) as HTMLInputElement;
      expect(venueInput.value).toBe('slowplaybeer');
    });

    const img = screen.getByAltText('Promo preview') as HTMLImageElement;
    expect(img.src).toBe('https://example.com/promo.jpg');
  });

  it('leaves venue tag field empty when venue has no instagramUsername or gig has no venueId', async () => {
    const gigNoVenue: Igig = {
      _id: 'gig-999',
      venue: 'Barn Show',
      tickets: '',
      datetime: new Date('2026-09-26T22:00:00.000Z'),
    };

    render(
      <AnnounceGigDialog
        gig={gigNoVenue}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    const venueInput = screen.getByLabelText(/Venue Instagram Tag/i) as HTMLInputElement;
    expect(venueInput.value).toBe('');
    expect(screen.getByText(/Default Josh & Maria photo will be used/i)).toBeInTheDocument();
  });

  it('allows editing tag fields without mutating the venue record', async () => {
    vi.spyOn(utils, 'fetchVenue').mockResolvedValue({
      _id: 'venue-456',
      name: 'Slow Play Brewing',
      instagramUsername: 'slowplaybeer',
    });

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    await waitFor(() => {
      expect((screen.getByLabelText(/Venue Instagram Tag/i) as HTMLInputElement).value).toBe('slowplaybeer');
    });

    const venueInput = screen.getByLabelText(/Venue Instagram Tag/i);
    fireEvent.change(venueInput, { target: { value: '@new_venue_handle' } });
    expect((venueInput as HTMLInputElement).value).toBe('new_venue_handle');

    const mariaInput = screen.getByLabelText(/Maria Sherman Instagram Tag/i);
    fireEvent.change(mariaInput, { target: { value: '' } });
    expect((mariaInput as HTMLInputElement).value).toBe('');
  });

  it('allows editing imageUrl and caption, updating the preview', async () => {
    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    const urlInput = screen.getByLabelText(/Image URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://newsite.com/image.png' } });
    expect((urlInput as HTMLInputElement).value).toBe('https://newsite.com/image.png');

    const img = screen.getByAltText('Promo preview') as HTMLImageElement;
    expect(img.src).toBe('https://newsite.com/image.png');

    const captionEditor = screen.getByTestId('announce-caption') as HTMLTextAreaElement;
    fireEvent.change(captionEditor, { target: { value: '<p>Custom announcement caption!</p>' } });
    expect(captionEditor.value).toBe('<p>Custom announcement caption!</p>');
  });

  it('submits Confirm sending POST /gig/:id/announce with caption, imageUrl and userTags on success', async () => {
    const announceSpy = vi.spyOn(utils, 'announceGig').mockResolvedValue({
      ok: true,
      instagram: { ok: true, id: 'ig-post-123' },
    });
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={onClose}
        auth={mockAuth}
        onSuccess={onSuccess}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(announceSpy).toHaveBeenCalledWith('test-token', 'gig-123', {
        caption: expect.stringContaining('Josh & Maria'),
        imageUrl: 'https://example.com/promo.jpg',
        userTags: ['chemmariasherman', ''],
        collaborators: ['chemmariasherman'],
        locationId: undefined,
      });
      expect(onSuccess).toHaveBeenCalled();
      expect(screen.getByText(/Gig announced successfully to Instagram!/i)).toBeInTheDocument();
    });
  });

  it('displays Instagram error text in plain words when announce fails', async () => {
    vi.spyOn(utils, 'announceGig').mockResolvedValue({
      ok: false,
      instagram: { ok: false, error: 'Instagram account restricted or username invalid' },
    });

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Instagram error: Instagram account restricted or username invalid/i),
      ).toBeInTheDocument();
    });

    // The dialog stays open so user can correct input and retry
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={onClose}
        auth={mockAuth}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('resets venue tag immediately when opening a new preview, preventing stale tags on failed lookup', async () => {
    // 1. First preview: gig A loads with a venue tag
    vi.spyOn(utils, 'fetchVenue').mockResolvedValueOnce({
      _id: 'venue-456',
      name: 'Slow Play Brewing',
      instagramUsername: 'venue_a_handle',
    });

    const { rerender } = render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    await waitFor(() => {
      const venueInput = screen.getByLabelText(/Venue Instagram Tag/i) as HTMLInputElement;
      expect(venueInput.value).toBe('venue_a_handle');
    });

    // Close preview for gig A
    rerender(
      <AnnounceGigDialog
        gig={null}
        open={false}
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    // 2. Second preview: open gig B with a different venueId whose lookup fails / returns null
    const gigB: Igig = {
      _id: 'gig-2',
      venue: 'Second Venue',
      tickets: '',
      datetime: new Date('2026-10-15T22:00:00.000Z'),
      venueId: 'venue-789',
    };

    let resolveLookupB!: (val: null) => void;
    const lookupBPromise = new Promise<null>((resolve) => {
      resolveLookupB = resolve;
    });
    vi.spyOn(utils, 'fetchVenue').mockReturnValueOnce(lookupBPromise);

    rerender(
      <AnnounceGigDialog
        gig={gigB}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    // Verify venue tag is immediately cleared, NOT retaining venue_a_handle
    const venueInputB = screen.getByLabelText(/Venue Instagram Tag/i) as HTMLInputElement;
    expect(venueInputB.value).toBe('');

    // Now resolve lookup B with null (failed read)
    resolveLookupB(null);
    await lookupBPromise;

    // Verify venue tag remains empty
    expect((screen.getByLabelText(/Venue Instagram Tag/i) as HTMLInputElement).value).toBe('');
  });

  it('preserves administrator caption and tag edits when delayed venue lookup completes', async () => {
    let resolveVenue!: (val: Ivenue) => void;
    const deferredVenuePromise = new Promise<Ivenue>((resolve) => {
      resolveVenue = resolve;
    });
    vi.spyOn(utils, 'fetchVenue').mockReturnValueOnce(deferredVenuePromise);

    const announceSpy = vi.spyOn(utils, 'announceGig').mockResolvedValue({
      ok: true,
      instagram: { ok: true, id: 'post-custom' },
    });

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    // Venue tag is initially empty while fetch is pending
    const venueInput = screen.getByLabelText(/Venue Instagram Tag/i) as HTMLInputElement;
    expect(venueInput.value).toBe('');

    // Administrator edits caption before lookup completes
    const captionEditor = screen.getByTestId('announce-caption') as HTMLTextAreaElement;
    fireEvent.change(captionEditor, { target: { value: '<p>Admin custom edited caption</p>' } });
    expect(captionEditor.value).toBe('<p>Admin custom edited caption</p>');

    // Administrator edits venue tag before lookup completes
    fireEvent.change(venueInput, { target: { value: '@admin_chosen_tag' } });
    expect(venueInput.value).toBe('admin_chosen_tag');

    // Late venue response arrives with different defaults
    resolveVenue({
      _id: 'venue-456',
      name: 'Slow Play Brewing',
      instagramUsername: 'late_default_tag',
      website: 'https://late-default-website.com',
    });
    await deferredVenuePromise;

    // Verify user edits were NOT overwritten by late venue response
    expect(captionEditor.value).toBe('<p>Admin custom edited caption</p>');
    expect(venueInput.value).toBe('admin_chosen_tag');

    // Confirm post preserves administrator's chosen values
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(announceSpy).toHaveBeenCalledWith('test-token', 'gig-123', {
        caption: '<p>Admin custom edited caption</p>',
        imageUrl: 'https://example.com/promo.jpg',
        userTags: ['chemmariasherman', 'admin_chosen_tag'],
        collaborators: ['chemmariasherman'],
        locationId: undefined,
      });
    });
  });

  it('preserves administrator clearing venue tag when delayed venue lookup completes', async () => {
    let resolveVenue!: (val: Ivenue) => void;
    const deferredVenuePromise = new Promise<Ivenue>((resolve) => {
      resolveVenue = resolve;
    });
    vi.spyOn(utils, 'fetchVenue').mockReturnValueOnce(deferredVenuePromise);

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    const venueInput = screen.getByLabelText(/Venue Instagram Tag/i) as HTMLInputElement;
    fireEvent.change(venueInput, { target: { value: '' } });

    // Late venue response arrives with instagramUsername
    resolveVenue({
      _id: 'venue-456',
      name: 'Slow Play Brewing',
      instagramUsername: 'should_not_restore_tag',
      website: 'https://venue.com',
    });
    await deferredVenuePromise;

    expect(venueInput.value).toBe('');
  });

  it('populates Location from venue facebookPageId read through fetchVenue and initializes Collaborator to chemmariasherman', async () => {
    vi.spyOn(utils, 'fetchVenue').mockResolvedValue({
      _id: 'venue-456',
      name: 'Slow Play Brewing',
      facebookPageId: '378590115336095',
    });

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    const collabInput = screen.getByLabelText(/Collaborator/i) as HTMLInputElement;
    expect(collabInput.value).toBe('chemmariasherman');

    await waitFor(() => {
      const locInput = screen.getByLabelText(/Location/i) as HTMLInputElement;
      expect(locInput.value).toBe('378590115336095');
    });
  });

  it('submits Confirm with edited collaborator and location in confirm body', async () => {
    const announceSpy = vi.spyOn(utils, 'announceGig').mockResolvedValue({
      ok: true,
      instagram: { ok: true, id: 'ig-custom-123' },
    });

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    const collabInput = screen.getByLabelText(/Collaborator/i);
    fireEvent.change(collabInput, { target: { value: '@custom_collab' } });
    expect((collabInput as HTMLInputElement).value).toBe('custom_collab');

    const locInput = screen.getByLabelText(/Location/i);
    fireEvent.change(locInput, { target: { value: '987654321' } });
    expect((locInput as HTMLInputElement).value).toBe('987654321');

    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(announceSpy).toHaveBeenCalledWith('test-token', 'gig-123', expect.objectContaining({
        collaborators: ['custom_collab'],
        locationId: '987654321',
      }));
    });
  });

  it('sends empty collaborators list when Collaborator field is cleared and omits locationId when blank', async () => {
    const announceSpy = vi.spyOn(utils, 'announceGig').mockResolvedValue({
      ok: true,
      instagram: { ok: true, id: 'ig-post-empty' },
    });

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    const collabInput = screen.getByLabelText(/Collaborator/i);
    fireEvent.change(collabInput, { target: { value: '' } });
    expect((collabInput as HTMLInputElement).value).toBe('');

    const locInput = screen.getByLabelText(/Location/i);
    fireEvent.change(locInput, { target: { value: '   ' } });

    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(announceSpy).toHaveBeenCalledWith('test-token', 'gig-123', expect.objectContaining({
        collaborators: [],
        locationId: undefined,
      }));
    });
  });

  it('shows "Posted without the location" message when response carries locationDropped', async () => {
    vi.spyOn(utils, 'announceGig').mockResolvedValue({
      ok: true,
      instagram: {
        ok: true,
        id: 'ig-post-123',
        locationDropped: 'Error 100: Invalid location ID',
      },
    });

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Posted without the location: Instagram refused it: Error 100: Invalid location ID/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy caption/i })).toBeInTheDocument();
  });

  it('offers Facebook hand-off (Copy caption, Download picture, Open Facebook) after Instagram succeeds', async () => {
    vi.spyOn(utils, 'announceGig').mockResolvedValue({
      ok: true,
      instagram: { ok: true, id: 'ig-post-fb' },
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    const downloadSpy = vi.spyOn(utils, 'downloadAnnounceImage').mockImplementation(() => {});
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    expect(screen.queryByText('Facebook')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: /Copy caption/i });
    fireEvent.click(copyBtn);
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
      expect(screen.getByText('Caption copied to clipboard!')).toBeInTheDocument();
    });

    const downloadBtn = screen.getByRole('button', { name: /Download picture/i });
    fireEvent.click(downloadBtn);
    expect(downloadSpy).toHaveBeenCalledWith('gig-123');

    const openFbBtn = screen.getByRole('button', { name: /Open Facebook/i });
    fireEvent.click(openFbBtn);
    expect(openSpy).toHaveBeenCalledWith('https://www.facebook.com/', '_blank', 'noopener,noreferrer');
  });

  it('preserves administrator location edits when delayed venue lookup completes and does not mutate venue record', async () => {
    let resolveVenue!: (val: Ivenue) => void;
    const deferredVenuePromise = new Promise<Ivenue>((resolve) => {
      resolveVenue = resolve;
    });
    vi.spyOn(utils, 'fetchVenue').mockReturnValueOnce(deferredVenuePromise);

    render(
      <AnnounceGigDialog
        gig={sampleGig}
        open
        onClose={vi.fn()}
        auth={mockAuth}
      />,
    );

    const locInput = screen.getByLabelText(/Location/i) as HTMLInputElement;
    expect(locInput.value).toBe('');

    fireEvent.change(locInput, { target: { value: 'custom_page_id_123' } });
    expect(locInput.value).toBe('custom_page_id_123');

    resolveVenue({
      _id: 'venue-456',
      name: 'Slow Play Brewing',
      facebookPageId: 'stale_lookup_id',
    });
    await deferredVenuePromise;

    expect(locInput.value).toBe('custom_page_id_123');
  });

  describe('picture strip in Announce preview', () => {
    it('formats posted date correctly', () => {
      expect(formatPostedDate(new Date('2026-11-08T18:00:00.000Z'))).toBe('posted Nov 8');
      expect(formatPostedDate('2026-09-26T22:00:00.000Z')).toBe('posted Sept 26');
      expect(formatPostedDate('invalid-date')).toBe('');
    });

    it('builds posted pictures map from gig announcements and announceImageUrl', () => {
      expect(getGigPostedPictures(null).size).toBe(0);

      const gig: Igig = {
        _id: 'g1',
        venue: 'Test Venue',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        announceImageUrl: 'https://example.com/legacy.jpg',
        announcedAt: '2026-11-01T12:00:00.000Z',
        announcements: [
          {
            imageUrl: 'https://example.com/pic1.jpg',
            at: '2026-11-05T12:00:00.000Z',
          },
          {
            imageUrl: 'https://example.com/pic1.jpg',
            at: '2026-11-08T12:00:00.000Z',
          },
        ],
      };

      const map = getGigPostedPictures(gig);
      expect(map.size).toBe(2);
      expect(map.get('https://example.com/legacy.jpg')?.dateLabel).toBe('posted Nov 1');
      // For pic1, the newer date (Nov 8) takes precedence
      expect(map.get('https://example.com/pic1.jpg')?.dateLabel).toBe('posted Nov 8');
    });

    it('checks isPicturePosted and getPicturePostedInfo with default promo url handling', () => {
      const map = new Map([
        ['https://api.example.com/gig/promo-default.jpg', {
          postedDate: new Date('2026-11-01T12:00:00.000Z'),
          dateLabel: 'posted Nov 1',
        }],
        ['https://example.com/pic1.jpg', {
          postedDate: new Date('2026-11-05T12:00:00.000Z'),
          dateLabel: 'posted Nov 5',
        }],
      ]);

      expect(isPicturePosted('https://example.com/pic1.jpg', map)).toBe(true);
      expect(isPicturePosted('https://example.com/pic2.jpg', map)).toBe(false);
      // default photo match even with different host prefix
      expect(isPicturePosted('/gig/promo-default.jpg', map)).toBe(true);

      expect(getPicturePostedInfo('https://example.com/pic1.jpg', map)?.dateLabel).toBe('posted Nov 5');
      expect(getPicturePostedInfo('/gig/promo-default.jpg', map)?.dateLabel).toBe('posted Nov 1');
      expect(getPicturePostedInfo('https://example.com/unknown.jpg', map)).toBeUndefined();
    });

    it('buildPictureStripUrls returns distinct promoImageUrls followed by default photo', () => {
      const gigs: Igig[] = [
        {
          _id: '1', venue: 'V1', datetime: new Date(), tickets: '', promoImageUrl: 'https://example.com/pic1.jpg',
        },
        {
          _id: '2', venue: 'V2', datetime: new Date(), tickets: '', promoImageUrl: 'https://example.com/pic2.jpg',
        },
        {
          _id: '3', venue: 'V3', datetime: new Date(), tickets: '', promoImageUrl: 'https://example.com/pic1.jpg',
        },
        {
          _id: '4', venue: 'V4', datetime: new Date(), tickets: '', promoImageUrl: '   ',
        },
      ];

      const urls = buildPictureStripUrls(gigs, '/gig/promo-default.jpg');
      expect(urls).toEqual([
        'https://example.com/pic1.jpg',
        'https://example.com/pic2.jpg',
        '/gig/promo-default.jpg',
      ]);
    });

    it('buildPictureStripUrls always places default photo strictly last, even when an existing gig promoImageUrl equals defaultUrl', () => {
      const defaultUrl = '/gig/promo-default.jpg';
      const gigs: Igig[] = [
        {
          _id: '1', venue: 'V1', datetime: new Date(), tickets: '', promoImageUrl: defaultUrl,
        },
        {
          _id: '2', venue: 'V2', datetime: new Date(), tickets: '', promoImageUrl: 'https://example.com/other.jpg',
        },
      ];

      const urls = buildPictureStripUrls(gigs, defaultUrl);
      expect(urls).toEqual([
        'https://example.com/other.jpg',
        defaultUrl,
      ]);

      // When choosing starting image with first unposted, the non-default gig photo is preferred ahead of default
      const starting = determineStartingImageUrl({
        _id: 'g3', venue: 'V3', datetime: new Date(), tickets: '',
      }, urls, new Map(), defaultUrl);
      expect(starting).toBe('https://example.com/other.jpg');
    });

    it('determineStartingImageUrl chooses gig promo, else first unposted in strip, else longest ago', () => {
      const defaultUrl = '/gig/promo-default.jpg';
      const stripUrls = ['https://example.com/pic1.jpg', 'https://example.com/pic2.jpg', defaultUrl];

      // 1. Gig own picture unposted
      const gigUnposted: Igig = {
        _id: 'g1',
        venue: 'V',
        datetime: new Date(),
        tickets: '',
        promoImageUrl: 'https://example.com/pic1.jpg',
      };
      expect(determineStartingImageUrl(gigUnposted, stripUrls, new Map(), defaultUrl)).toBe('https://example.com/pic1.jpg');

      // 2. Gig own picture posted -> choose first unposted in strip
      const postedMap = new Map([
        ['https://example.com/pic1.jpg', {
          postedDate: new Date('2026-11-05T12:00:00.000Z'),
          dateLabel: 'posted Nov 5',
        }],
      ]);
      expect(determineStartingImageUrl(gigUnposted, stripUrls, postedMap, defaultUrl)).toBe('https://example.com/pic2.jpg');

      // 3. All pictures posted -> choose longest ago
      const allPostedMap = new Map([
        ['https://example.com/pic1.jpg', {
          postedDate: new Date('2026-11-05T12:00:00.000Z'),
          dateLabel: 'posted Nov 5',
        }],
        ['https://example.com/pic2.jpg', {
          postedDate: new Date('2026-10-01T12:00:00.000Z'),
          dateLabel: 'posted Oct 1',
        }],
        [defaultUrl, {
          postedDate: new Date('2026-11-01T12:00:00.000Z'),
          dateLabel: 'posted Nov 1',
        }],
      ]);
      expect(determineStartingImageUrl(gigUnposted, stripUrls, allPostedMap, defaultUrl)).toBe('https://example.com/pic2.jpg');

      // 4. Fallback when only default url exists and gig has no promoImageUrl
      expect(determineStartingImageUrl({
        _id: 'g2', venue: 'V', datetime: new Date(), tickets: '',
      }, [defaultUrl], new Map(), defaultUrl)).toBe('');
    });

    it('renders picture strip with loaded gigs, updates input and preview when a picture is clicked', () => {
      const defaultPhoto = getDefaultPromoUrl();
      const gig1: Igig = {
        _id: 'g1',
        venue: 'V1',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/pic1.jpg',
      };
      const gig2: Igig = {
        _id: 'g2',
        venue: 'V2',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/pic2.jpg',
      };
      const gig3: Igig = {
        _id: 'g3',
        venue: 'V3',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/pic1.jpg',
      };

      render(
        <AnnounceGigDialog
          gig={gig1}
          gigs={[gig1, gig2, gig3]}
          open
          onClose={vi.fn()}
          auth={mockAuth}
        />,
      );

      const strip = screen.getByTestId('announce-picture-strip');
      expect(strip).toBeInTheDocument();

      const item0 = screen.getByTestId('picture-strip-item-0');
      const item1 = screen.getByTestId('picture-strip-item-1');
      const item2 = screen.getByTestId('picture-strip-item-2');
      expect(item0).toBeInTheDocument();
      expect(item1).toBeInTheDocument();
      expect(item2).toBeInTheDocument();

      const imageInput = screen.getByLabelText(/Image URL/i) as HTMLInputElement;
      expect(imageInput.value).toBe('https://example.com/pic1.jpg');

      const previewImg = screen.getByAltText('Promo preview') as HTMLImageElement;
      expect(previewImg.src).toBe('https://example.com/pic1.jpg');

      // Click picture 2
      fireEvent.click(item1);
      expect(imageInput.value).toBe('https://example.com/pic2.jpg');
      expect(previewImg.src).toBe('https://example.com/pic2.jpg');

      // Click default photo
      fireEvent.click(item2);
      expect(imageInput.value).toBe(defaultPhoto);
    });

    it('shows posted date on strip items posted for this gig', () => {
      const gigWithAnnouncements: Igig = {
        _id: 'g1',
        venue: 'Slow Play Brewing',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/pic1.jpg',
        announcements: [
          {
            imageUrl: 'https://example.com/pic1.jpg',
            at: '2026-11-08T18:00:00.000Z',
          },
        ],
      };
      const gig2: Igig = {
        _id: 'g2',
        venue: 'Durty Bull Brewing',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/pic2.jpg',
      };

      render(
        <AnnounceGigDialog
          gig={gigWithAnnouncements}
          gigs={[gigWithAnnouncements, gig2]}
          open
          onClose={vi.fn()}
          auth={mockAuth}
        />,
      );

      const item0 = screen.getByTestId('picture-strip-item-0');
      expect(item0).toHaveTextContent('posted Nov 8');
      expect(item0).toHaveAttribute('aria-label', expect.stringContaining('posted Nov 8'));

      const item1 = screen.getByTestId('picture-strip-item-1');
      expect(item1).not.toHaveTextContent('posted');
    });

    it('opens on first unposted picture when gig own picture is already posted', () => {
      const gigPostedOwn: Igig = {
        _id: 'g1',
        venue: 'Slow Play Brewing',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/pic1.jpg',
        announcements: [
          {
            imageUrl: 'https://example.com/pic1.jpg',
            at: '2026-11-08T18:00:00.000Z',
          },
        ],
      };
      const gig2: Igig = {
        _id: 'g2',
        venue: 'Durty Bull Brewing',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/pic2.jpg',
      };

      render(
        <AnnounceGigDialog
          gig={gigPostedOwn}
          gigs={[gigPostedOwn, gig2]}
          open
          onClose={vi.fn()}
          auth={mockAuth}
        />,
      );

      const imageInput = screen.getByLabelText(/Image URL/i) as HTMLInputElement;
      expect(imageInput.value).toBe('https://example.com/pic2.jpg');
    });

    it('opens on picture posted longest ago when all strip pictures have been posted', () => {
      const defaultPhoto = getDefaultPromoUrl();
      const gigAllPosted: Igig = {
        _id: 'g1',
        venue: 'Slow Play Brewing',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/pic1.jpg',
        announcements: [
          {
            imageUrl: 'https://example.com/pic1.jpg',
            at: '2026-11-10T12:00:00.000Z',
          },
          {
            imageUrl: 'https://example.com/pic2.jpg',
            at: '2026-11-02T12:00:00.000Z',
          },
          {
            imageUrl: defaultPhoto,
            at: '2026-11-06T12:00:00.000Z',
          },
        ],
      };
      const gig2: Igig = {
        _id: 'g2',
        venue: 'Durty Bull Brewing',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/pic2.jpg',
      };

      render(
        <AnnounceGigDialog
          gig={gigAllPosted}
          gigs={[gigAllPosted, gig2]}
          open
          onClose={vi.fn()}
          auth={mockAuth}
        />,
      );

      const imageInput = screen.getByLabelText(/Image URL/i) as HTMLInputElement;
      expect(imageInput.value).toBe('https://example.com/pic2.jpg');
    });

    it('leaves out of the strip any picture that fails to load via onError', () => {
      const gig1: Igig = {
        _id: 'g1',
        venue: 'V1',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/broken.jpg',
      };
      const gig2: Igig = {
        _id: 'g2',
        venue: 'V2',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/working.jpg',
      };

      render(
        <AnnounceGigDialog
          gig={gig1}
          gigs={[gig1, gig2]}
          open
          onClose={vi.fn()}
          auth={mockAuth}
        />,
      );

      expect(screen.getByTestId('picture-strip-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('picture-strip-item-1')).toBeInTheDocument();

      const brokenImg = screen.getByAltText('Picture option 1');
      expect(brokenImg).toHaveAttribute('src', 'https://example.com/broken.jpg');

      fireEvent.error(brokenImg);

      expect(screen.queryByAltText('Picture option 1')).toBeInTheDocument();
      const remainingOption1 = screen.getByAltText('Picture option 1');
      expect(remainingOption1).toHaveAttribute('src', 'https://example.com/working.jpg');
      expect(screen.queryByAltText('Picture option 2')).not.toBeInTheDocument();
    });

    it('refreshes gigs after a successful confirm while retaining submitted caption, success controls, and disabled Confirm', async () => {
      vi.spyOn(utils, 'announceGig').mockResolvedValue({
        ok: true,
        instagram: { ok: true, id: 'ig-post-123' },
      });

      const gig1: Igig = {
        _id: 'g1',
        venue: 'Slow Play Brewing',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/pic1.jpg',
      };
      const gig2: Igig = {
        _id: 'g2',
        venue: 'Durty Bull Brewing',
        datetime: new Date('2026-09-26T22:00:00.000Z'),
        tickets: '',
        promoImageUrl: 'https://example.com/pic2.jpg',
      };

      const { rerender } = render(
        <AnnounceGigDialog
          gig={gig1}
          gigs={[gig1, gig2]}
          open
          onClose={vi.fn()}
          auth={mockAuth}
        />,
      );

      const captionTextarea = screen.getByTestId('announce-caption') as HTMLTextAreaElement;
      fireEvent.change(captionTextarea, { target: { value: 'Custom submitted caption!' } });
      expect(captionTextarea.value).toBe('Custom submitted caption!');

      const confirmButton = screen.getByRole('button', { name: /^Confirm$/i });
      expect(confirmButton).toBeEnabled();
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Gig announced successfully to Instagram!/i)).toBeInTheDocument();
      });
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy caption/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download picture/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Open Facebook/i })).toBeInTheDocument();
      expect(confirmButton).toBeDisabled();

      const updatedGig1: Igig = {
        ...gig1,
        announcements: [
          {
            imageUrl: 'https://example.com/pic1.jpg',
            at: '2026-11-09T12:00:00.000Z',
          },
        ],
      };

      rerender(
        <AnnounceGigDialog
          gig={gig1}
          gigs={[updatedGig1, gig2]}
          open
          onClose={vi.fn()}
          auth={mockAuth}
        />,
      );

      expect(captionTextarea.value).toBe('Custom submitted caption!');
      expect(screen.getByText(/Gig announced successfully to Instagram!/i)).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy caption/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Download picture/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Open Facebook/i })).toBeInTheDocument();
      expect(confirmButton).toBeDisabled();

      const item0 = screen.getByTestId('picture-strip-item-0');
      expect(item0).toHaveTextContent('posted Nov 9');
    });
  });
});
