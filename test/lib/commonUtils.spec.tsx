import commonUtils from '../../src/lib/commonUtils';

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
});
