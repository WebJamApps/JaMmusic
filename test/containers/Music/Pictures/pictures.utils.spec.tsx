import utils from 'src/containers/Music/Pictures/pictures.utils';
import scc from 'socketcluster-client';
import commonUtils from 'src/lib/utils';

describe('pictures.utils', () => {
  it('createPic successfully', async () => {
    commonUtils.delay = jest.fn();
    const transmit = jest.fn();
    const createMock:any = jest.fn(() => ({ transmit }));
    scc.create = createMock;
    const getPics = jest.fn();
    await utils.createPic(getPics, jest.fn(), {}, { token: 'token' } as any);
    expect(getPics).toHaveBeenCalled();
  });
  it('createPic catches error', async () => {
    commonUtils.delay = jest.fn();
    const transmit = jest.fn(() => { throw new Error('failed'); });
    const createMock:any = jest.fn(() => ({ transmit }));
    scc.create = createMock;
    const getPics = jest.fn();
    await utils.createPic(getPics, jest.fn(), {}, { token: 'token' } as any);
    expect(getPics).not.toHaveBeenCalled();
  });
  it('updates pic successfully', async () => {
    const getPics = jest.fn();
    const editPic = {
      title: '', comments: '', url: '', type: '', _id: undefined,
    };
    const setIsSubmitting = jest.fn();
    const transmit = jest.fn();
    const updateMock: any = jest.fn(() => ({ transmit }));
    scc.create = updateMock;
    await utils.updatePic(editPic, { token: 'token' } as any, getPics, jest.fn(), jest.fn(), setIsSubmitting);
    expect(getPics).toHaveBeenCalled();
  });
  it('updatePic catches error', async () => {
    const transmit = jest.fn(() => { throw new Error('failed'); });
    const updateMock: any = jest.fn(() => ({ transmit }));
    scc.create = updateMock;
    const getPics = jest.fn();
    const editPic = {
      title: '', comments: '', url: '', type: '', _id: undefined,
    };
    const setIsSubmitting = jest.fn();
    await utils.updatePic(editPic, { token: 'token' } as any, getPics, jest.fn(), jest.fn(), setIsSubmitting);
    expect(getPics).not.toHaveBeenCalled();
  });
  it('deletes pic successfully', async () => {
    const auth = { token: 'token' } as any;
    const getPics = jest.fn();
    const setters = { setEditPic: jest.fn, setShowTable: jest.fn(), setIsSubmitting: jest.fn() };
    const transmit = jest.fn();
    const deleteMock: any = jest.fn(() => ({ transmit }));
    scc.create = deleteMock;
    await utils.deletePic('', auth, getPics, setters);
    expect(getPics).toHaveBeenCalled();
  });
  it('deletePic catches error', async () => {
    const auth = { token: 'token' } as any;
    const getPics = jest.fn();
    const setters = { setEditPic: jest.fn, setShowTable: jest.fn(), setIsSubmitting: jest.fn() };
    const transmit = jest.fn(() => { throw new Error('failed'); });
    const deleteMock: any = jest.fn(() => ({ transmit }));
    scc.create = deleteMock;
    await utils.deletePic('', auth, getPics, setters);
    expect(getPics).not.toHaveBeenCalled();
  });
  it('handles event for makeShowHideCaption', () => {
    const setPic = jest.fn();
    const pic = {
      title: '', comments: '', url: '', type: '', _id: undefined,
    };
    let checked: any;
    const evt = { target: { checked } };
    const handler = utils.makeShowHideCaption(setPic, pic);
    handler(evt);
    expect(setPic).toHaveBeenCalled();
  });
});
