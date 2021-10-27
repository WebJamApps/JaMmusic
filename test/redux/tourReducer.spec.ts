/* eslint-disable @typescript-eslint/no-explicit-any */
import reducer from '../../src/redux/reducers/tourReducer';

describe('tour reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '', data: { datetime: '', _id: '' } })).toEqual(
      {
        tour: [],
        tourUpdated: false,
        editTour: {},
      },
    );
  });
  it('handles RESET_TOUR', () => {
    const action:any = { type: 'RESET_TOUR' };
    expect(reducer(undefined, action)).toEqual(
      {
        tour: [],
        tourUpdated: false,
        editTour: {},
      },
    );
  });
  it('handles ALL_TOUR', () => {
    const data:any = [{ _id: 'tourid' }];
    expect(reducer(undefined, { type: 'ALL_TOUR', data }).tour.length).toBe(1);
  });
  it('handles NEW_TOUR', () => {
    const t1:any = { datetime: `${new Date().toISOString}`, _id: '' };
    const t2:any = { datetime: `${new Date().toISOString}`, _id: '' };
    expect(reducer({
      tour: [t1], tourUpdated: true, editTour: {},
    }, { type: 'NEW_TOUR', data: t2 })).toEqual(
      {
        tour: [t2, t1],
        tourUpdated: true,
        editTour: {},
      },
    );
  });
  it('handles NEW_TOUR with missing data', () => {
    const action:any = { type: 'NEW_TOUR', data: undefined };
    const t1:any = { datetime: `${new Date().toISOString}`, _id: '' };
    expect(reducer({
      tour: [t1], tourUpdated: true, editTour: {},
    }, action)).toEqual(
      {
        tour: [t1],
        tourUpdated: false,
        editTour: {},
      },
    );
  });
  it('handles EDIT_TOUR', () => {
    expect(reducer(undefined, { type: 'EDIT_TOUR', data: { _id: '123', datetime: 'string' } })).toEqual(
      {
        tour: [],
        tourUpdated: false,
        editTour: { _id: '123', datetime: 'string' },
      },
    );
  });
  it('handles MODIFY_TOUR', () => {
    expect(reducer({
      tour: [{ _id: '456', datetime: '' }, { _id: '123', datetime: '' }],
      tourUpdated: false,
      editTour: {},
    }, { type: 'UPDATED_TOUR', data: { _id: '123', datetime: 'string' } })).toEqual(
      {
        tour: [{ _id: '456', datetime: '' }, { _id: '123', datetime: 'string' }],
        tourUpdated: true,
        editTour: {},
      },
    );
  });
});
