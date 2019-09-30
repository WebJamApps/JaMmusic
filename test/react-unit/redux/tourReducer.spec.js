import reducer from '../../../src/redux/reducers/tourReducer';

describe('tour reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        tour: [],
        tourUpdated: false,
      },
    );
  });
  it('handles RESET_TOUR', () => {
    expect(reducer({ tour: [], tourUpdated: true }, { type: 'RESET_TOUR' })).toEqual(
      {
        tour: [],
        tourUpdated: false,
      },
    );
  });
  it('handles NEW_TOUR', () => {
    const t1 = { datetime: new Date() };
    const t2 = { datetime: new Date() };
    expect(reducer({ tour: [t1], tourUpdated: true }, { type: 'NEW_TOUR', data: t2 })).toEqual(
      {
        tour: [t2, t1],
        tourUpdated: true,
      },
    );
  });
});
