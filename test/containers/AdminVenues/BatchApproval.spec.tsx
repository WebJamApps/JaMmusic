/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BatchApproval } from 'src/containers/AdminVenues/BatchApproval';
import adminVenuesUtils, { type Icandidate, type IbatchResult } from 'src/containers/AdminVenues/admin-venues.utils';

const candidates: Icandidate[] = [
  { _id: 'c1', name: 'Venue A', city: 'Salem', venueType: 'Originals' },
  { _id: 'c2', name: 'Venue B' },
];
const okResult: IbatchResult = { requested: 2, sent: 2, skipped: [], records: [] };

const renderBatch = async () => { await act(async () => { render(<BatchApproval token="tk" />); }); };
const typeDates = () => fireEvent.change(screen.getByTestId('batch-target-dates'), { target: { value: 'Aug 14-16' } });

describe('BatchApproval', () => {
  beforeEach(() => {
    adminVenuesUtils.getConfig = vi.fn(() => Promise.resolve({ autoApprove: false })) as any;
    adminVenuesUtils.getCandidates = vi.fn(() => Promise.resolve(candidates)) as any;
    adminVenuesUtils.sendBatch = vi.fn(() => Promise.resolve(okResult)) as any;
    adminVenuesUtils.setConfig = vi.fn((_t: string, v: boolean) => Promise.resolve({ autoApprove: v })) as any;
  });

  it('loads the auto-approve config on mount', async () => {
    await renderBatch();
    expect(adminVenuesUtils.getConfig).toHaveBeenCalledWith('tk');
  });

  it('does not crash when the config read fails', async () => {
    adminVenuesUtils.getConfig = vi.fn(() => Promise.reject(new Error('cfg'))) as any;
    await renderBatch();
    expect(screen.getByTestId('batch-approval')).toBeDefined();
  });

  it('errors if you load candidates without target dates', async () => {
    await renderBatch();
    await act(async () => { fireEvent.click(screen.getByTestId('batch-load')); });
    expect(screen.getByTestId('batch-error')).toBeDefined();
    expect(adminVenuesUtils.getCandidates).not.toHaveBeenCalled();
  });

  it('loads + preselects the proposed venues', async () => {
    await renderBatch();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('batch-load')); });
    expect(adminVenuesUtils.getCandidates).toHaveBeenCalledWith('tk', 'Aug 14-16');
    expect(screen.getByTestId('batch-candidates').textContent).toContain('2 of 2');
  });

  it('toggling a candidate reduces the selection count', async () => {
    await renderBatch();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('batch-load')); });
    await act(async () => { fireEvent.click(screen.getByRole('checkbox', { name: /Venue A/i })); });
    expect(screen.getByTestId('batch-candidates').textContent).toContain('1 of 2');
  });

  it('sends the batch and shows the result', async () => {
    await renderBatch();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('batch-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('batch-send')); });
    expect(adminVenuesUtils.sendBatch).toHaveBeenCalledWith('tk', expect.objectContaining({
      venueIds: ['c1', 'c2'], targetDates: 'Aug 14-16',
    }));
    expect(screen.getByTestId('batch-result').textContent).toContain('Sent 2 of 2');
  });

  it('renders skip reasons in the result', async () => {
    adminVenuesUtils.sendBatch = vi.fn(() => Promise.resolve({
      requested: 2, sent: 1, skipped: [{ venueId: 'c2', reason: 'not outreach-eligible' }], records: [],
    })) as any;
    await renderBatch();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('batch-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('batch-send')); });
    expect(screen.getByTestId('batch-result').textContent).toContain('not outreach-eligible');
  });

  it('shows an error when loading candidates fails', async () => {
    adminVenuesUtils.getCandidates = vi.fn(() => Promise.reject(new Error('load fail'))) as any;
    await renderBatch();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('batch-load')); });
    expect(screen.getByTestId('batch-error').textContent).toBe('load fail');
  });

  it('shows an error when the batch send fails', async () => {
    adminVenuesUtils.sendBatch = vi.fn(() => Promise.reject(new Error('send fail'))) as any;
    await renderBatch();
    typeDates();
    await act(async () => { fireEvent.click(screen.getByTestId('batch-load')); });
    await act(async () => { fireEvent.click(screen.getByTestId('batch-send')); });
    expect(screen.getByTestId('batch-error').textContent).toBe('send fail');
  });

  it('toggles auto-approve via setConfig', async () => {
    await renderBatch();
    await act(async () => { fireEvent.click(screen.getByRole('checkbox', { name: /auto-approve/i })); });
    expect(adminVenuesUtils.setConfig).toHaveBeenCalledWith('tk', true);
  });

  it('shows an error when setConfig fails', async () => {
    adminVenuesUtils.setConfig = vi.fn(() => Promise.reject(new Error('cfg fail'))) as any;
    await renderBatch();
    await act(async () => { fireEvent.click(screen.getByRole('checkbox', { name: /auto-approve/i })); });
    expect(screen.getByTestId('batch-error').textContent).toBe('cfg fail');
  });
});
