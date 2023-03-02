import { Store } from 'react-notifications-component';
import commonUtils from 'src/lib/commonUtils';

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
    Store.addNotification = jest.fn();
    commonUtils.notify('title', 'message', 'success');
    expect(Store.addNotification).toHaveBeenCalled();
  });
});
