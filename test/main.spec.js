import main from '../src/main.tsx';
 
describe('Main', () => {
  it('renders to the root', () => {
    expect(document.getElementById('App')).not.toBe(null);
    expect(document.getElementById('App')).not.toBe(undefined);
    expect(main).toBeDefined();
  });
});
