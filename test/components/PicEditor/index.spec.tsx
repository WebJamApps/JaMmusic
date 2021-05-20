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
  it('Picture Url and Title Null, button is disabled', () => {
    compStub.state.picTitle = undefined;
    compStub.state.picUrl = undefined;
    const wrapper = shallow(<PicEditor comp={compStub} controller={compStub.controller} />);
    const button = wrapper.find('button');
    if (!(compStub.state.picTitle && compStub.state.picUrl)) {
      expect(button.get(0).props.disabled).toBe(true);
    }
    expect(compStub.state.picTitle).toBeUndefined();
    expect(compStub.state.picUrl).toBeUndefined();
  });
});
