import React from 'react';
import { shallow } from 'enzyme';
import { Music } from '../../../src/containers/Music';
import PicSlider from '../../../src/components/PicSlider';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setup(images: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: any;
  if (images) {
    wrapper = shallow<Music>(<Music images={images} dispatch={jest.fn()} />);
  } else wrapper = shallow(<Music dispatch={jest.fn()} />);
  return { wrapper };
}

describe('/music', () => {
  it('renders the component', () => {
    const { wrapper } = setup(undefined);
    expect(wrapper.find('div.page-content').exists()).toBe(true);
    expect(wrapper.find('Intro').dive().find('.intro').exists()).toBe(true);
    expect(wrapper.find('JoshBio').dive().find('.joshBio').exists()).toBe(true);
    expect(wrapper.find('JoshBio').dive().find('Instruments').dive()
      .find('.instruments')
      .exists()).toBe(true);
    expect(wrapper.find('MariaBio').dive().find('.mariaBio').exists()).toBe(true);
    expect(wrapper.find('WjBand').dive().find('.wjBand').exists()).toBe(true);
  });
  it('renders with images', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data:any = [{ url: '', title: '' }];
    const wrapper2 = shallow<Music>(<Music images={data} dispatch={jest.fn()} />);
    expect(wrapper2.find(PicSlider).exists()).toBe(true);
    expect(wrapper2).toMatchSnapshot();
  });
  it('renders when joshandmariamusic.com', () => {
    process.env.APP_NAME = 'joshandmariamusic.com';
    const { wrapper } = setup(undefined);
    expect(wrapper.find('div.page-content').exists()).toBe(true);
    expect(wrapper.find('Intro').dive().find('.intro').exists()).toBe(true);
  });
});
