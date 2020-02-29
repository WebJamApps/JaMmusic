import commonUtils from '../../src/lib/commonUtils';

describe('forms', () => {
  it('calls scrollIntoView', () => {
    const scrollIntoViewMock = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    document.body.innerHTML = '<div class="page-content"></div>';
    commonUtils.setTitleAndScroll('home');
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });
  it('calls scrollIntoView from wide homepage', () => {
    const scrollIntoViewMock = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    document.body.innerHTML = '<div class="anchor"></div>';
    commonUtils.setTitleAndScroll('', 1200);
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });
});
