import reducer from '../../src/redux/reducers/pictureReducer';

describe('picture reducer', () => {
  it('handles EDIT_PIC', () => {
    expect(reducer(undefined, { type: 'EDIT_PIC', data: { url: 'string', title: '123' } })).toEqual(
      {
        editPic: { url: 'string', title: '123' },
      },
    );
  });
});
