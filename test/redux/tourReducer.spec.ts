import reducer from '../../src/redux/reducers/tourReducer';

describe('tour reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '', data: { datetime: '', _id: '' } })).toEqual(
      {
        tour: [],
        tourUpdated: false,
        editTour: {},
        editSong: { _id: '' },
      },
    );
  });
  it('handles RESET_TOUR', () => {
    expect(reducer(undefined, { type: 'RESET_TOUR' })).toEqual(
      {
        tour: [],
        tourUpdated: false,
        editTour: {},
        editSong: { _id: '' },
      },
    );
  });
  it('handles NEW_TOUR', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t1:any = { datetime: `${new Date().toISOString}`, _id: '' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t2:any = { datetime: `${new Date().toISOString}`, _id: '' };
    expect(reducer({
      tour: [t1], tourUpdated: true, editTour: {}, editSong: { _id: '' },
    }, { type: 'NEW_TOUR', data: t2 })).toEqual(
      {
        tour: [t2, t1],
        tourUpdated: true,
        editTour: {},
        editSong: { _id: '' },
      },
    );
  });
  it('handles NEW_TOUR with missing data', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t1:any = { datetime: `${new Date().toISOString}`, _id: '' };
    expect(reducer({
      tour: [t1], tourUpdated: true, editTour: {}, editSong: { _id: '' },
    }, { type: 'NEW_TOUR', data: undefined })).toEqual(
      {
        tour: [t1],
        tourUpdated: true,
        editTour: {},
        editSong: { _id: '' },
      },
    );
  });
  it('handles EDIT_TOUR', () => {
    expect(reducer(undefined, { type: 'EDIT_TOUR', data: { _id: '123', datetime: 'string' } })).toEqual(
      {
        tour: [],
        tourUpdated: false,
        editTour: { _id: '123', datetime: 'string' },
        editSong: { _id: '' },
      },
    );
  });
  it('handles MODIFY_TOUR', () => {
    expect(reducer({
      tour: [{ _id: '456', datetime: '' }, { _id: '123', datetime: '' }],
      tourUpdated: false,
      editTour: {},
      editSong: { _id: '' },
    }, { type: 'UPDATED_TOUR', data: { _id: '123', datetime: 'string' } })).toEqual(
      {
        tour: [{ _id: '456', datetime: '' }, { _id: '123', datetime: 'string' }],
        tourUpdated: true,
        editTour: {},
        editSong: { _id: '' },
      },
    );
  });
});
