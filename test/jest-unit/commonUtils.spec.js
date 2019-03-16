const sinon = require('sinon');
const filesaver = require('file-saver');
const utils = require('../../src/commons/utils');

const event = [{
  _id: '234',
  voName: 'run the swamp',
  voCharityId: '123',
  voCharityName: 'howdy',
  voloppId: 1,
  voNumPeopleNeeded: 1,
  voDescription: '',
  voWorkTypes: [],
  voTalentTypes: [],
  voWorkTypeOther: '',
  voTalentTypeOther: '',
  voStartDate: '2017-01-01T10:14:32.909Z',
  voStartTime: '10:10 am',
  voEndDate: '2018-11-14T10:14:32.909Z',
  voEndTime: '8:15pm',
  voContactName: '',
  voContactEmail: '',
  voContactPhone: ''
}];

describe('the common utils', () => {
  beforeEach((done) => {
    jest.useFakeTimers();
    done();
  });
  it('does nothing', (done) => {
    done();
  });
  it('should test util compareTime functions', () => {
    expect(utils.compareTime('11:07 pm', '10:18 pm')).toBeTruthy();
    expect(utils.compareTime('11:07 pm', '10:18 am')).toBeTruthy();
    expect(utils.compareTime('11:07 pm', '')).toBeFalsy();
    expect(utils.compareTime('11:07 pm', '11:18 pm')).toBeFalsy();
    expect(utils.compareTime('11:37 pm', '11:18 pm')).toBeTruthy();
    expect(utils.compareTime('10:37 pm', '11:18 pm')).toBeFalsy();
  });
  it('should format a 12hr time', () => {
    expect(utils.getTime(13, 30)).toBe('1:30 pm');
    expect(utils.getTime(11, 30)).toBe('11:30 am');
    expect(utils.getTime(0, 20)).toBe('12:20 am');
  });
  it('should format a datetime', () => {
    utils.formatDate(new Date());
    utils.fixDates(event);
  });
  it('should mark past dates', () => {
    utils.markPast(event, utils.formatDate);
  });
  it('makes a tab delimted text file', async () => {
    let cb;
    const fMock = sinon.mock(filesaver);
    fMock.expects('saveAs').resolves(true);
    try {
      cb = await utils.makeCSVfile({ fetch() { return Promise.resolve({ json() { return Promise.resolve({}); } }); } }, '', '');
      expect(cb).toBe(true);
    } catch (e) { throw e; }
    fMock.restore();
  });
  it('should filter selected module', () => {
    utils.filterSelected({ selectedFilter: [], filters: [{ value: '', filterby: '' }] });
    utils.filterSelected({ selectedFilter: ['hello', 'sir'], filters: [{ value: '', filterby: 'hello' }, { value: '', filterby: 'syre' }] });
  });
  it('should mark filter dropdown', () => {
    utils.makeFilterDropdown([], [{ attrib: 'hello' }], 'attrib');
  });
  it('should show checkboxes', () => {
    document.body.innerHTML = '<div class="errorMessage"></div><div id="delete" style="display: block;"></div>';
    utils.showCheckboxes('delete', true);
    utils.showCheckboxes('delete', false);
  });
  it('should enable submit button and hide validation errors on create charity form', (done) => {
    document.body.innerHTML = '<div><button class="updateButton"></button><div id="valErrors" class="errorMessage"></div>'
    + '<div id="delete" style="display: block;"></div></div>';
    const result = utils.updateCanSubmit([{ valid: true }], { validType2: true });
    expect(result).toBe(null);
    done();
  });
  it('should enable submit button and hide validation errors on update charity form', (done) => {
    document.body.innerHTML = '<div><button class="updateButton"></button><div id="valErrors" class="errorMessage"></div>'
    + '<div id="delete" style="display: block;"></div></div>';
    const result = utils.updateCanSubmit([{ valid: true }], { validType2: true, update: true, counter: 8 });
    expect(result).toBe(null);
    done();
  });
  it('should not enable submit button and it should hide validation errors on update charity form', (done) => {
    document.body.innerHTML = '<div><button class="updateButton"></button><div id="valErrors" class="errorMessage"></div>'
    + '<div id="delete" style="display: block;"></div></div>';
    const result = utils.updateCanSubmit([{ valid: true }], { validType2: true, update: true, counter: 7 });
    expect(result).toBe(null);
    done();
  });
  it('should not display the submit button when form is invalid', (done) => {
    document.body.innerHTML = '<div><button class=""></button><div id="valErrors" class="errorMessage"></div>'
    + '<div id="delete" style="display: block;"></div></div>';
    const result = utils.updateCanSubmit([{ valid: false }], { validType2: true, update: true, counter: 7, buildErrors() {} });
    expect(result).toBe(false);
    done();
  });
});
