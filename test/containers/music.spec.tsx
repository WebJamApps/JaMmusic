import React from 'react';
import { shallow } from 'enzyme';
import { Music } from '../../src/containers/Music';
import PicSlider from '../../src/components/pic-slider';

function setup(data: {url: string; title: string}[]) {
  let wrapper: any;
  if (data !== null && data !== undefined) {
    wrapper = shallow<Music>(<Music images={data} />);
  } else wrapper = shallow(<Music />);
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
  });
  it('renders with images', () => new Promise((done) => {
    const data = [{ url: '', title: '' }];
    const wrapper2 = shallow<Music>(<Music images={data} />);
    expect(wrapper2.find(PicSlider).exists()).toBe(true);
    done();
  }));
});
