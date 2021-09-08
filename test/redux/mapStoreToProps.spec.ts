/* eslint-disable @typescript-eslint/no-explicit-any */
import mapStoreToProps from '../../src/redux/mapStoreToProps';
import mapStoreToAppTemplateProps from '../../src/redux/mapStoreToAppTemplateProps';

describe('mapStoreToProps', ()=>{
  it('returns', ()=>{
    const store:any = {
      images:{ images:[{}] },
      sc:{},
      auth:{},
      tour:{},
      showTable:{},
    };
    const newStore = mapStoreToProps(store);
    expect(newStore.images.length).toBe(1);
  });
  it('returns for AppTemplate', ()=>{
    const store:any = {
      images:{ images:[{}] },
      sc:{},
      auth:{},
      tour:{},
      showTable:{},
    };
    const newStore = (mapStoreToAppTemplateProps(store) as { images:any[] });
    expect(newStore.images.length).toBe(1);
  });
});
