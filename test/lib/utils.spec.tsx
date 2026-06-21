import { toast } from 'react-toastify';
import commonUtils from 'src/lib/utils';

describe('commonUtils', () => {
  it('calls scrollIntoView', () => {
    const scrollIntoViewMock = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    document.body.innerHTML = '<div class="page-content"></div>';
    commonUtils.setTitleAndScroll('home', 1200);
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });
  it('runs delay', async () => {
    jest.useRealTimers();
    jest.spyOn(global, 'setTimeout');
    await commonUtils.delay(0.0001);
    expect(setTimeout).toHaveBeenCalledTimes(1);
  }, 15000);
  it('getUserRoles when userRoles is missing from env vars', () => {
    delete process.env.userRoles;
    expect(commonUtils.getUserRoles().length).toBe(0);
  });
  it('notify', () => {
    const spy = vi.spyOn(toast, 'success').mockImplementation(() => 0 as never);
    commonUtils.notify('title', 'message', 'success');
    expect(spy).toHaveBeenCalled();
  });
  it.each([
    ['danger', 'error'],
    ['warning', 'warning'],
    ['info', 'info'],
  ] as const)('notify routes %s to toast.%s', (type, method) => {
    const spy = vi.spyOn(toast, method).mockImplementation(() => 0 as never);
    commonUtils.notify('t', 'm', type);
    expect(spy).toHaveBeenCalledWith('t: m', expect.anything());
  });
  it('notify falls back to the default toast for an unknown type', () => {
    // 'default' hits the switch default -> bare toast(body, opts) (line 33).
    expect(() => commonUtils.notify('t', 'm', 'default')).not.toThrow();
  });
});
