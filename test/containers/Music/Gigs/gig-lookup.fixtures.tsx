import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { customFetch } from 'src/lib/fetch.utils';
import adminVenuesUtils from 'src/containers/AdminVenues/admin-venues.utils';
import { NO_MAP_POSITION_MESSAGE } from 'src/containers/AdminVenues/venue-shared.utils';
import type { VenueListingSuggestion } from 'src/containers/AdminVenues/venue-address-lookup';
import { AuthContext, defaultAuth } from 'src/providers/Auth.provider';
import { defaultGig } from 'src/providers/fetchGigs';
import type { Igig } from 'src/providers/Data.provider';
import { CreateGigDialog } from 'src/containers/Music/Gigs/CreateGigDialog';
import { EditGigDialog } from 'src/containers/Music/Gigs/EditGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';

const listing: VenueListingSuggestion = {
  listingId: 'lookup-listing',
  name: 'Lookup Hall',
  street: '123 Campbell Ave',
  city: 'Roanoke',
  state: 'NC',
  zipCode: '24011',
  website: 'https://listing.example.com',
  lat: 37.27,
  lng: -79.94,
};
const optionLabel = 'Lookup Hall — 123 Campbell Ave, Roanoke';
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const auth = { ...defaultAuth, token: 'lookup-token' };

function Harness({ mode }: { mode: 'create' | 'edit' }) {
  const [open, setOpen] = useState(true);
  const [gig, setGig] = useState<Igig>({ ...defaultGig, _id: 'gig1', datetime: new Date() });
  const [changed, setChanged] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  return (
    <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
      {savedMessage && <div data-testid="gig-saved-message">{savedMessage}</div>}
      <button onClick={() => { setOpen(true); setGig({ ...defaultGig, _id: 'gig2', datetime: new Date() }); }}>Reopen</button>
      {mode === 'create' ? <CreateGigDialog showDialog={open} setShowDialog={setOpen} onSaveMessage={setSavedMessage} /> : (
        <EditGigDialog
          editGig={gig} setEditGig={setGig} setShowDialog={setOpen} editChanged={changed}
          setEditChanged={setChanged} getGigs={vi.fn()} auth={auth} onSaveMessage={setSavedMessage}
        />
      )}
    </AuthContext.Provider>
  );
}

async function tick() { await act(async () => { await vi.advanceTimersByTimeAsync(300); }); }
function deferred() {
  let resolve!: (value: Response) => void;
  const promise = new Promise<Response>((done) => { resolve = done; });
  return { promise, resolve };
}

