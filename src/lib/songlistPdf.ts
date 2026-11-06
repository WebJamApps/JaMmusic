import type { Isong } from 'src/providers/Data.provider';

/**
 * Escapes characters for PDF literal strings (...).
 */
export function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, String.raw`\\`)
    .replace(/\(/g, String.raw`\(`)
    .replace(/\)/g, String.raw`\)`)
    .replace(/\u{2022}/gu, String.raw`\225`) // bullet •
    .replace(/[\u{2018}\u{2019}]/gu, "'") // curly single quotes
    .replace(/[\u{201C}\u{201D}]/gu, '"') // curly double quotes
    .replace(/\u{2013}/gu, '-') // en-dash
    .replace(/\u{2014}/gu, '--'); // em-dash
}

/**
 * Escapes characters in a PDF URI literal string.
 */
export function escapePdfUri(uri: string): string {
  return uri
    .replace(/\\/g, String.raw`\\`)
    .replace(/\(/g, String.raw`\(`)
    .replace(/\)/g, String.raw`\)`);
}

/**
 * Sorts songs for the songlist PDF: covers/pub/mission first, followed by originals.
 * Preserves relative ordering within each group.
 */
export function sortSongsForPdf(songs: Isong[]): Isong[] {
  const covers: Isong[] = [];
  const originals: Isong[] = [];
  for (const s of songs) {
    if (s.category === 'original') {
      originals.push(s);
    } else {
      covers.push(s);
    }
  }
  return [...covers, ...originals];
}

interface LinkAnnotation {
  rect: [number, number, number, number];
  url: string;
}

interface PageData {
  contentOps: string[];
  links: LinkAnnotation[];
}

function stringToUint8Array(str: string): Uint8Array {
  return Uint8Array.from(str, (ch) => (ch.codePointAt(0) ?? 0) & 0xFF);
}

/**
 * Generates a valid PDF 1.4 document containing the song catalog formatted as
 * a 2-column table (Title, Artist), Letter size, with clickable link annotations
 * on original songs that have a recording URL.
 */
