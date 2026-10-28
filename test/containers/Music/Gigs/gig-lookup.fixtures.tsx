import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { customFetch } from 'src/lib/fetch.utils';
import adminVenuesUtils from 'src/containers/AdminVenues/admin-venues.utils';
import { AuthContext, defaultAuth } from 'src/providers/Auth.provider';
import { defaultGig } from 'src/providers/fetchGigs';
import type { Igig } from 'src/providers/Data.provider';
import { CreateGigDialog } from 'src/containers/Music/Gigs/CreateGigDialog';
import { EditGigDialog } from 'src/containers/Music/Gigs/EditGigDialog';
import utils from 'src/containers/Music/Gigs/gigs.utils';
const suggestion = { placeId: 'lookup-place', text: '123 Campbell Ave, Roanoke' };
const details = { street: '123 Campbell Ave', city: 'Roanoke', state: 'NC', country: 'US', zipCode: '24011', lat: 37.27, lng: -79.94 };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const auth = { ...defaultAuth, token: 'lookup-token' };
function Harness({ mode }: { mode: 'create' | 'edit' }) {
  const [open, setOpen] = useState(true);
  const [gig, setGig] = useState<Igig>({ ...defaultGig, _id: 'gig1', datetime: new Date() });
  const [changed, setChanged] = useState(false);
  return (
    <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
      <button onClick={() => { setOpen(true); setGig({ ...defaultGig, _id: 'gig2', datetime: new Date() }); }}>Reopen</button>
      {mode === 'create' ? <CreateGigDialog showDialog={open} setShowDialog={setOpen} /> : (
        <EditGigDialog editGig={gig} setEditGig={setGig} setShowDialog={setOpen} editChanged={changed}
          setEditChanged={setChanged} getGigs={vi.fn()} auth={auth} />
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
  describe('shared address lookup caller', () => {
    const fetchMock = vi.mocked(customFetch);
    const submit = () => screen.getByRole('button', { name: mode === 'create' ? /^create$/i : /^update$/i });
    beforeEach(async () => {
      vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
      vi.stubEnv('BackendUrl', '');
      vi.spyOn(adminVenuesUtils, 'listVenues').mockResolvedValue([]);
      vi.spyOn(adminVenuesUtils, 'fetchWarningVenues').mockResolvedValue([]);
      vi.spyOn(adminVenuesUtils, 'createVenueWithOutcome').mockResolvedValue({
        venue: { _id: 'new-venue', name: 'Lookup Hall' }, status: 201, outcome: 'created',
      });
      vi.spyOn(utils, 'createGig').mockResolvedValue('error');
      vi.spyOn(utils, 'updateGig').mockResolvedValue('error');
      fetchMock.mockResolvedValue(response([suggestion]));
      await act(async () => { render(<Harness mode={mode} />); });
      fireEvent.click(screen.getByLabelText('Create New Venue'));
      fill('* Venue Name', 'Lookup Hall');
    });
    afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });
    async function choose() {
      fill('* Street Address', '123 Campbell');
      await tick();
      fireEvent.click(screen.getByRole('button', { name: suggestion.text }));
      await act(async () => {});
    }
    async function save() {
      fireEvent.click(submit());
      await act(async () => {});
      expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledTimes(1);
      return vi.mocked(adminVenuesUtils.createVenueWithOutcome).mock.calls[0][1];
    }

    it('fills editable components, marks edit changes, and saves the exact selected pin', async () => {
      fetchMock.mockResolvedValueOnce(response([suggestion])).mockResolvedValueOnce(response(details));
      await choose();
      expect(screen.getByLabelText('* Street Address')).toHaveValue(details.street);
      expect(screen.getByLabelText('* City')).toHaveValue(details.city);
      expect(screen.getByLabelText('* State')).toHaveValue('NC');
      expect(screen.getByLabelText('* Zip Code')).toHaveValue('24011');
      expect(submit()).toBeEnabled();
      fill('Website', 'hall.example.com');
      expect(await save()).toMatchObject({
        address: details.street, city: details.city, usState: 'NC', zipCode: '24011',
        website: 'https://hall.example.com', location: { type: 'Point', coordinates: [-79.94, 37.27] },
      });
      expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer lookup-token' });
    });

    it.each(['* Street Address', '* City', '* State', '* Zip Code'])('clears selected coordinates after editing %s', async (label) => {
      fetchMock.mockResolvedValueOnce(response([suggestion])).mockResolvedValueOnce(response(details));
      await choose();
      fill(label, label === '* State' ? 'VA' : label === '* Zip Code' ? '24153' : 'Manual value');
      expect(await save()).not.toHaveProperty('location');
    });

    it('keeps missing components required and retains existing manual parts', async () => {
      fetchMock.mockResolvedValueOnce(response([suggestion])).mockResolvedValueOnce(response({ street: '1 Main St' }));
      fill('* City', 'Manual city');
      await choose();
      expect(screen.getByLabelText('* City')).toHaveValue('Manual city');
      expect(submit()).toBeDisabled();
      fill('* Zip Code', '24153-1234');
      expect(submit()).toBeEnabled();
      expect(await save()).toMatchObject({ address: '1 Main St', city: 'Manual city', zipCode: '24153-1234' });
    });

    it.each([503, 502, 200])('allows a complete typed save when suggestions return %s', async (status) => {
      fetchMock.mockResolvedValueOnce(response(status === 200 ? [] : { message: 'Unavailable' }, status));
      fill('* Street Address', '9 Manual St');
      await tick();
      expect(screen.getByText(/enter the address manually/)).toBeInTheDocument();
      fill('* City', 'Salem');
      fill('* Zip Code', '24153');
      expect(await save()).toMatchObject({ address: '9 Manual St', city: 'Salem' });
    });

    it('retains typed values after a details failure', async () => {
      fetchMock.mockResolvedValueOnce(response([suggestion])).mockResolvedValueOnce(response({}, 502));
      await choose();
      expect(screen.getByLabelText('* Street Address')).toHaveValue('123 Campbell');
      expect(screen.getByText(/enter the address manually/)).toBeInTheDocument();
      fill('* City', 'Salem');
      fill('* Zip Code', '24153');
      expect(await save()).not.toHaveProperty('location');
    });

    it('discards an older search after new typing', async () => {
      const old = deferred();
      fetchMock.mockReturnValueOnce(old.promise);
      fill('* Street Address', 'Old street');
      await tick();
      fill('* Street Address', 'New street');
      await tick();
      await act(async () => old.resolve(response([{ placeId: 'old', text: 'Obsolete' }])));
      expect(screen.queryByText('Obsolete')).not.toBeInTheDocument();
      expect(screen.getByText(suggestion.text)).toBeInTheDocument();
    });

    it.each(['manual edit', 'venue path', 'dialog session'])('discards late details after %s', async (change) => {
      const pending = deferred();
      fetchMock.mockResolvedValueOnce(response([suggestion])).mockReturnValueOnce(pending.promise);
      await choose();
      if (change === 'manual edit') fill('* City', 'Manual city');
      else if (change === 'venue path') {
        fireEvent.click(screen.getByLabelText('Pick Existing Venue'));
        fireEvent.click(screen.getByLabelText('Create New Venue'));
      } else {
        fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Reopen' }));
        fireEvent.click(screen.getByLabelText('Create New Venue'));
      }
      await act(async () => pending.resolve(response(details)));
      expect(screen.getByLabelText('* City')).toHaveValue(change === 'manual edit' ? 'Manual city' : '');
      expect(screen.getByLabelText('* Zip Code')).toHaveValue('');
    });
  });
}
