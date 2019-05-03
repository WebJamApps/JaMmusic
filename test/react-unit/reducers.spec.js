import reducer from '../../src/store/reducers';

describe('todos reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
        name: 'Web JAM LLC',
        menu: '',
        role: '',
        widescreen: true
      }
    );
  });
  it('should handle UPDATE_NAME', () => {
    expect(
      reducer(undefined, {
        type: 'UPDATE_NAME',
        name: 'booya'
      })
    ).toEqual(
      {
        name: 'booya',
        menu: '',
        role: '',
        widescreen: true
      }
    );
  });
  it('should handle UPDATE_ROLE', () => {
    expect(
      reducer(undefined, {
        type: 'UPDATE_ROLE',
        role: 'supreme commander'
      })
    ).toEqual(
      {
        name: 'Web JAM LLC',
        menu: '',
        role: 'supreme commander',
        widescreen: true
      }
    );
  });
  it('should handle UPDATE_WIDESCREEN', () => {
    expect(
      reducer(undefined, {
        type: 'UPDATE_WIDESCREEN',
        widescreen: false
      })
    ).toEqual(
      {
        name: 'Web JAM LLC',
        menu: '',
        role: '',
        widescreen: false
      }
    );
  });
  it('should handle UPDATE_MENU', () => {
    expect(
      reducer(undefined, {
        type: 'UPDATE_MENU',
        menu: 'wj'
      })
    ).toEqual(
      {
        name: 'Web JAM LLC',
        menu: 'wj',
        role: '',
        widescreen: true
      }
    );
  });
});
