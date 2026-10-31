import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnnounceGigDialog } from 'src/containers/Music/Gigs/AnnounceGigDialog';
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
});
