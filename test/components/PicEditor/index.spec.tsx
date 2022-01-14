
import { shallow } from 'enzyme';
import { PicEditor } from '../../../src/components/PicEditor';

describe('Picture Edtior', () => {
  let compStub:any = {};
  beforeEach(() => {
    compStub = {
      state: { picTitle: '', picUrl: '', showCaption: '' },
      props: { editPic: { title: '', url: '', showCaption: '' }, auth: {}, dispatch: jest.fn() },
      controller: {},
      setState: jest.fn(),
    };
  });

  it('Picture From renders to Dashboard', () => {
    const wrapper = shallow(<PicEditor comp={compStub} controller={compStub.controller} editPic={compStub.props.editPic} />);
    expect(wrapper.find('picsForm')).toBeDefined();
  });
  it('Radio Buttons renders to Dashboard', () => {
    const wrapper = shallow(<PicEditor comp={compStub} controller={compStub.controller} editPic={compStub.props.editPic} />);
    expect(wrapper.find('radio-buttons')).toBeDefined();
  });
  it('renders the button is disabled', () => {
    const wrapper = shallow(<PicEditor comp={compStub} controller={compStub.controller} editPic={compStub.props.editPic} />);
    const pButton = wrapper.find('button').get(0);
    expect(pButton.props.disabled).toBe(true);
    expect(pButton).toBeDefined();
  });
  it('renders the button is enabled', () => {
    compStub.state.title = 'Title';
    compStub.state.url = 'Url';
    const wrapper = shallow(<PicEditor comp={compStub} controller={compStub.controller} editPic={compStub.props.editPic} />);
    const pButton = wrapper.find('button').get(0);
    expect(pButton.props.disabled).toBe(false);
    expect(pButton).toBeDefined();
  });
  it('renders cancel button is enabled', () => {
    compStub.state.title = '';
    compStub.state.url = '';
    const editPic = { _id: '5', title: 'title', url: 'url' };
    const wrapper = shallow(<PicEditor comp={compStub} controller={compStub.controller} editPic={editPic} />);
    const pButton = wrapper.find('cancel-edit-pic');
    expect(pButton).toBeDefined();
  });
});