// Registered in both dialog suites so they exercise the same caller contract.
export function gigLookupTests(mode: 'create' | 'edit') {
  describe('shared venue listings lookup caller', () => {
    const fetchMock = vi.mocked(customFetch);
    const submit = () => screen.getByRole('button', { name: mode === 'create' ? /^create$/i : /^update$/i });
    beforeEach(async () => {
      vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
      vi.stubEnv('BackendUrl', '');
      vi.spyOn(adminVenuesUtils, 'listVenues').mockResolvedValue([]);
      vi.spyOn(adminVenuesUtils, 'fetchWarningVenues').mockResolvedValue([]);
      vi.spyOn(adminVenuesUtils, 'createVenueWithOutcome').mockResolvedValue({
        venue: { _id: 'new-venue', name: 'Lookup Hall', location: { type: 'Point', coordinates: [-79.94, 37.27] } },
        status: 201,
        outcome: 'created',
      });
      vi.spyOn(utils, 'createGig').mockResolvedValue('error');
      vi.spyOn(utils, 'updateGig').mockResolvedValue('error');
      fetchMock.mockReset();
      fetchMock.mockResolvedValue(response([listing]));
      await act(async () => { render(<Harness mode={mode} />); });
      fireEvent.click(screen.getByLabelText('Create New Venue'));
    });
    afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

    async function choose(query = 'Lookup', label = optionLabel) {
      fill('* Venue Name', query);
      await tick();
      fireEvent.click(screen.getByRole('button', { name: label }));
      await act(async () => {});
    }
    async function save() {
      fireEvent.click(submit());
      await act(async () => {});
      expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledTimes(1);
      return vi.mocked(adminVenuesUtils.createVenueWithOutcome).mock.calls[0][1];
    }

    it('fills editable fields, fills empty website, and saves the exact selected pin', async () => {
      fetchMock.mockResolvedValueOnce(response([listing]));
      await choose();
      expect(screen.getByLabelText('* Venue Name')).toHaveValue(listing.name);
      expect(screen.getByLabelText('* Street Address')).toHaveValue(listing.street);
      expect(screen.getByLabelText('* City')).toHaveValue(listing.city);
      expect(screen.getByLabelText('* State')).toHaveValue('NC');
      expect(screen.getByLabelText('* Zip Code')).toHaveValue('24011');
      expect(screen.getByLabelText('Website')).toHaveValue(listing.website);
      expect(submit()).toBeEnabled();
      expect(await save()).toMatchObject({
        name: listing.name,
        address: listing.street,
        city: listing.city,
        usState: 'NC',
        zipCode: '24011',
        website: listing.website,
        location: { type: 'Point', coordinates: [-79.94, 37.27] },
      });
      expect(String(fetchMock.mock.calls[0][0])).toContain('/venue/listings/search?q=Lookup');
      expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer lookup-token' });
    });

    it('keeps an already typed website as typed when selecting a listing', async () => {
      fill('Website', 'https://custom.example.com');
      await choose();
      expect(screen.getByLabelText('Website')).toHaveValue('https://custom.example.com');
      expect(await save()).toMatchObject({ website: 'https://custom.example.com' });
    });

    it.each(['* Street Address', '* City', '* State', '* Zip Code'])('clears selected coordinates after editing %s', async (label) => {
      await choose();
      fill(label, label === '* State' ? 'VA' : label === '* Zip Code' ? '24153' : 'Manual value');
      expect(await save()).not.toHaveProperty('location');
    });

    it('keeps missing components required and retains existing manual parts', async () => {
      fetchMock.mockResolvedValueOnce(response([{ ...listing, city: '', zipCode: '', website: '' }]));
      fill('* City', 'Manual city');
      await choose('Lookup', 'Lookup Hall — 123 Campbell Ave');
      expect(screen.getByLabelText('* City')).toHaveValue('Manual city');
      expect(submit()).toBeDisabled();
      fill('* Zip Code', '24153-1234');
      expect(submit()).toBeEnabled();
      expect(await save()).toMatchObject({ address: listing.street, city: 'Manual city', zipCode: '24153-1234' });
    });

    it.each([503, 502, 200])('allows a complete typed save when listings return %s', async (status) => {
      fetchMock.mockResolvedValueOnce(response(status === 200 ? [] : { message: 'Unavailable' }, status));
      fill('* Venue Name', 'Manual Hall');
      await tick();
      expect(screen.getByText(/manually/)).toBeInTheDocument();
      fill('* Street Address', '9 Manual St');
      fill('* City', 'Salem');
      fill('* Zip Code', '24153');
      expect(await save()).toMatchObject({ name: 'Manual Hall', address: '9 Manual St', city: 'Salem' });
    });

    it('shows the no-position message when saved venue has no location', async () => {
      vi.spyOn(adminVenuesUtils, 'createVenueWithOutcome').mockResolvedValueOnce({
        venue: { _id: 'no-loc', name: 'Manual Hall' },
        status: 201,
        outcome: 'created',
      });
      fill('* Venue Name', 'Manual Hall');
      fill('* Street Address', '9 Manual St');
      fill('* City', 'Salem');
      fill('* Zip Code', '24153');
      await save();
      expect(screen.getByTestId('gig-saved-message')).toHaveTextContent(NO_MAP_POSITION_MESSAGE);
    });

    it('discards an older search after new typing', async () => {
      const old = deferred();
      fetchMock.mockReturnValueOnce(old.promise);
      fill('* Venue Name', 'Old name');
      await tick();
      fill('* Venue Name', 'Lookup');
      await tick();
      await act(async () => old.resolve(response([{ ...listing, listingId: 'old', name: 'Obsolete Hall' }])));
      expect(screen.queryByText(/Obsolete Hall/)).not.toBeInTheDocument();
      expect(screen.getByText(optionLabel)).toBeInTheDocument();
    });

    it.each(['manual edit', 'venue path', 'dialog session'])('cancels pending search after %s', async (change) => {
      const pending = deferred();
      fetchMock.mockReturnValueOnce(pending.promise);
      fill('* Venue Name', 'Lookup');
      await tick();
      if (change === 'manual edit') fill('* City', 'Manual city');
      else if (change === 'venue path') {
        fireEvent.click(screen.getByLabelText('Pick Existing Venue'));
        fireEvent.click(screen.getByLabelText('Create New Venue'));
      } else {
        fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Reopen' }));
        fireEvent.click(screen.getByLabelText('Create New Venue'));
      }
      await act(async () => pending.resolve(response([listing])));
      expect(screen.queryByRole('button', { name: optionLabel })).not.toBeInTheDocument();
    });
  });
}
