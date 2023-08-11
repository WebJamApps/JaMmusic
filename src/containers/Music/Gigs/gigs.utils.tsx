import type { GridEnrichedColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import HtmlReactParser from 'html-react-parser';
import scc from 'socketcluster-client';
import commonUtils from 'src/lib/utils';
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
) => {
  try {
    const { token } = auth;
    const tour = {
      datetime, venue, tickets, city, usState,
    };
    const socket = scc.create({
      hostname: process.env.SCS_HOST,
      port: Number(process.env.SCS_PORT),
      autoConnect: true,
      secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
    });
    socket.transmit('newTour', { tour, token });
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
    const tour: Igig = { ...editGig };
    delete tour.date;
    delete tour.time;
    delete tour.location;
    delete tour._id;
    const socket = scc.create({
      hostname: process.env.SCS_HOST,
      port: Number(process.env.SCS_PORT),
      autoConnect: true,
      secure: process.env.SOCKETCLUSTER_SECURE !== 'false',
    });
    socket.transmit('editTour', { tourId: editGig._id, tour, token });
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

const checkNewDisabled = (city: string, usState: string, dateTime: Date | null, venue: string) => {
  let isDisabled = true;
  if (city && usState && dateTime && venue) isDisabled = false;
  return isDisabled;
};

const checkUpdateDisabled = (editGig: GridRowParams['row'], editChanged: boolean) => {
  let disabled = true;
  if (editChanged && editGig.venue && editGig.city && editGig.datetime && editGig.usState) disabled = false;
  return disabled;
};

async function deleteGig(
  tourId: string,
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
      const tour = { tourId };
      socket.transmit('deleteTour', { tour, token });
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
  setPageSize(futureGigs.length - 1 > 5 ? futureGigs.length - 1 : 5);
};

const makeDateValue = (datetime: string) => {
  const localString = new Date(datetime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return localString;
};

const makeTimeValue = (datetime: string) => new Date(datetime)
  .toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });

const makeVenueValue = (value: string) => {
  const parsed = HtmlReactParser(value);
  if (value === 'Our Past Performances') return <span className="ourPastPerformances">{parsed}</span>;
  return <div>{parsed}</div>;
};

const makeVenue = (): GridEnrichedColDef => (
  {
    field: 'venue',
    headerName: 'Venue',
    minWidth: 400,
    flex: 2,
    editable: false,
    renderCell: (params: GridRenderCellParams) => makeVenueValue(params.value),
  }
);

export default {
  makeVenue,
  makeVenueValue,
  makeDateValue,
  makeTimeValue,
  createGig,
  updateGig,
  clickToEdit,
  checkNewDisabled,
  checkUpdateDisabled,
  deleteGig,
  orderGigs,
  usStateOptions,
};
