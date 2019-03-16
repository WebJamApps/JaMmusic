import { TimePicker } from '../../src/components/time-picker';

describe('++TimePicker tests', () => {
  let tp;
  const data = {
    voName: 'Bogdan Yel',
    voCharityId: '1894724ghjdsfhkjguwr3452352523yr',
    voNumPeopleNeeded: 1,
    voDescription: '',
    voWorkTypes: [],
    voTalentTypes: [],
    voWorkTypeOther: '',
    voTalentTypeOther: '',
    voStartDate: true,
    voStartTime: true,
    voEndDate: true,
    voEndTime: true,
    voContactName: 'Bogdan Yelovich',
    voContactEmail: 'bd.yel@bog.co',
    voContactPhone: '',
    voState: true,
    voCity: true,
    voStreet: true,
    voZipCode: true
  };
  beforeEach(() => {
    tp = new TimePicker();
    tp.data = data;
  });
  it('should update time', (done) => {
    document.body.innerHTML = '<div id="renderer"></div>';
    tp.el = document.getElementById('renderer');
    tp.updateTime(new Date('1995-12-17T13:24:00'));
    done();
  });
  it('should update time in the AM', (done) => {
    document.body.innerHTML = '<div id="renderer"></div>';
    tp.el = document.getElementById('renderer');
    tp.updateTime(new Date('1995-12-17T03:24:00'));
    done();
  });
  it('should show timer on start', (done) => {
    document.body.innerHTML = '<div id="start"><input class="MuiInput-input-11"/></div>';
    tp.type = 'start';
    tp.showTimer();
    done();
  });
  it('should show timer on end', (done) => {
    document.body.innerHTML = '<div id="end"><input class="MuiInput-input-11"/></div>';
    tp.type = 'end';
    tp.showTimer();
    done();
  });
  it('should update time now', (done) => {
    document.body.innerHTML = '<div id="renderer"></div>';
    tp.el = document.getElementById('renderer');
    tp.updateTime(new Date(0));
    done();
  });
  it('should bind element', (done) => {
    document.body.innerHTML = '<div id="renderer"></div>';
    tp.element = document.getElementById('renderer');
    tp.bind();
    done();
  });
  it('should bind element again', (done) => {
    document.body.innerHTML = '<div id="renderer"></div>';
    tp.element = document.getElementById('renderer');
    tp.type = 'start';
    tp.bind();
    done();
  });
});
