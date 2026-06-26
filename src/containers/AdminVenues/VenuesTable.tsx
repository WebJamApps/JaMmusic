import { useEffect, useState } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel, Tooltip, Button, Chip, Box, Typography,
} from '@mui/material';
import {
  FIELD_HELP, prospectScore, type Ivenue,
} from './admin-venues.utils';

interface IvenuesTableProps {
  venues: Ivenue[];
  onEdit: (venue: Ivenue) => void;
  onDelete?: (venue: Ivenue) => void;
}

type Order = 'asc' | 'desc';
const ROWS_PER_PAGE = 25;

// Columns: `key` drives sorting (via sortValue), `help` (a FIELD_HELP key) adds a
// consequence tooltip on the header. 'prospect' is the computed default-sort column.
const COLUMNS: { key: string; label: string; help?: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'type', label: 'Type', help: 'venueType' },
  { key: 'inScope', label: 'In scope', help: 'inScope' },
  { key: 'booking', label: 'Booking', help: 'bookingStatus' },
  { key: 'interested', label: 'Interested', help: 'interested' },
  { key: 'eligible', label: 'Eligible', help: 'outreachEligible' },
  { key: 'originals', label: 'Originals', help: 'originalsFit' },
  { key: 'pay', label: 'Pay', help: 'payTier' },
  { key: 'travel', label: 'Travel', help: 'travelBand' },
  { key: 'priority', label: 'Priority', help: 'priority' },
  { key: 'prospect', label: 'Score', help: 'prospect' },
];

const yn = (v: boolean | undefined) => (v ? 'yes' : 'no');
const dash = (v: string | number | undefined) => (v === undefined || v === '' ? '—' : String(v));

// The value a column sorts by. Booleans become 1/0 so yes sorts above no;
// 'prospect' is the computed score.
export function sortValue(v: Ivenue, key: string): string | number {
  switch (key) {
    case 'name': return v.name || '';
    case 'city': return v.city || '';
    case 'state': return v.usState || '';
    case 'type': return v.venueType || '';
    case 'inScope': return v.inScope !== false ? 1 : 0;
    case 'booking': return v.bookingStatus || '';
    case 'interested': return v.interested !== false ? 1 : 0;
    case 'eligible': return v.outreachEligible ? 1 : 0;
    case 'originals': return v.originalsFit || '';
    case 'pay': return v.payTier || '';
    case 'travel': return v.travelBand || '';
    case 'priority': return v.priority || 0;
    case 'prospect': return prospectScore(v);
    default: return '';
  }
}

function compare(a: string | number, b: string | number, order: Order): number {
  let res: number;
  if (typeof a === 'number' && typeof b === 'number') res = a - b;
  else res = String(a).toLowerCase().localeCompare(String(b).toLowerCase());
  return order === 'asc' ? res : -res;
}

// Default sort = best prospects on top: eligible venues first, then Prospect
// Score within each group (#1139 §3). Sorting by any other column is a plain
// per-column sort.
function sortVenues(venues: Ivenue[], orderBy: string, order: Order): Ivenue[] {
  return [...venues].sort((a, b) => {
    if (orderBy === 'prospect') {
      const elig = (b.outreachEligible ? 1 : 0) - (a.outreachEligible ? 1 : 0);
      if (elig !== 0) return elig;
    }
    return compare(sortValue(a, orderBy), sortValue(b, orderBy), order);
  });
}

export function VenuesTable({ venues, onEdit, onDelete }: IvenuesTableProps) {
  const [orderBy, setOrderBy] = useState('prospect');
  const [order, setOrder] = useState<Order>('desc');
  const [page, setPage] = useState(0);

  // Keep the page in range as the data or sort changes (e.g. after a filter).
  const pageCount = Math.max(1, Math.ceil(venues.length / ROWS_PER_PAGE));
  useEffect(() => { if (page >= pageCount) setPage(0); }, [page, pageCount]);

  if (venues.length === 0) {
    return <Box data-testid="venues-empty" sx={{ marginY: 2 }}>No venues.</Box>;
  }

  const handleSort = (key: string) => {
    if (orderBy === key) { setOrder(order === 'asc' ? 'desc' : 'asc'); } else {
      setOrderBy(key);
      setOrder(key === 'prospect' ? 'desc' : 'asc');
    }
    setPage(0);
  };

  const handleDelete = (v: Ivenue) => {
    // eslint-disable-next-line no-alert, no-restricted-globals
    if (!confirm(`Archive "${v.name}"? It's removed from the list but recoverable.`)) return;
    if (onDelete) onDelete(v);
  };

  const sorted = sortVenues(venues, orderBy, order);
  const start = page * ROWS_PER_PAGE;
  const pageRows = sorted.slice(start, start + ROWS_PER_PAGE);

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table size="small" data-testid="venues-table" sx={{ minWidth: 1100 }}>
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableCell key={col.key} sortDirection={orderBy === col.key ? order : false}>
                <Tooltip title={col.help ? FIELD_HELP[col.help] : ''} arrow>
                  <TableSortLabel
                    active={orderBy === col.key}
                    direction={orderBy === col.key ? order : 'asc'}
                    onClick={() => handleSort(col.key)}
                    data-testid={`sort-${col.key}`}
                  >
                    {col.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            ))}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pageRows.map((v) => {
            const noType = !v.venueType;
            return (
              <TableRow
                key={v._id}
                data-testid={`venue-row-${v._id}`}
                sx={noType ? { backgroundColor: 'rgba(255,167,38,0.18)' } : undefined}
              >
                <TableCell>{v.name}</TableCell>
                <TableCell>{dash(v.city)}</TableCell>
                <TableCell>{dash(v.usState)}</TableCell>
                <TableCell>
                  {noType
                    ? <Chip label="no type" color="warning" size="small" data-testid={`venue-notype-${v._id}`} />
                    : v.venueType}
                </TableCell>
                <TableCell>{yn(v.inScope !== false)}</TableCell>
                <TableCell>{dash(v.bookingStatus)}</TableCell>
                <TableCell>{yn(v.interested !== false)}</TableCell>
                <TableCell data-testid={`venue-eligible-${v._id}`}>{yn(v.outreachEligible)}</TableCell>
                <TableCell>{dash(v.originalsFit)}</TableCell>
                <TableCell>{dash(v.payTier)}</TableCell>
                <TableCell>{dash(v.travelBand)}</TableCell>
                <TableCell>{dash(v.priority)}</TableCell>
                <TableCell data-testid={`venue-score-${v._id}`}>{prospectScore(v)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Button size="small" onClick={() => onEdit(v)} data-testid={`venue-edit-${v._id}`}>Edit</Button>
                  {onDelete && (
                    <Button size="small" color="error" onClick={() => handleDelete(v)} data-testid={`venue-delete-${v._id}`}>
                      Archive
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginTop: 1,
      }}>
        <Typography variant="body2" data-testid="venues-page-info">
          {`${start + 1}–${Math.min(start + ROWS_PER_PAGE, venues.length)} of ${venues.length}`}
        </Typography>
        <Button
          size="small"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          data-testid="venues-prev-page"
        >
          Prev
        </Button>
        <Button
          size="small"
          disabled={page >= pageCount - 1}
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          data-testid="venues-next-page"
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
