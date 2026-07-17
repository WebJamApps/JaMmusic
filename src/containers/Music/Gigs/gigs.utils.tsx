import type { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import HtmlReactParser from 'html-react-parser';
import scc from 'socketcluster-client';
import commonUtils from 'src/lib/utils';
import { formatInVenueTimeZone } from 'src/lib/venueTimezone';
import type { Iauth } from 'src/providers/Auth.provider';
import type { Igig } from 'src/providers/Data.provider';
import { defaultGig } from 'src/providers/fetchGigs';

// eslint-disable-next-line max-len
const usStateOptions = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

const createGig = async (
  getGigs: () => void,
  setShowDialog: (arg0: boolean) => void,
  datetime: Date | null,
  venue: string,
  city: string,
  usState: string,
  tickets: string,
  auth: Iauth,
  duration: number,
  promoImageUrl: string,
  venueId?: string | null,
) => {
  try {
    const { token } = auth;
    const gig = {
      datetime, venue, tickets, city, usState, duration, promoImageUrl, artist: 'josh', venueId: venueId || undefined,
    };
    const socket = scc.create({
      hostname: process.env.SCS_HOST,
      port: Number(process.env.SCS_PORT),
      autoConnect: true,
      secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
    });
    socket.transmit('newGig', { gig, token });
    setShowDialog(false);
    await commonUtils.delay(2);
    getGigs();
  } catch (err) { console.log((err as Error).message); }
};

const updateGig = async (
  getGigs: () => void,
  setEditGig: (arg0: typeof defaultGig) => void,
  setEditChanged: (arg0: boolean) => void,
  editGig: typeof defaultGig,
  token: string,
) => {
  try {
    const gig: Igig = { ...editGig, artist: 'josh' };
    delete gig.date;
    delete gig.time;
    delete gig.location;
    delete gig._id;
    if (gig.venueId && typeof gig.venueId === 'object') {
      gig.venueId = gig.venueId._id;
    }
    const socket = scc.create({
      hostname: process.env.SCS_HOST,
      port: Number(process.env.SCS_PORT),
      autoConnect: true,
      secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
    });
    socket.transmit('editGig', { gigId: editGig._id, gig, token });
    setEditGig(defaultGig);
    setEditChanged(false);
    await commonUtils.delay(2);
    getGigs();
  } catch (err) { console.log((err as Error).message); }
};

const clickToEdit = (
  setEditGig: (arg0: GridRowParams['row']) => void,
  isAdmin: boolean,
  rowData: GridRowParams['row'],
) => {
  if (isAdmin) { setEditGig(rowData); }
};

const checkNewDisabled = (
  dateTime: Date | null,
  path: 'existing' | 'new' | 'none',
  venueId: string | null,
  venue: string,
  inlineName: string,
  inlineCity: string,
  inlineState: string,
) => {
  if (!dateTime) return true;
  if (path === 'existing') {
    return !venueId;
  }
  if (path === 'new') {
    return !inlineName || !inlineCity || !inlineState;
  }
  if (path === 'none') {
    return !venue || venue.trim() === '' || venue.trim() === '<p></p>';
  }
  return true;
};

const checkUpdateDisabled = (
  editGig: GridRowParams['row'],
  editChanged: boolean,
  path: 'existing' | 'new' | 'none',
  venueId: string | null,
  venue: string,
  inlineName: string,
  inlineCity: string,
  inlineState: string,
) => {
  if (!editChanged) return true;
  if (!editGig.datetime) return true;
  if (path === 'existing') {
    return !venueId;
  }
  if (path === 'new') {
    return !inlineName || !inlineCity || !inlineState;
  }
  if (path === 'none') {
    return !venue || venue.trim() === '' || venue.trim() === '<p></p>';
  }
  return true;
};

async function deleteGig(
  gigId: string,
  getGigs: () => void,
  setEditGig: (arg0: typeof defaultGig) => void,
  setEditChanged: (arg0: boolean) => void,
  token: string,
): Promise<boolean> { // eslint-disable-next-line no-restricted-globals
  const result = confirm('Deleting Gig, are you sure?');// eslint-disable-line no-alert
  if (result) {
    try {
      const socket = scc.create({
        hostname: process.env.SCS_HOST,
        port: Number(process.env.SCS_PORT),
        autoConnect: true,
        secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
      });
      const gig = { gigId };
      socket.transmit('deleteGig', { gig, token });
      await commonUtils.delay(2);
      setEditGig(defaultGig);
      setEditChanged(false);
      getGigs();
      return true;
    } catch (err) { console.log((err as Error)); return false; }
  } return false;
}

export const orderGigs = (
  iGigs: Igig[] | null,
  setGigsInOrder: { (arg0: Igig[]): void; },
  setPageSize: (arg0: number) => void,
) => {
  if (!iGigs) return;
  const gigs = iGigs.map((g, i) => ({ ...g, id: i }));
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const current = now.toISOString();
  const futureGigs = gigs.filter((g) => typeof g.datetime === 'string' && (g.datetime as string) >= current);
  const pastGigs = gigs.filter((g) => typeof g.datetime === 'string' && (g.datetime as string) < current);
  const sortedFuture = futureGigs.sort((a, b) => {
    if (a.datetime && b.datetime) {
      if (a.datetime > b.datetime) return 1;
      if (a.datetime < b.datetime) return -1;
    }
    return 0;
  });
  sortedFuture.push({
    ...defaultGig, venue: 'Our Past Performances', id: 999, tickets: ' ',
  });
  setGigsInOrder(sortedFuture.concat(pastGigs));
  // Default page size — the grid paginates; the "Our Past Performances" separator
  // and the (often many) past gigs are reachable via the now-working paginator,
  // and the user can bump the page size via the grid's options.
  setPageSize(10);
};

// Rendered in the gig's venue timezone (#1222) rather than the viewer's
// browser timezone, via the shared `formatInVenueTimeZone` (falls back to the
// browser's local zone when the gig has no usState — the prior behavior).
const makeDateValue = (datetime: string, usState?: string) => formatInVenueTimeZone(datetime, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}, usState);

