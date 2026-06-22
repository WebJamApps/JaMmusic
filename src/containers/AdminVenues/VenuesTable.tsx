import {
  Table, TableHead, TableBody, TableRow, TableCell, Button, Box,
} from '@mui/material';
import { type Ivenue } from './admin-venues.utils';

interface IvenuesTableProps {
  venues: Ivenue[];
  onEdit: (venue: Ivenue) => void;
}

const yn = (v: boolean | undefined) => (v ? 'yes' : 'no');

export function VenuesTable({ venues, onEdit }: IvenuesTableProps) {
  if (venues.length === 0) {
    return <Box data-testid="venues-empty" sx={{ marginY: 2 }}>No venues.</Box>;
  }
  return (
    <Box sx={{ overflowX: 'auto', width: '100%' }}>
      <Table size="small" data-testid="venues-table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>City</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Booking</TableCell>
            <TableCell>Eligible</TableCell>
            <TableCell>In scope</TableCell>
            <TableCell>Interested</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {venues.map((v) => (
            <TableRow key={v._id} data-testid={`venue-row-${v._id}`}>
              <TableCell>{v.name}</TableCell>
              <TableCell>{[v.city, v.usState].filter(Boolean).join(', ')}</TableCell>
              <TableCell>{v.venueType || '—'}</TableCell>
              <TableCell>{v.bookingStatus || '—'}</TableCell>
              <TableCell data-testid={`venue-eligible-${v._id}`}>{yn(v.outreachEligible)}</TableCell>
              <TableCell>{yn(v.inScope !== false)}</TableCell>
              <TableCell>{yn(v.interested !== false)}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => onEdit(v)} data-testid={`venue-edit-${v._id}`}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
