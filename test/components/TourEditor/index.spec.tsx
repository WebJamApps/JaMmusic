/* eslint-disable @typescript-eslint/no-explicit-any */

import { shallow } from 'enzyme';
import type { Auth } from 'src/redux/mapStoreToProps';
import { TourEditor, newTourForm } from '../../../src/components/TourEditor';
import { MusicDashboard } from '../../../src/containers/MusicDashboard';

describe('TourEditor', () => {
  it('is defined', () => {
    expect(TourEditor).toBeDefined();
  });
  let wrapper: any;
  const auth = { token: '' } as Auth;
  const anyProp: any = {};
  const scc:any = { transmit: () => { } };
  beforeEach(() => {
    wrapper = shallow<MusicDashboard>(<MusicDashboard
      auth={auth as Auth}
      scc={scc}
      dispatch={jest.fn()}
      editTour={anyProp}
      history={anyProp}
      location={anyProp}
      match={anyProp}
      editSong={anyProp}
      editPic={anyProp}
      images={anyProp}
      showTable={anyProp}
    />);
  });
  it('calls on change', () => {
    wrapper.instance().checkEdit = jest.fn();
    wrapper.instance().setState = jest.fn();
    const evt:any = { preventDefault: () => { }, persist: jest.fn(), target: { id: 'hi', value: 11 } };
    wrapper.instance().onChange(evt);
    expect(wrapper.instance().setState).toHaveBeenCalled();
  });
  it('handles onChange with editTour', () => {
    const wrapper2 = shallow<MusicDashboard>(
      <MusicDashboard
        auth={auth as Auth}
        scc={scc}
        dispatch={jest.fn()}
        editTour={{ venue: 'wjllc' }}
        history={anyProp}
        location={anyProp}
        match={anyProp}
        editSong={anyProp}
        editPic={anyProp}
        images={anyProp}
        showTable={anyProp}
      />,
    );
    wrapper2.instance().checkEdit = jest.fn();
    const evt:any = { preventDefault: () => { }, persist: jest.fn(), target: { id: 'hi', value: '11' } };
    wrapper2.instance().onChange(evt);
    expect(wrapper2.instance().checkEdit).toHaveBeenCalled();
  });
  it('calls handleEditorChange', () => {
    wrapper.instance().checkEdit = jest.fn();
    wrapper.instance().setState = jest.fn((obj) => { expect(obj.venue).toBe('<p>Cool Venue</p>'); });
    wrapper.instance().handleEditorChange('<p>Cool Venue</p>');
  });
  it('calls the tour API', () => {
    wrapper.instance().setState = jest.fn((obJ) => { expect(obJ.redirect).toBe(true); });
    wrapper.instance().createTourApi({ date: '2019-10-10' });
  });
  it('returns the validation', () => {
    wrapper.setState({
      date: '10-24-2019',
      time: '10:00',
      location: 'A place',
      venue: 'Venue',
    });
    const result = wrapper.instance().validateForm();
    expect(result).toBe(false);
  });
  it('creates the tour', () => {
    wrapper.setState({
      date: '10-24-2019',
      time: '10:00',
      location: 'A place',
      venue: 'Venue',
      tickets: '1',
      more: 'yes',
    });
    const result = wrapper.instance().createTour();
    expect(result).toBe(true);
  });
  it('resets the edit form', () => {
    wrapper.instance().setState = jest.fn((obj) => expect(obj.date).toBe(''));
    wrapper.update();
    wrapper.instance().resetEditForm({ preventDefault: () => { } });
  });
  it('calls checkEdit', () => {
    wrapper.instance().checkEdit('<p>Cool Venue</p>');
    wrapper.instance().setState = jest.fn((obj) => { expect(obj.venue).toBe('<p>Cool Venue</p>'); });
  });
  it('calls setFormTime', () => {
    wrapper.instance().setFormTime('12:00 pm');
    wrapper.instance().setState = jest.fn((obj) => { expect(obj.time).toBe('12:00 pm'); });
  });
  it('setSongState when editSong.composer', () => {
    const song:any = { composer: 'Josh' };
    wrapper.instance().setSongState(song);
    expect(wrapper.instance().state.songState.composer).toBe('Josh');
  });
  it('checks edit when editTour', () => {
    const wrapper2 = shallow<MusicDashboard>(<MusicDashboard
      auth={auth}
      scc={scc}
      dispatch={jest.fn()}
      editTour={{
        datetime: '2020-10-10T000',
        _id: '123',
        date: '2020-10-10',
        time: '5 pm',
        tickets: 'free',
        more: '',
        venue: 'beer garden',
        location: 'salem, va',
      }}
      history={anyProp}
      location={anyProp}
      match={anyProp}
      editSong={anyProp}
      editPic={anyProp}
      images={anyProp}
      showTable={anyProp}
    />);
    wrapper2.instance().setState = jest.fn();
    const sO = {
      date: '2020-10-10', time: '5 pm', tickets: 'free', more: '', venue: 'beer garden', location: 'salem, va',
    };
    wrapper2.instance().checkEdit();
    expect(wrapper2.instance().setState).toHaveBeenCalledWith(sO);
  });
  it('checks edit when not editTour', () => {
    const wrapper2 = shallow<MusicDashboard>(<MusicDashboard
      auth={auth}
      scc={scc}
      dispatch={jest.fn()}
      editTour={{}}
      editSong={anyProp}
      history={anyProp}
      location={anyProp}
      match={anyProp}
      editPic={anyProp}
      images={anyProp}
      showTable={anyProp}
    />);
    wrapper2.instance().setState = jest.fn();
    const sO = {
      date: '', time: '', tickets: '', more: '', venue: '', location: '',
    };
    wrapper2.instance().checkEdit();
    expect(wrapper2.instance().setState).toHaveBeenCalledWith(sO);
  });
  it('resets edit form when editTour', () => {
    const wrapper2 = shallow<MusicDashboard>(<MusicDashboard
      auth={auth}
      scc={scc}
      dispatch={jest.fn()}
      editSong={anyProp}
      editTour={{
        datetime: '2020-10-10T000',
        _id: '123',
        date: '2020-10-10',
        time: '5 pm',
        tickets: 'free',
        more: '',
        venue: 'beer garden',
        location: 'salem, va',
      }}
      history={anyProp}
      location={anyProp}
      match={anyProp}
      editPic={anyProp}
      images={anyProp}
      showTable={anyProp}
    />);
    wrapper2.setState({ venue: 'beer garden' });
    wrapper2.instance().setState = jest.fn();
    const evt:any = { preventDefault: () => { } };
    wrapper2.instance().resetEditForm(evt);
    const sO = {
      date: '', time: '', tickets: '', more: '', venue: '', location: '',
    };
    expect(wrapper2.instance().setState).toHaveBeenCalledWith(sO);
  });
  it('calls edit tour api', async () => {
    const wrapper2 = shallow<MusicDashboard>(<MusicDashboard
      auth={auth}
      scc={scc}
      dispatch={jest.fn()}
      editSong={anyProp}
      editTour={{
        datetime: '2020-10-10T000',
        _id: '123',
        date: '2020-10-10',
        time: '5 pm',
        tickets: 'free',
        more: '',
        venue: 'beer garden',
        location: 'salem, va',
      }}
      history={anyProp}
      location={anyProp}
      match={anyProp}
      editPic={anyProp}
      images={anyProp}
      showTable={anyProp}
    />);
    wrapper2.setState({
      date: '2020-10-10',
      time: '5 pm',
      tickets: 'free',
      more: '',
      venue: 'beer garden',
      location: 'salem, va',
    });
    const r = wrapper2.instance().editTourAPI();
    expect(r).toBe(true);
  });
  it('Tour Block is defined', () => {
    const wrapper2 = shallow<MusicDashboard>(<MusicDashboard
      auth={auth}
      scc={scc}
      dispatch={jest.fn()}
      editSong={anyProp}
      editTour={{
        datetime: '2020-10-10T000',
        _id: '123',
        date: '2020-10-10',
        time: '5 pm',
        tickets: 'free',
        more: '',
        venue: 'beer garden',
        location: 'salem, va',
      }}
      history={anyProp}
      location={anyProp}
      match={anyProp}
      editPic={anyProp}
      images={anyProp}
      showTable={anyProp}
    />);
    const instance = wrapper2.instance();
    instance.setState({
      date: '2020-10-10',
      time: '5 pm',
      tickets: 'free',
      more: '',
      venue: 'beer garden',
      location: 'salem, va',
    });
    const wrapper3 = shallow(<TourEditor comp={instance} editTour={instance.props.editTour} />);
    expect(wrapper3.find('.search-outer-table')).toBeDefined();
  });
  it('reaches Tour table delete button', () => {
    const wrapper2 = shallow<MusicDashboard>(<MusicDashboard
      auth={auth}
      scc={scc}
      dispatch={jest.fn()}
      editSong={anyProp}
      editTour={{
        datetime: '',
        _id: '',
        date: '',
        time: '',
        tickets: '',
        more: '',
        venue: '',
        location: '',
      }}
      history={anyProp}
      location={anyProp}
      match={anyProp}
      editPic={anyProp}
      images={anyProp}
      showTable={anyProp}
    />);
    const instance = wrapper2.instance();
    instance.setState({
      date: '',
      time: '',
      tickets: '',
      more: '',
      venue: '',
      location: '',
    });
    const wrapper3 = shallow(<TourEditor comp={instance} editTour={instance.props.editTour} />);
    expect(wrapper3.find('.search-outer-table')).toBeDefined();
  });
  it('newTourForm renders when editTour is missing some attributes', () => {
    const comp:any = {
      state: { location: '' },
      validateForm: jest.fn(),
      fixDate: jest.fn(),
      forms: { makeInput: jest.fn() },
      props: {
        auth,
        scc,
        dispatch: jest.fn(),
        editSong: anyProp,
        editTour: {
          datetime: '',
          _id: '',
          date: '',
          time: '',
          tickets: '',
          more: '',
          venue: '',
          location: '',
        },
        history: anyProp,
        location: anyProp,
        match: anyProp,
      },
    };
    const form = shallow(newTourForm(comp, { _id: '123' }));
    expect(form.find('div.elevation3').exists()).toBe(true);
  });
});