const makeShortDateValue = (datetime: string, usState?: string) => formatInVenueTimeZone(
  datetime,
  { year: '2-digit', month: 'numeric', day: 'numeric' },
  usState,
);

const makeTimeValue = (datetime: string, usState?: string) => formatInVenueTimeZone(
  datetime,
  { hour: 'numeric', minute: '2-digit' },
  usState,
);

// With a duration (hours) the Time column becomes a range "8:00 AM to 5:00 PM";
// with no duration it stays the start time alone.
const makeTimeRange = (datetime: string, duration?: number, usState?: string) => {
  const start = makeTimeValue(datetime, usState);
  if (!duration || duration <= 0) return start;
  const end = new Date(new Date(datetime).getTime() + duration * 60 * 60 * 1000);
  return `${start} to ${makeTimeValue(end.toISOString(), usState)}`;
};

const makeVenueValue = (value: string) => {
  const parsed = HtmlReactParser(value);
  if (value === 'Our Past Performances') return <span className="ourPastPerformances">{parsed}</span>;
  return <div>{parsed}</div>;
};

const renderVenueCell = (params: GridRenderCellParams) => {
  const row = params?.row;
  if (!row) {
    return makeVenueValue(params?.value || '');
  }
  const { venue, venueId } = row;
  if (venue === 'Our Past Performances') {
    return <span className="ourPastPerformances">{HtmlReactParser(venue)}</span>;
  }
  if (venueId && typeof venueId === 'object') {
    const { name, city, usState, website } = venueId;
    const resolvedLink = website ? (
      <a href={website} target="_blank" rel="noopener" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
        {name}
      </a>
    ) : (
      <span style={{ fontWeight: 'bold' }}>{name}</span>
    );
    const locationStr = `${city || ''}, ${usState || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
    return (
      <div>
        <div>
          {resolvedLink}
          {locationStr ? ` - ${locationStr}` : ''}
        </div>
        {venue && venue !== '<p></p>' && venue.trim() !== '' && (
          <div style={{ fontSize: '0.875rem', marginTop: '4px', opacity: 0.9 }}>
            {HtmlReactParser(venue)}
          </div>
        )}
      </div>
    );
  }
  return <div>{HtmlReactParser(venue || '')}</div>;
};

const makeVenue = (isMobile = false): GridColDef => (
  {
    field: 'venue',
    headerName: 'Venue',
    width: isMobile ? 250 : undefined,
    minWidth: isMobile ? undefined : 400,
    flex: isMobile ? 0 : 2,
    editable: false,
    renderCell: (params: GridRenderCellParams) => renderVenueCell(params),
  }
);

export default {
  makeVenue,
  makeVenueValue,
  makeDateValue,
  makeShortDateValue,
  makeTimeValue,
  makeTimeRange,
  createGig,
  updateGig,
  clickToEdit,
  checkNewDisabled,
  checkUpdateDisabled,
  deleteGig,
  orderGigs,
  usStateOptions,
};
