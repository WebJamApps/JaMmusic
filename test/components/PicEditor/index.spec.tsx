import React from 'react';
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
    const wrapper = shallow(<PicEditor comp={compStub} controller={compStub.controller} />);
    expect(wrapper.find('picsForm')).toBeDefined();
  });
  it('Radio Buttons renders to Dashboard', () => {
    const wrapper = shallow(<PicEditor comp={compStub} controller={compStub.controller} />);
    expect(wrapper.find('radio-buttons')).toBeDefined();
  });
  it('renders the button is disabled', () => {
    const wrapper = shallow(<PicEditor comp={compStub} controller={compStub.controller} />);
    const pButton = wrapper.find('button').get(0);
    expect(pButton.props.disabled).toBe(true);
    expect(pButton).toBeDefined();
  });
  it('renders the button is enabled', () => {
    compStub.state.picTitle = 'Title';
    compStub.state.picUrl = 'Url';
    const wrapper = shallow(<PicEditor comp={compStub} controller={compStub.controller} />);
    const pButton = wrapper.find('button').get(0);
    expect(pButton.props.disabled).toBe(false);
    expect(pButton).toBeDefined();
  });
});
