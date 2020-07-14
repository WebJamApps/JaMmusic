import React from 'react';
import { shallow } from 'enzyme';
import { Music } from '../../src/containers/Music';
import PicSlider from '../../src/components/PicSlider';

function setup(images: { url: string; title: string }[] | undefined) {
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
  });
  it('renders with images', () => new Promise((done) => {
    const data = [{ url: '', title: '' }];
    const wrapper2 = shallow<Music>(<Music images={data} dispatch={jest.fn()} />);
    expect(wrapper2.find(PicSlider).exists()).toBe(true);
    done();
  }));
});
