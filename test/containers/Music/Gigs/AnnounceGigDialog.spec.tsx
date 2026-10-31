/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnnounceGigDialog } from 'src/containers/Music/Gigs/AnnounceGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';
import type { Igig } from 'src/providers/Data.provider';
import type { Iauth } from 'src/providers/Auth.provider';

describe('AnnounceGigDialog', () => {
  const mockAuth: Iauth = {
    token: 'test-token',
    error: '',
    isAuthenticated: true,
    user: { userType: 'JaM-admin' } as any,
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
    } as any);

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
    } as any);

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
});
