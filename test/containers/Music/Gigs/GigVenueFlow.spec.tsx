import { useState } from 'react';
import { vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthContext, defaultAuth } from 'src/providers/Auth.provider';
import { defaultGig } from 'src/providers/fetchGigs';
import type { Igig } from 'src/providers/Data.provider';
import { CreateGigDialog } from 'src/containers/Music/Gigs/CreateGigDialog';
import { EditGigDialog } from 'src/containers/Music/Gigs/EditGigDialog';
import adminVenuesUtils from 'src/containers/AdminVenues/admin-venues.utils';
import utils, { type GigOpResult } from 'src/containers/Music/Gigs/gigs.utils';

const auth = { ...defaultAuth, token: 'fixture-token' };
function Harness({ mode }: { mode: 'create' | 'edit' }) {
  const [open, setOpen] = useState(true);
  const [gig, setGig] = useState<Igig>({ ...defaultGig, _id: 'gig1', datetime: new Date(), venue: 'Original detail' });
  const [changed, setChanged] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <AuthContext.Provider value={{ auth, setAuth: vi.fn() }}>
      <div data-testid="persistent-result">{message}</div>
      {mode === 'create' ? <CreateGigDialog showDialog={open} setShowDialog={setOpen} onSaveMessage={setMessage} /> : (
        <EditGigDialog
          editGig={gig} setEditGig={setGig} setShowDialog={setOpen}
          editChanged={changed} setEditChanged={setChanged} getGigs={vi.fn()} auth={auth} onSaveMessage={setMessage}
        />
      )}
    </AuthContext.Provider>
  );
}
const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
async function enterVenue(mode: 'create' | 'edit') {
  render(<Harness mode={mode} />);
  fireEvent.click(screen.getByLabelText('Create New Venue'));
  fill('* Venue Name', ' The Hall ');
  fill('* Street Address', ' 1 Electric Road ');
  fill('* City', ' Salem ');
  fill('* Zip Code', '24153-1234');
  const button = screen.getByRole('button', { name: mode === 'create' ? /^create$/i : /^update$/i });
  await waitFor(() => expect(button).toBeEnabled());
  return button;
}

