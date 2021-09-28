/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { shallow, ShallowWrapper, HTMLAttributes } from 'enzyme';
import { PhotoTable } from '../../../src/components/PhotoTable/PhotoTable';

describe('PhotoTable', () => {
  let props: { auth: any; images: any; },
    wrapper: any, r: ShallowWrapper<HTMLAttributes, any, React.Component<any, any, any>>;
  const controller:any = { deleteData: jest.fn() };
  beforeEach(() => {
    props = {
      auth: { token: 'token' },
      images: [{
        _id: '456', url: 'url', title: 'title', type: 'youthPics', comments: 'showCaption',
      }],
    };
    wrapper = shallow<PhotoTable>(<PhotoTable
      auth={props.auth}
      images={props.images}
      dispatch={(fun) => fun}
      controller={controller}
    />);
  });
  it('renders correctly', () => { expect(wrapper).toMatchSnapshot(); });
  it('sets the columns with customBodyRender', () => {
    expect(typeof wrapper.instance().setColumns).toBe('function');
    wrapper.instance().setColumns();
    const custom = wrapper.instance().state.columns[0].options.customBodyRender('<a href="http://collegelutheran.org/"'
      + ' rel="noopener noreferrer" target="_blank">College Lutheran Church</a>');
    expect(custom.type).toBe('div');
  });
  it('sets the columns with customBodyRender and no data', () => {
    expect(typeof wrapper.instance().setColumns).toBe('function');
    wrapper.instance().setColumns();
    const custom = wrapper.instance().state.columns[0].options.customBodyRender(null);
    expect(custom.type).toBe('div');
  });
  it('sets the columns with customBodyRender for Modify column', () => {
    const buttonjsx = (<button type="button" style={{ display: 'block' }}>howdy</button>);
    expect(typeof wrapper.instance().setColumns).toBe('function');
    wrapper.instance().setColumns();
    const custom = wrapper.instance().state.columns[5].options.customBodyRender(buttonjsx);
    expect(custom.type).toBe('div');
  });
  it('handles click on delete pic button', () => {
    wrapper.update();
    const newArr = wrapper.instance().addThumbs([{ url: 'url', _id: '456' }]);
    const button = shallow(newArr[0].modify);
    button.find('button#deletePic456').simulate('click');
    expect(controller.deleteData).toHaveBeenCalled();
  });
  it('handles click on edit pic button', () => {
    wrapper.instance().editPic = jest.fn();
    wrapper.update();
    const newArr = wrapper.instance().addThumbs([{ url: 'url', _id: '456' }]);
    const button = shallow(newArr[0].modify);
    r = button.find('button#editPic456').simulate('click');
    expect(wrapper.instance().editPic).toHaveBeenCalled();
  });
  it('stores the edit pic data to redux', () => {
    r = wrapper.instance().editPic({});
    expect(r).toBe(true);
  });
});
