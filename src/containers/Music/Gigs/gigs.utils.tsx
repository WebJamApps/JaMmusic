import type { GridRowParams } from '@mui/x-data-grid';
import scc from 'socketcluster-client';
import commonUtils from 'src/lib/commonUtils';

const defaultGig = {
  _id: '', datetime: null as Date | null, venue: '', city: '', usState: '', tickets: '',
};

const createGig = async (
  getGigs: () => void,
  setShowDialog: (arg0: boolean) => void,
  datetime: Date | null,
  venue: string,
  city: string,
  usState: string,
  tickets: string,
) => {
  try {
    const persistRoot = sessionStorage.getItem('persist:root') || '';
    const { auth } = JSON.parse(persistRoot);
    const { token } = JSON.parse(auth);
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
  setEditChanged:(arg0:boolean)=>void,
  editGig: typeof defaultGig,
) => {
  try {
    const persistRoot = sessionStorage.getItem('persist:root') || '';
    const { auth } = JSON.parse(persistRoot);
    const { token } = JSON.parse(auth);
    const tour:any = { ...editGig };
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
  setEditGig:(arg0:GridRowParams['row'])=>void,
  isAdmin:boolean,
  rowData:GridRowParams['row'],
) => {
  if (isAdmin) { setEditGig(rowData); }
};

const checkNewDisabled = (city:string, usState:string, dateTime:Date | null, venue:string) => {
  let isDisabled = true;
  if (city && usState && dateTime && venue) isDisabled = false;
  return isDisabled;
};

const checkUpdateDisabled = (editGig: GridRowParams['row'], editChanged:boolean) => {
  let disabled = true;
  if (editChanged && editGig.venue && editGig.city && editGig.datetime && editGig.usState) disabled = false;
  return disabled;
};

export default {
  createGig, updateGig, defaultGig, clickToEdit, checkNewDisabled, checkUpdateDisabled,
};