describe.each(['create', 'edit'] as const)('%s gig venue flow', (mode) => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(adminVenuesUtils, 'listVenues').mockResolvedValue([]);
    vi.spyOn(adminVenuesUtils, 'fetchWarningVenues').mockResolvedValue([
      { _id: 'restored', name: 'the hall', city: 'salem', address: '1 Electric Rd', status: 'archived' },
      { _id: 'legacy', name: 'The Hall', city: 'Salem' },
    ]);
    vi.spyOn(adminVenuesUtils, 'createVenueWithOutcome').mockResolvedValue({
      venue: { _id: 'restored', name: 'The Hall' }, outcome: 'updated', status: 200,
    });
  });

  it('validates complete fields, ZIP, optional URL and whitespace using shared rules', async () => {
    const button = await enterVenue(mode);
    for (const label of ['* Venue Name', '* Street Address', '* City', '* Zip Code', '* State']) {
      const initial = (screen.getByLabelText(label) as HTMLInputElement).value;
      fill(label, '');
      expect(button).toBeDisabled();
      fill(label, initial);
    }
    fill('* City', '   ');
    expect(button).toBeDisabled();
    fill('* City', 'Salem');
    fill('* Zip Code', '1234');
    expect(button).toBeDisabled();
    fill('* Zip Code', '24153');
    fill('Website', 'not-a-site');
    expect(button).toBeDisabled();
    fill('Website', 'hall.example.com');
    expect(button).toBeEnabled();
  });

  it('shows archived addresses and conditional backend rules, and allows cancellation without writes', async () => {
    await enterVenue(mode);
    expect(screen.getByText(/1 Electric Rd.*\[archived\]/)).toBeInTheDocument();
    expect(screen.getByText(/If no street address matches, saving will update/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(adminVenuesUtils.createVenueWithOutcome).not.toHaveBeenCalled();
  });

  it('retains input after venue refusal and never attempts the gig', async () => {
    const gigSave = vi.spyOn(utils, mode === 'create' ? 'createGig' : 'updateGig');
    vi.spyOn(adminVenuesUtils, 'createVenueWithOutcome').mockRejectedValue(new Error('Ambiguous address-less matches'));
    const button = await enterVenue(mode);
    fill('Website', 'hall.example.com');
    fireEvent.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('Ambiguous address-less matches');
    expect(screen.getByLabelText('* Street Address')).toHaveValue(' 1 Electric Road ');
    expect(screen.getByLabelText('Website')).toHaveValue('hall.example.com');
    expect(gigSave).not.toHaveBeenCalled();
  });

  it('reports venue success separately, exposes socket failure, and reuses the unchanged venue ID on retry', async () => {
    const gigSave = vi.spyOn(utils, mode === 'create' ? 'createGig' : 'updateGig');
    gigSave.mockImplementationOnce(async (...args: unknown[]): Promise<GigOpResult> => {
      const last = args.at(-1);
      if (typeof last === 'function') last('Socket refused this gig');
      return 'error';
    }).mockResolvedValueOnce('unconfirmed');
    const button = await enterVenue(mode);
    fill('Website', 'hall.example.com');
    fireEvent.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('Socket refused this gig');
    expect(screen.getByTestId('persistent-result')).toHaveTextContent('Existing archived venue restored and updated');
    expect(screen.getByTestId('persistent-result')).not.toHaveTextContent('Gig created');
    expect(screen.getByLabelText('* City')).toHaveValue(' Salem ');
    expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledWith(auth.token, {
      name: 'The Hall', address: '1 Electric Road', city: 'Salem', usState: 'VA',
      zipCode: '24153-1234', website: 'https://hall.example.com', status: 'active',
    });
    fireEvent.click(button);
    await waitFor(() => expect(gigSave).toHaveBeenCalledTimes(2));
    expect(adminVenuesUtils.createVenueWithOutcome).toHaveBeenCalledTimes(1);
    const args = gigSave.mock.calls[1];
    if (mode === 'create') expect(args[10]).toBe('restored');
    else expect(args[3]).toEqual(expect.objectContaining({ venueId: 'restored' }));
    expect(screen.getByTestId('persistent-result')).toHaveTextContent("Couldn't confirm gig save");
    expect(screen.getByTestId('persistent-result')).not.toHaveTextContent('Gig updated.');
  });

  it('saves changed venue fields again after a failed gig, and reports a confirmed save', async () => {
    vi.spyOn(utils, mode === 'create' ? 'createGig' : 'updateGig').mockResolvedValueOnce('error').mockResolvedValueOnce('success');
    const save = vi.spyOn(adminVenuesUtils, 'createVenueWithOutcome').mockResolvedValue({
      venue: { _id: 'new1', name: 'The Hall' }, outcome: 'created', status: 201,
    });
    const button = await enterVenue(mode);
    fireEvent.click(button);
    await screen.findByRole('alert');
    fill('* Street Address', '2 Electric Road');
    fireEvent.click(button);
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId('persistent-result')).toHaveTextContent(mode === 'create' ? 'Gig created.' : 'Gig updated.');
    expect(screen.getByTestId('persistent-result')).toHaveTextContent('Venue created');
  });

  it('preserves one-off entry without creating a venue', async () => {
    const gigSave = vi.spyOn(utils, mode === 'create' ? 'createGig' : 'updateGig').mockResolvedValue('success');
    render(<Harness mode={mode} />);
    fireEvent.click(screen.getByLabelText('No Venue (One-off)'));
    fill('rich text editor', 'One-off event');
    fireEvent.click(screen.getByRole('button', { name: mode === 'create' ? /^create$/i : /^update$/i }));
    await waitFor(() => expect(gigSave).toHaveBeenCalledTimes(1));
    expect(adminVenuesUtils.createVenueWithOutcome).not.toHaveBeenCalled();
    if (mode === 'create') expect(gigSave.mock.calls[0][10]).toBeNull();
    else expect(gigSave.mock.calls[0][3]).toEqual(expect.objectContaining({ venueId: undefined, venue: 'One-off event' }));
  });

  it('shows warning-inventory failure and retries without losing the typed entry', async () => {
    vi.spyOn(adminVenuesUtils, 'fetchWarningVenues').mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([]);
    render(<Harness mode={mode} />);
    fireEvent.click(screen.getByLabelText('Create New Venue'));
    fill('* Venue Name', 'Kept name');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to check existing venues');
    fireEvent.click(screen.getByRole('button', { name: 'Retry venue check' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(screen.getByLabelText('* Venue Name')).toHaveValue('Kept name');
  });
});
