import socketClusterMessages from './socketClusterMessages';
import type { Igig } from './Data.provider';

export const defaultGig: Igig = {
  date: '',
  time: '',
  tickets: '',
  location: '',
  venue: '',
  _id: '',
  datetime: null,
  city: '',
  usState: 'Virginia',
  id: 0,
};

const getGigs = (
  setGigs: (_arg0: Igig[] | null) => void,
): boolean => socketClusterMessages.initialMessage(setGigs, 'allTours');

export default { getGigs };
