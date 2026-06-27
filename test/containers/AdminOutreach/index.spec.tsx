/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthContext, defaultAuth, type Iauth } from 'src/providers/Auth.provider';
import { AdminOutreach } from 'src/containers/AdminOutreach';
import outreachUtils, { type Icandidate, type IbatchResult, type IpitchPreview } from 'src/containers/AdminOutreach/outreach.utils';

const candidates: Icandidate[] = [
  { _id: 'c1', name: 'Venue A', city: 'Salem', venueType: 'Originals' },
  { _id: 'c2', name: 'Venue B' },
];
const okResult: IbatchResult = { requested: 2, sent: 2, skipped: [], records: [] };
const previews: IpitchPreview[] = [
  { venueId: 'c1', venueName: 'Venue A', subject: 'Subject A', body: 'Body A' },
  { venueId: 'c2', venueName: 'Venue B', subject: 'Subject B', body: 'Body B' },
];

const adminAuth: Iauth = {
  isAuthenticated: true,
  error: '',
  token: 'tk',
  user: { userType: 'JaM-admin', email: 'a@b.com' },
};

const wrap = (auth: Iauth) => (
  <AuthContext.Provider value={{ auth, setAuth: () => { /* noop */ } }}>
    <AdminOutreach />
  </AuthContext.Provider>
);

const renderPage = async () => { await act(async () => { render(wrap(adminAuth)); }); };
const typeDates = () => fireEvent.change(screen.getByTestId('outreach-target-dates'), { target: { value: '2026-08-15' } });

describe('AdminOutreach', () => {
  beforeEach(() => {
    outreachUtils.getAllowedAdminRoles = vi.fn(() => ['JaM-admin']) as any;
    outreachUtils.getConfig = vi.fn(() => Promise.resolve({ autoApprove: false })) as any;
    outreachUtils.getCandidates = vi.fn(() => Promise.resolve(candidates)) as any;
    outreachUtils.sendBatch = vi.fn(() => Promise.resolve(okResult)) as any;
    outreachUtils.setConfig = vi.fn((_t: string, v: boolean) => Promise.resolve({ autoApprove: v })) as any;
    outreachUtils.getPreview = vi.fn(() => Promise.resolve(previews)) as any;
  });

  it('renders not-authorized when not authenticated', () => {
    render(wrap(defaultAuth));
    expect(screen.getByTestId('admin-outreach-unauthorized')).toBeDefined();
  });

  it('renders the page and loads the auto-approve config on mount', async () => {
    await renderPage();
    expect(screen.getByTestId('admin-outreach-page')).toBeDefined();
    expect(outreachUtils.getConfig).toHaveBeenCalledWith('tk');
  });

  it('does not crash when the config read fails', async () => {
    outreachUtils.getConfig = vi.fn(() => Promise.reject(new Error('cfg'))) as any;
    await renderPage();
    expect(screen.getByTestId('admin-outreach-page')).toBeDefined();
  });

  it('errors if you load candidates without target dates', async () => {
    await renderPage();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    expect(screen.getByTestId('outreach-error')).toBeDefined();
    expect(outreachUtils.getCandidates).not.toHaveBeenCalled();
  });

  it('loads + preselects the proposed venues', async () => {
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    expect(outreachUtils.getCandidates).toHaveBeenCalledWith('tk', '2026-08-15');
    expect(screen.getByTestId('outreach-candidates').textContent).toContain('2 of 2');
  });

  it('toggling a candidate reduces the selection count', async () => {
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByRole('checkbox', { name: /Venue A/i })); });
    expect(screen.getByTestId('outreach-candidates').textContent).toContain('1 of 2');
  });

  it('opens dialog and shows previews', async () => {
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });
    expect(outreachUtils.getPreview).toHaveBeenCalledWith('tk', ['c1', 'c2'], '2026-08-15');
    expect(screen.getByTestId('outreach-dialog')).toBeDefined();
    expect(screen.getByTestId('preview-c1')).toBeDefined();
  });

  it('sends the batch and shows the result', async () => {
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-dialog-send')); });
    expect(outreachUtils.sendBatch).toHaveBeenCalledWith('tk', expect.objectContaining({
      venueIds: ['c1', 'c2'], targetDates: '2026-08-15',
    }));
    expect(screen.getByTestId('outreach-result').textContent).toContain('Sent 2 of 2');
  });

  it('renders skip reasons in the result', async () => {
    outreachUtils.sendBatch = vi.fn(() => Promise.resolve({
      requested: 2, sent: 1, skipped: [{ venueId: 'c2', reason: 'not outreach-eligible' }], records: [],
    })) as any;
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-dialog-send')); });
    expect(screen.getByTestId('outreach-result').textContent).toContain('not outreach-eligible');
  });

  it('shows an error when loading candidates fails', async () => {
    outreachUtils.getCandidates = vi.fn(() => Promise.reject(new Error('load fail'))) as any;
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    expect(screen.getByTestId('outreach-error').textContent).toBe('load fail');
  });

  it('shows an error when get preview fails', async () => {
    outreachUtils.getPreview = vi.fn(() => Promise.reject(new Error('preview fail'))) as any;
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });
    expect(screen.getByTestId('preview-error').textContent).toBe('preview fail');
  });

  it('shows an error when the batch send fails', async () => {
    outreachUtils.sendBatch = vi.fn(() => Promise.reject(new Error('send fail'))) as any;
    await renderPage();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-open-dialog')); });
    await act(async () => { fireEvent.click(screen.getByTestId('outreach-dialog-send')); });
    expect(screen.getByTestId('outreach-error').textContent).toBe('send fail');
  });

  it('toggles auto-approve via setConfig', async () => {
    await renderPage();
    await act(async () => { fireEvent.click(screen.getByRole('checkbox', { name: /auto-approve/i })); });
    expect(outreachUtils.setConfig).toHaveBeenCalledWith('tk', true);
  });

  it('shows an error when setConfig fails', async () => {
    outreachUtils.setConfig = vi.fn(() => Promise.reject(new Error('cfg fail'))) as any;
    await renderPage();
    await act(async () => { fireEvent.click(screen.getByRole('checkbox', { name: /auto-approve/i })); });
    expect(screen.getByTestId('outreach-error').textContent).toBe('cfg fail');
  });
});
