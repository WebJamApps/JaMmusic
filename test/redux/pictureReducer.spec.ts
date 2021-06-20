import reducer from '../../src/redux/reducers/pictureReducer';

describe('picture reducer', () => {
  it('handles EDIT_PIC', () => {
    expect(reducer(undefined, { type: 'EDIT_PIC', data: { picTitle: '123', picUrl: 'string' } })).toEqual(
      {
        editPic: { picUrl: 'string', picTitle: '123' },
      },
    );
  });
});
