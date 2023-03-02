import socketClusterMessages from 'src/providers/socketClusterMessages';

describe('socketClusterMessages', () => {
  it('validateData when it is an array', () => {
    let dataArr = null;
    const setFunc = jest.fn((d) => { dataArr = d; });
    const receiver = { value: [{}] };
    socketClusterMessages.validateData(receiver, setFunc);
    expect(Array.isArray(dataArr)).toBeTruthy();
  });
});
