import main from '../../src/main'; // eslint-disable-line no-unused-vars

describe('Main', () => {
  it('renders to the root', () => {
    expect(document.getElementById('App')).not.toBe(null);
    expect(document.getElementById('App')).not.toBe(undefined);
  });
});
