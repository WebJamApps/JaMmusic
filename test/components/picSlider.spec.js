import React from 'react';
import { shallow } from 'enzyme';
import PicSlider from '../../src/components/pic-slider';

function setup() {
  const data = [
    { _id: 1, url: '../static/imgs/ohaf/slideshow2.png' },
    { _id: 2, url: '../static/imgs/ohaf/slideshow3.png' },
    { _id: 3, url: '../static/imgs/ohaf/slideshow4.png' },
    { _id: 4, url: '../static/imgs/ohaf/slideshow5.png' },
    { _id: 5, url: '../static/imgs/ohaf/slideshow6.png' },
  ];

  const props = {
    data,
  };
  const wrapper = shallow(<PicSlider data={data} />);
  return { wrapper, props };
}

describe('picture slider component test', () => {
  it('renders the component', () => {
    const { wrapper } = setup();
    // console.log(wrapper.debug());
    expect(wrapper.find('div').exists()).toBe(true);
    expect(wrapper.find('Caption').first().dive().find('.slider-caption')
      .exists()).toBe(true);
  });
});
