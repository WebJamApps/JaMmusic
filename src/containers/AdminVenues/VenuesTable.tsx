import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel, Tooltip, Button, Chip, Box, Typography,
  TextField, FormControlLabel, Switch, Select, MenuItem,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';
import { Search } from '@mui/icons-material';
import {
  FIELD_HELP, prospectScore, type Ivenue,
} from './admin-venues.utils';

interface IvenuesTableProps {
  venues: Ivenue[];
  onEdit: (venue: Ivenue) => void;
  onDelete?: (venue: Ivenue) => void;
  onRestore?: (venue: Ivenue) => void;
  showArchived?: boolean;
  targetDate?: string;
  setTargetDate?: (val: string) => void;
}

type Order = 'asc' | 'desc';

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

export function VenuesTable({
  venues, onEdit, onDelete, onRestore, showArchived, targetDate, setTargetDate,
}: IvenuesTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const paper = theme.palette.background.paper;
  const hoverColor = theme.palette.action.hover;

  const headerHoverBg = isDark
    ? `linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08)), ${paper}`
    : `linear-gradient(rgba(0,0,0,0.04), rgba(0,0,0,0.04)), ${paper}`;

  const [orderBy, setOrderBy] = useState('prospect');
  const [order, setOrder] = useState<Order>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [needsVettingFilter, setNeedsVettingFilter] = useState(false);

  // Un-vetted definition: no venueType set OR contactVerified is falsy.
  // This is Josh's vetting work queue.
  const unvettedCount = venues.filter((v) => !v.venueType || !v.contactVerified).length;
  const vettedCount = venues.length - unvettedCount;

  const handleSort = (key: string) => {
    if (orderBy === key) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
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

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(0);
  };

  const handleNeedsVettingToggle = (checked: boolean) => {
    setNeedsVettingFilter(checked);
    setPage(0);
  };

  // Perform filtering live on venue name + city, and needs-vetting state
  const filtered = venues.filter((v) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const nameMatch = (v.name || '').toLowerCase().includes(term);
      const cityMatch = (v.city || '').toLowerCase().includes(term);
      if (!nameMatch && !cityMatch) return false;
    }
    if (needsVettingFilter) {
      const needsVetting = !v.venueType || !v.contactVerified;
      if (!needsVetting) return false;
    }
    return true;
  });

  const sorted = sortVenues(filtered, orderBy, order);
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  // Keep the page in range as the data or sort changes (e.g. after a filter).
  useEffect(() => {
    if (page >= pageCount) {
      setPage(0);
    }
  }, [page, pageCount]);

  const renderToolbar = () => {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2.5,
        marginBottom: 0.5,
        flexWrap: 'wrap',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)',
        padding: '8px 16px',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
      }}>
        <Box 
          data-testid="venues-inputs-container"
          sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 2.5, 
            flexWrap: { xs: 'wrap', md: 'nowrap' } 
          }}
        >
          {/* Search box with perfect sizing */}
          <TextField
            size="small"
            placeholder="Search name or city..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }
            }}
            sx={{ 
              width: { xs: '100%', sm: 300 }, 
              maxWidth: '100%',
              flexShrink: 0,
              backgroundColor: 'background.paper', 
              borderRadius: 1.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                height: 38,
              }
            }}
            data-testid="venues-search-box"
          />

          {/* Date picker with matching height and no separate text label */}
          {setTargetDate && (
            <Tooltip title="Pick a target weekend to filter by availability (no conflicting gigs in the ±2-month window)." arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 38, flexShrink: 0 }}>
                <TextField
                  type="date"
                  size="small"
                  value={targetDate || ''}
                  onChange={(e) => setTargetDate(e.target.value)}
                  sx={{ 
                    width: 155, 
                    flexShrink: 0,
                    backgroundColor: 'background.paper', 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px',
                      height: 38,
                    }
                  }}
                  data-testid="venues-target-date"
                />
                {targetDate && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setTargetDate('')}
                    data-testid="venues-clear-date"
                    sx={{ 
                      minWidth: 'auto', 
                      px: 1.5, 
                      height: 32, 
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Box>
            </Tooltip>
          )}

          {/* Needs Vetting switch aligned to the top edge */}
          <FormControlLabel
            control={
              <Switch
                checked={needsVettingFilter}
                onChange={(e) => handleNeedsVettingToggle(e.target.checked)}
                color="warning"
                size="small"
                data-testid="venues-needs-vetting-filter"
                sx={{ 
                  margin: 0,
                  alignSelf: 'flex-start'
                }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.25, whiteSpace: 'nowrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary', whiteSpace: 'nowrap' }}>Needs Vetting</Typography>
                <Chip 
                  label={unvettedCount} 
                  size="small" 
                  color={needsVettingFilter ? "warning" : "default"}
                  sx={{ height: 20, fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px' }}
                />
              </Box>
            }
            sx={{ 
              margin: 0, 
              display: 'flex', 
              alignItems: 'flex-start', 
              alignSelf: 'flex-start',
              pt: 0.5,
              flexShrink: 0
            }}
          />
        </Box>
        
        {/* Progress Counter & Stats styled as a premium green pill aligned to top */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', marginLeft: 'auto', pt: 0.5 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.12)' : 'rgba(76, 175, 80, 0.06)', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            border: '1px solid rgba(76, 175, 80, 0.18)' 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }} color="success.main" data-testid="venues-vetted-counter">
              Vetted {vettedCount} of {venues.length}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }} color="success.dark">
              ({Math.round((vettedCount / (venues.length || 1)) * 100) || 0}%)
            </Typography>
          </Box>
          <Box sx={{ width: 100, display: 'flex', alignItems: 'center', height: 26 }}>
            <LinearProgress 
              variant="determinate" 
              value={(vettedCount / (venues.length || 1)) * 100 || 0} 
              color="success"
              sx={{
                height: 6,
                borderRadius: 3,
                width: '100%',
                backgroundColor: (theme) => (
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.05)'
                ),
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  };

  // Hook rules require returning early after all hooks have run
  if (venues.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        {renderToolbar()}
        <Box data-testid="venues-empty" sx={{ marginY: 2 }}>No venues.</Box>
      </Box>
    );
  }

  const start = page * rowsPerPage;
  const pageRows = sorted.slice(start, start + rowsPerPage);

  return (
    <Box sx={{ width: '100%' }}>
      {renderToolbar()}

      {/* Table responsive scroll container with sticky header */}
      <Box sx={{
        width: '100%',
        maxHeight: 'calc(100vh - 280px)',
        overflowX: 'auto',
        overflowY: pageRows.length <= 10 ? 'hidden' : 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        backgroundColor: 'background.paper',
      }}>
        {filtered.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }} data-testid="venues-search-empty">
            <Typography color="text.secondary">No venues match your search or filters.</Typography>
          </Box>
        ) : (
          <Table size="small" stickyHeader data-testid="venues-table" sx={{ minWidth: 1100 }}>
            <TableHead>
              <TableRow>
                {/* Sticky Actions Header */}
                <TableCell
                  align="center"
                  sx={{
                    position: { xs: 'static', sm: 'sticky' },
                    left: 0,
                    top: 0,
                    zIndex: { xs: 'auto', sm: 11 },
                    backgroundColor: 'background.paper',
                    width: 150,
                    minWidth: 150,
                    maxWidth: 150,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    fontWeight: 'bold',
                  }}
                >
                  Actions
                </TableCell>

                {/* Sticky Name Header */}
                <TableCell
                  key="name"
                  sortDirection={orderBy === 'name' ? order : false}
                  onClick={() => handleSort('name')}
                  sx={{
                    position: { xs: 'static', sm: 'sticky' },
                    left: 150,
                    top: 0,
                    zIndex: { xs: 'auto', sm: 11 },
                    backgroundColor: 'background.paper',
                    width: 170,
                    minWidth: 170,
                    maxWidth: 170,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    boxShadow: { xs: 'none', sm: '3px 0 5px -2px rgba(0,0,0,0.15)' },
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: headerHoverBg,
                    },
                  }}
                >
                  <Tooltip title={FIELD_HELP.name ? FIELD_HELP.name : ''} arrow>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      data-testid="sort-name"
                      sx={{
                        '& .MuiTableSortLabel-icon': {
                          opacity: orderBy === 'name' ? 1 : 0.3,
                        },
                        '&:hover .MuiTableSortLabel-icon': {
                          opacity: 0.8,
                        },
                      }}
                    >
                      Name
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>

                {/* Standard headers (City, State, etc.) */}
                {COLUMNS.slice(1).map((col) => (
                  <TableCell
                    key={col.key}
                    sortDirection={orderBy === col.key ? order : false}
                    onClick={() => handleSort(col.key)}
                    sx={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      },
                      backgroundColor: orderBy === col.key 
                        ? (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                        : undefined,
                    }}
                  >
                    <Tooltip title={col.help ? FIELD_HELP[col.help] : ''} arrow>
                      <TableSortLabel
                        active={orderBy === col.key}
                        direction={orderBy === col.key ? order : 'asc'}
                        data-testid={`sort-${col.key}`}
                        sx={{
                          '& .MuiTableSortLabel-icon': {
                            opacity: orderBy === col.key ? 1 : 0.3,
                          },
                          '&:hover .MuiTableSortLabel-icon': {
                            opacity: 0.8,
                          },
                        }}
                      >
                        {col.label}
                      </TableSortLabel>
                    </Tooltip>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((v) => {
                const noType = !v.venueType;
                const isArchived = v.status === 'archived';

                // Determine base background for sticky cells
                let stickyBg = paper;
                if (!isArchived && noType) {
                  stickyBg = isDark
                    ? `linear-gradient(rgba(255, 167, 38, 0.18), rgba(255, 167, 38, 0.18)), ${paper}`
                    : '#fff3e0';
                }

                // Determine hover background for sticky cells
                let stickyHoverBg = `linear-gradient(${hoverColor}, ${hoverColor}), ${paper}`;
                if (!isArchived && noType) {
                  stickyHoverBg = isDark
                    ? `linear-gradient(rgba(255, 167, 38, 0.22), rgba(255, 167, 38, 0.22)), ${paper}`
                    : `linear-gradient(rgba(255, 167, 38, 0.22), rgba(255, 167, 38, 0.22)), #fff3e0`;
                }

                return (
                  <TableRow
                    key={v._id}
                    data-testid={`venue-row-${v._id}`}
                    sx={{
                      backgroundColor: isArchived
                        ? undefined
                        : noType ? 'rgba(255, 167, 38, 0.12)' : undefined,
                      opacity: isArchived ? 0.6 : 1,
                      '&:hover': {
                        backgroundColor: hoverColor,
                      },
                      '&:hover .MuiTableCell-root': {
                        backgroundColor: isArchived
                          ? hoverColor
                          : noType ? 'rgba(255, 167, 38, 0.22)' : hoverColor,
                      },
                      '&:hover .sticky-cell': {
                        background: stickyHoverBg,
                      }
                    }}
                  >
                    {/* Sticky Actions Column */}
                    <TableCell
                      align="center"
                      className="sticky-cell"
                      sx={{
                        position: { xs: 'static', sm: 'sticky' },
                        left: 0,
                        zIndex: { xs: 'auto', sm: 9 },
                        background: stickyBg,
                        width: 150,
                        minWidth: 150,
                        maxWidth: 150,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {showArchived ? (
                          <Button
                            size="small"
                            color="success"
                            onClick={() => onRestore && onRestore(v)}
                            data-testid={`venue-restore-${v._id}`}
                          >
                            Restore
                          </Button>
                        ) : (
                          <>
                            <Button size="small" onClick={() => onEdit(v)} data-testid={`venue-edit-${v._id}`}>Edit</Button>
                            {onDelete && (
                              <Button size="small" color="error" onClick={() => handleDelete(v)} data-testid={`venue-delete-${v._id}`}>
                                Archive
                              </Button>
                            )}
                          </>
                        )}
                      </Box>
                    </TableCell>

                    {/* Sticky Name Column */}
                    <TableCell
                      className="sticky-cell"
                      sx={{
                        position: { xs: 'static', sm: 'sticky' },
                        left: 150,
                        zIndex: { xs: 'auto', sm: 9 },
                        background: stickyBg,
                        width: 170,
                        minWidth: 170,
                        maxWidth: 170,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        boxShadow: { xs: 'none', sm: '3px 0 5px -2px rgba(0,0,0,0.15)' },
                        fontWeight: 'medium',
                      }}
                    >
                      {v.name}
                    </TableCell>

                    {/* Other standard columns */}
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Box>

      {/* Pagination & Rows-per-page */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 1.5, flexWrap: 'wrap',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">Rows per page:</Typography>
          <Select
            size="small"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            variant="standard"
            sx={{ fontSize: '0.875rem' }}
            inputProps={{ 'data-testid': 'venues-rows-per-page' }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </Box>

        <Typography variant="body2" data-testid="venues-page-info">
          {filtered.length === 0 ? '0–0 of 0' : `${start + 1}–${Math.min(start + rowsPerPage, filtered.length)} of ${filtered.length}`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
    </Box>
  );
}
