import React from 'react';
import { shallow } from 'enzyme';
import { PicSlider } from '../../src/components/pic-slider';


test('picture slider component test setup', () => {
  const ps = shallow(<PicSlider data={[]} caption="this is it" />);
});
