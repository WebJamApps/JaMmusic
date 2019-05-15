const sinon = require('sinon');
const controller = require('../../server/playlist/PlaylistController');
const sequalize = require('../../config/db');

const resStub = { status() { return { json(obj) { return Promise.resolve(obj); } }; } };
describe('PlaylistController', () => {
  afterAll((done) => {
    sequalize.close();
    done();
  });
  it('catches error on findAll', async () => {
    const cMock = sinon.mock(controller.model);
    cMock.expects('findAll').rejects(new Error('bad'));
    let result;
    try { result = await controller.find({}, resStub); } catch (e) { throw e; }
    expect(result.message).toBe('bad');
    cMock.restore();
  });
  it('catches error on model.create', async () => {
    const cMock = sinon.mock(controller.model);
    cMock.expects('create').rejects(new Error('bad'));
    const countM = sinon.mock(controller.model);
    countM.expects('count').resolves(1);
    let result;
    try { result = await controller.create({ body: {} }, resStub); } catch (e) { throw e; }
    expect(result.message).toBe('bad');
    cMock.restore();
    countM.restore();
  });
  it('catches error on model.count', async () => {
    const countM = sinon.mock(controller.model);
    countM.expects('count').rejects(new Error('bad'));
    let result;
    try { result = await controller.create({ body: {} }, resStub); } catch (e) { throw e; }
    expect(result.message).toBe('bad');
    countM.restore();
  });
  it('catches error on update with findOne', async () => {
    const cMock = sinon.mock(controller.model);
    cMock.expects('findOne').rejects(new Error('bad'));
    let result;
    try { result = await controller.update({ params: { id: '3' }, body: {} }, resStub); } catch (e) { throw e; }
    expect(result.message).toBe('bad');
    cMock.restore();
  });
  it('returns error on update with findOne does not find a playlist', async () => {
    const cMock = sinon.mock(controller.model);
    cMock.expects('findOne').resolves(null);
    let result;
    try { result = await controller.update({ params: { id: '3' }, body: {} }, resStub); } catch (e) { throw e; }
    expect(result.message).toBe('incorrect playlist id');
    cMock.restore();
  });
  it('returns error on update with save', async () => {
    const cMock = sinon.mock(controller.model);
    cMock.expects('findOne').resolves({ id: '999999999999' });
    let result;
    try { result = await controller.update({ params: { id: '3' }, body: {} }, resStub); } catch (e) { throw e; }
    expect(result.message).toBe('playList.set is not a function');
    cMock.restore();
  });
  it('catches error on destroy', async () => {
    const cMock = sinon.mock(controller.model);
    cMock.expects('destroy').rejects(new Error('bad'));
    let result;
    try { result = await controller.remove({ params: { id: '3' }, body: {} }, resStub); } catch (e) { throw e; }
    expect(result.message).toBe('bad');
    cMock.restore();
  });
  it('returns error when no rows are deleted', async () => {
    const cMock = sinon.mock(controller.model);
    cMock.expects('destroy').resolves(0);
    let result;
    try { result = await controller.remove({ params: { id: '3' }, body: {} }, resStub); } catch (e) { throw e; }
    expect(result.message).toBe('nothing was deleted');
    cMock.restore();
  });
});
