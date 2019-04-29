import React from 'react';
import { shallow } from 'enzyme';
import { PicSlider } from '../../src/components/pic-slider';

function setup() {
  const data = [
    '../static/imgs/ohaf/slideshow2.png',
    '../static/imgs/ohaf/slideshow3.png',
    '../static/imgs/ohaf/slideshow4.png',
    '../static/imgs/ohaf/slideshow5.png',
    '../static/imgs/ohaf/slideshow6.png'
  ];

  const props = {
    data
  };
  const wrapper = shallow(<PicSlider data={data} />);
  return { wrapper, props };
}

describe('picture slider component test', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    expect(wrapper.find('div').exists()).toBe(true);
  });
});
