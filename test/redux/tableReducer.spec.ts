import reducer from '../../src/redux/reducers/tableReducer';

describe('table reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '', showTable: true })).toEqual(
      {
        showTable: true,
      },
    );
  });
  it('should hide table', () => {
    expect(reducer(undefined, { type: 'SHOW_TABLE', showTable: false })).toEqual(
      {
        showTable: false,
      },
    );
  });
  it('should show table', () => {
    expect(reducer(undefined, { type: 'SHOW_TABLE', showTable: true })).toEqual(
      {
        showTable: true,
      },
    );
  });
});
