import store from 'src/redux/store';

describe('store', ()=>{
  it('is defined', ()=>{
    expect(store.store).toBeDefined();
    expect(store.persistor).toBeDefined();
  });
});
