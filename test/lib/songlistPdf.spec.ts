import { vi } from 'vitest';
import type { Isong } from 'src/providers/Data.provider';
import {
  escapePdfText,
  escapePdfUri,
  sortSongsForPdf,
  generateSonglistPdf,
  openSonglistPdf,
} from 'src/lib/songlistPdf';

describe('songlistPdf', () => {
  it('escapes PDF special characters and typographic punctuation', () => {
    expect(escapePdfText(String.raw`Test (Parens) and \ backslash`)).toBe(String.raw`Test \(Parens\) and \\ backslash`);
    expect(escapePdfText('Song • with bullet')).toBe(String.raw`Song \225 with bullet`);
    expect(escapePdfText("‘single’ and “double” quotes")).toBe("'single' and \"double\" quotes");
    expect(escapePdfText('en–dash and em—dash')).toBe('en-dash and em--dash');
  });

  it('escapes PDF URIs', () => {
    expect(escapePdfUri('https://example.com/song?a=1&b=(2)')).toBe(String.raw`https://example.com/song?a=1&b=\(2\)`);
  });

  it('sorts covers first and originals second, preserving order within groups', () => {
    const originalCategory = 'original';
    const catalog: Isong[] = [
      { title: 'Original A', artist: 'Josh Sherman', category: originalCategory },
      { title: 'Cover 1', artist: 'Artist 1', category: 'pub' },
      { title: 'Original B', artist: 'Josh & Maria Sherman', category: originalCategory },
      { title: 'Cover 2', artist: 'Artist 2', category: 'mission' },
    ];
    const sorted = sortSongsForPdf(catalog);
    expect(sorted.map(s => s.title)).toEqual([
      'Cover 1',
      'Cover 2',
      'Original A',
      'Original B',
    ]);
  });

  it('generates a valid PDF 1.4 document with header, table, and links for recorded originals', () => {
    const songs: Isong[] = [
      {
        title: 'Memories',
        artist: 'Maroon 5',
        category: 'pub',
        url: 'https://example.com/covers/memories.mp3',
      },
      {
        title: 'Dark Light',
        artist: 'Josh & Maria Sherman',
        category: 'original',
        url: 'https://web-jam.com/music/songs?id=5f5e6b7d',
      },
      {
        title: 'Unrecorded Original',
        artist: 'Josh Sherman',
        category: 'original',
      },
    ];

    const pdfBytes = generateSonglistPdf(songs);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(500);

    const pdfString = Array.from(pdfBytes).map(b => String.fromCodePoint(b)).join('');
    expect(pdfString.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfString).toContain('Josh & Maria Sherman');
    expect(pdfString).toContain(String.raw`Songlist \225 original songs are clickable links to a recording`);
    expect(pdfString).toContain('Title');
    expect(pdfString).toContain('Artist');
    expect(pdfString).toContain('Memories');
    expect(pdfString).toContain('Dark Light');
    expect(pdfString).toContain('Unrecorded Original');

    // Dark Light is an original with url -> should have a link annotation
    expect(pdfString).toContain('/Subtype /Link');
    expect(pdfString).toContain('https://web-jam.com/music/songs?id=5f5e6b7d');

    // Memories is pub (cover) -> url should NOT be in link annotations
    expect(pdfString).not.toContain('https://example.com/covers/memories.mp3');

    // Check trailer and EOF
    expect(pdfString).toContain('startxref');
    expect(pdfString).toContain('%%EOF');
  });

  it('auto-paginates across multiple pages for large song catalogs', () => {
    const catalog: Isong[] = [];
    for (let i = 1; i <= 75; i++) {
      catalog.push({
        title: `Song ${i}`,
        artist: `Artist ${i}`,
        category: i % 2 === 0 ? 'original' : 'pub',
        url: i % 2 === 0 ? `https://web-jam.com/music/songs?id=${i}` : undefined,
      });
    }

    const pdfBytes = generateSonglistPdf(catalog);
    const pdfString = Array.from(pdfBytes).map(b => String.fromCodePoint(b)).join('');

    // 75 rows spans at least 3 pages (31 on p1, 33 on p2, 11 on p3)
    expect(pdfString).toContain('Page 1 of');
    expect(pdfString).toContain('Page 2 of');
    expect(pdfString).toContain('Page 3 of');
  });

  it('openSonglistPdf creates an object URL and opens a new window', () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const originalOpen = window.open;

    URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-pdf');
    window.open = vi.fn();

    const songs: Isong[] = [
      { title: 'Test', artist: 'Artist', category: 'original' },
    ];
    openSonglistPdf(songs);

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('blob:http://localhost/mock-pdf', '_blank', 'noopener,noreferrer');

    URL.createObjectURL = originalCreateObjectURL;
    window.open = originalOpen;
  });
});