export function generateSonglistPdf(songs: Isong[]): Uint8Array {
  const ordered = sortSongsForPdf(songs);
  const pages: PageData[] = [];
  const COL_ARTIST_X = 360;
  const TABLE_WIDTH = 504;
  const ROW_HEIGHT = 20;

  let currentPage: PageData = { contentOps: [], links: [] };
  let currentY = 0;

  function startPage(first: boolean) {
    currentPage = { contentOps: [], links: [] };
    pages.push(currentPage);
    if (first) {
      currentPage.contentOps.push(
        `BT /F2 18 Tf 0 0 0 rg 54 742 Td (${escapePdfText('Josh & Maria Sherman')}) Tj ET`,
        `BT /F3 9.5 Tf 0.35 0.35 0.35 rg 54 725 Td (${escapePdfText('Songlist • original songs are clickable links to a recording')}) Tj ET`,
        '0.8 0.8 0.8 RG 0.75 w 54 716 m 558 716 l S',
        `0.93 0.94 0.96 rg 54 694 ${TABLE_WIDTH} 18 re f`,
        'BT /F2 10 Tf 0.15 0.15 0.15 rg 58 699 Td (Title) Tj ET',
        `BT /F2 10 Tf 0.15 0.15 0.15 rg ${COL_ARTIST_X} 699 Td (Artist) Tj ET`,
      );
      currentY = 694 - ROW_HEIGHT;
    } else {
      currentPage.contentOps.push(
        `0.93 0.94 0.96 rg 54 744 ${TABLE_WIDTH} 18 re f`,
        'BT /F2 10 Tf 0.15 0.15 0.15 rg 58 749 Td (Title) Tj ET',
        `BT /F2 10 Tf 0.15 0.15 0.15 rg ${COL_ARTIST_X} 749 Td (Artist) Tj ET`,
      );
      currentY = 744 - ROW_HEIGHT;
    }
  }

  startPage(true);

  let rowIndex = 0;
  for (const song of ordered) {
    if (currentY < 50) {
      startPage(false);
      rowIndex = 0;
    }

    if (rowIndex % 2 === 1) {
      currentPage.contentOps.push(`0.97 0.97 0.98 rg 54 ${currentY} ${TABLE_WIDTH} ${ROW_HEIGHT} re f`);
    }
    currentPage.contentOps.push(`0.9 0.9 0.9 RG 0.5 w 54 ${currentY} m 558 ${currentY} l S`);

    const textY = currentY + 5;
    const title = (song.title || '').length > 55 ? `${(song.title || '').slice(0, 52)}...` : (song.title || '');
    const artist = (song.artist || '').length > 35 ? `${(song.artist || '').slice(0, 32)}...` : (song.artist || '');

    const isClickable = song.category === 'original' && Boolean(song.url);
    if (isClickable) {
      currentPage.contentOps.push(`BT /F2 9.5 Tf 0.0 0.28 0.73 rg 58 ${textY} Td (${escapePdfText(title)}) Tj ET`);
      const textWidth = Math.min(295, Math.max(45, Math.round(title.length * 5.4)));
      currentPage.links.push({
        rect: [56, currentY + 2, 56 + textWidth, currentY + ROW_HEIGHT - 2],
        url: song.url!,
      });
    } else {
      currentPage.contentOps.push(`BT /F1 9.5 Tf 0.1 0.1 0.1 rg 58 ${textY} Td (${escapePdfText(title)}) Tj ET`);
    }

    currentPage.contentOps.push(`BT /F1 9.5 Tf 0.25 0.25 0.25 rg ${COL_ARTIST_X} ${textY} Td (${escapePdfText(artist)}) Tj ET`);

    currentY -= ROW_HEIGHT;
    rowIndex++;
  }

  // Page numbering
  const totalPages = pages.length;
  pages.forEach((p, idx) => {
    p.contentOps.push(`BT /F1 8.5 Tf 0.5 0.5 0.5 rg 280 28 Td (Page ${idx + 1} of ${totalPages}) Tj ET`);
  });

  const objects: string[] = [];
  function addObject(content: string): number {
    objects.push(content);
    return objects.length;
  }

  addObject('<< /Type /Catalog /Pages 3 0 R >>');
  addObject('<< /Title (Josh & Maria Songlist) /Author (Josh & Maria Sherman) /Producer (JaMmusic) >>');
  addObject(''); // Placeholder for Pages 3 0 R
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>');

  const pageObjIds: number[] = [];
  for (const page of pages) {
    const annotIds: number[] = [];
    for (const link of page.links) {
      const uriStr = escapePdfUri(link.url);
      const aId = addObject(
        `<< /Type /Annot /Subtype /Link /Rect [${link.rect.join(' ')}] /Border [0 0 0] `
        + `/A << /Type /Action /S /URI /URI (${uriStr}) >> >>`,
      );
      annotIds.push(aId);
    }
    const stream = page.contentOps.join('\n');
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);

    let pageDict = '<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] '
      + `/Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> /ProcSet [/PDF /Text] >> /Contents ${contentId} 0 R`;
    if (annotIds.length > 0) {
      pageDict += ` /Annots [${annotIds.map((id) => `${id} 0 R`).join(' ')}]`;
    }
    pageDict += ' >>';
    const pId = addObject(pageDict);
    pageObjIds.push(pId);
  }

  objects[2] = `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjIds.length} >>`;

  let pdf = '%PDF-1.4\n%\u{00E2}\u{00E3}\u{00CF}\u{00D3}\n';
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += `${offsets.length} 0 obj\n${obj}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 2 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return stringToUint8Array(pdf);
}

/**
 * Generates the songlist PDF in the browser and opens it in a new tab.
 */
export function openSonglistPdf(songs: Isong[]): void {
  const pdfBytes = generateSonglistPdf(songs);
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
}
