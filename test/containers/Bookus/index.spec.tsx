import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookUs } from 'src/containers/BookUs';
import { DataProvider, DataContext, Isong } from 'src/providers/Data.provider';
import fetchSongs from 'src/providers/fetchSongs';
import * as songlistPdf from 'src/lib/songlistPdf';

describe('Bookus', () => {
  it('renders correctly', () => {
    const { container } = render(<BookUs />);
    expect(container).toMatchSnapshot();
  });

  it('renders and handles click falling back to static pdf when songs empty', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => ({} as any));
    render(<BookUs />);
    fireEvent.click(screen.getByRole('button', { name: /current songlist/i }));
    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith('/Josh-Maria-Songlist.pdf', '_blank', 'noopener,noreferrer');
    });
    openSpy.mockRestore();
  });

  it('generates dynamic songlist PDF when songs are available in context', async () => {
    const openPdfSpy = vi.spyOn(songlistPdf, 'openSonglistPdf').mockImplementation(() => {});
    const mockSongs: Isong[] = [
      { title: 'Song 1', artist: 'Artist 1', category: 'pub' },
      { title: 'Original 1', artist: 'Josh Sherman', category: 'original', url: 'https://youtu.be/123' },
    ];
    render(
      <DataContext.Provider
        value={{
          gigs: null,
          setGigs: vi.fn(),
          getGigs: vi.fn(),
          pics: null,
          setPics: vi.fn(),
          getPics: vi.fn(),
          songs: mockSongs,
          setSongs: vi.fn(),
          getSongs: vi.fn().mockResolvedValue(mockSongs),
        }}
      >
        <BookUs />
      </DataContext.Provider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /current songlist/i }));
    await waitFor(() => {
      expect(openPdfSpy).toHaveBeenCalledWith(mockSongs);
    });
    openPdfSpy.mockRestore();
  });

  it('fetches songs via DataProvider when initially uncached and generates dynamic PDF', async () => {
    const openPdfSpy = vi.spyOn(songlistPdf, 'openSonglistPdf').mockImplementation(() => {});
    const mockSongs: Isong[] = [
      { title: 'Uncached Song', artist: 'Josh & Maria', category: 'original', url: 'https://youtu.be/uncached' },
    ];
    let resolveMountFetch!: (songs: Isong[]) => void;
    const mountFetchPromise = new Promise<Isong[]>((resolve) => {
      resolveMountFetch = resolve;
    });

    let calls = 0;
    const fetchSpy = vi.spyOn(fetchSongs, 'getSongs').mockImplementation(async (setSongs) => {
      calls += 1;
      if (calls === 1) {
        const result = await mountFetchPromise;
        setSongs(result);
        return result;
      }
      setSongs(mockSongs);
      return mockSongs;
    });

    render(
      <DataProvider>
        <BookUs />
      </DataProvider>,
    );

    // Click while songs in context is still null (mount fetch still pending)
    fireEvent.click(screen.getByRole('button', { name: /current songlist/i }));

    // Resolve mount fetch
    resolveMountFetch(mockSongs);

    await waitFor(() => {
      expect(openPdfSpy).toHaveBeenCalledWith(mockSongs);
    });
    openPdfSpy.mockRestore();
    fetchSpy.mockRestore();
  });
});
