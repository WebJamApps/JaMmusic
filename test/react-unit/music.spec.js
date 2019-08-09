import React from 'react';
import { shallow } from 'enzyme';
import { Music } from '../../src/containers/Music';

function setup(data) {
  let wrapper;
  if (data !== null && data !== undefined) {
    wrapper = shallow(<Music images={data} />);
  } else wrapper = shallow(<Music />);
  return { wrapper };
}

describe('/music', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div.page-content').exists()).toBe(true);
    expect(wrapper.find('Intro').dive().find('.intro').exists()).toBe(true);
    expect(wrapper.find('JoshBio').dive().find('.joshBio').exists()).toBe(true);
    expect(wrapper.find('JoshBio').dive().find('Instruments').dive()
      .find('.instruments')
      .exists()).toBe(true);
    expect(wrapper.find('MariaBio').dive().find('.mariaBio').exists()).toBe(true);
    expect(wrapper.find('Wjband').dive().find('.wjBand').exists()).toBe(true);
    expect(wrapper.find('EmersonBio').dive().find('.emersonBio').exists()).toBe(true);
    expect(wrapper.find('BrianBio').dive().find('.brianBio').exists()).toBe(true);
  });
  // it('renders with loading ...', (done) => {
  //   const { wrapper } = setup({ isFetching: true, images: [] });
  //   expect(wrapper.find('h3#appLoading').exists()).toBe(true);
  //   done();
  // });
  // it('renders with error', (done) => {
  //   const { wrapper } = setup({
  //     isFetching: false, images: [], error: 'bad', isError: true,
  //   });
  //   expect(wrapper.find('h3#appErr').exists()).toBe(true);
  //   done();
  // });
  // it('renders with images', (done) => {
  //   const { wrapper } = setup({ isFetching: false, images: [{ _id: 1, url: '', title: '' }], isError: false });
  //   // console.log(wrapper.debug());
  //   expect(wrapper.find('PicSlider').exists()).toBe(true);
  //   done();
  // });
});
