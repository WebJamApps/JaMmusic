/* eslint-disable @typescript-eslint/no-explicit-any */
import mapStoreToProps from 'src/redux/mapStoreToProps';
import mapStoreToAppTemplateProps from 'src/redux/mapStoreToAppTemplateProps';

describe('mapStoreToProps', () => {
  it('returns', () => {
    const store:any = {
      sc: { scc: {} },
    };
    const newStore = mapStoreToProps(store);
    expect(newStore.scc).toBeDefined();
  });
  it('returns for AppTemplate', () => {
    const store:any = {
      sc: { userCount: 1 },
    };
    const newStore = (mapStoreToAppTemplateProps(store));
    expect(newStore.userCount).toBe(1);
  });
});
